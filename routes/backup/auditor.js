const express = require('express');
const generateToken = require('../../common/jwt-auth').generateToken;
const router = express.Router();
const { Appointment, Client, Branch } = require('../../models');
const { deleteOldAppointment } = require('../common/appointment');
const { sendSubscribeMessage } = require('../common/wechat');
const { getCalendar } = require('../common/holiday')

router.post('/login', async (req, res) => { 
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ code: 1, message: '缺少参数 username' });
    }
    const token = generateToken({ type: 'a' });
    res.json({ code: 0, message: '登录成功', data: { jwtToken: token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});

const permissionCheck = async (req, res, next) => { 
  // const jwtPayload = req.jwtPayload;
  // if (jwtPayload.type !== 'a') {
  //   return res.status(401).json({ code: 1, message: '无权限' });
  // }
  next()
}


// 分页获取预约列表,  status, clientId, managerId 为可选项目，如果有传，则更具传入的值进行筛选
// GET {{baseUrl}}/api/v1/auditor/appointments
router.get('/appointments', permissionCheck, async (req, res) => { 
  try {
    const {
      page = 1,
      size = 10,
      status,
      accountNature,
      enterpriseName,
      legalPersonName,
      legalPersonIDNumber,
      contactName,
      contactInfo,
      managerAccount,
      managerName,
      branchId,
      clientFillInTime
    } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (enterpriseName) {
      query['qrCodeInfo.enterpriseName'] = enterpriseName;
    }
    if (legalPersonName) {
      query['clientFillIn.baseInfo.legalPersonName'] = legalPersonName;
    }
    if (accountNature) {
      query['managerFillIn.basicInfo.accountNature'] = accountNature;
    }
    if (legalPersonIDNumber) {
      query['clientFillIn.baseInfo.legalPersonIDNumber'] = legalPersonIDNumber;
    }
    if (contactName) {
      query['managerFillIn.basicInfo.contactName'] = contactName;
    }
    if (contactInfo) {
      query['managerFillIn.basicInfo.contactInfo'] = contactInfo;
    }
    if (managerAccount) {
      query['qrCodeInfo.managerStaffId'] = managerAccount;
    }
    if (managerName) {
      query['qrCodeInfo.managerName'] = managerName;
    }
    if (branchId) {
      query['clientFillIn.appointmentInfo.branch.branchId'] = branchId;
    }

    if (clientFillInTime) { 
      const date = new Date(clientFillInTime);
      const nextDate = new Date(clientFillInTime);
      nextDate.setDate(date.getDate() + 1);
      query.clientFillInTime = {
        $gte: date,
        $lt: nextDate,
      }
    }

    const appointments = await Appointment.find(query).skip((page - 1) * size).limit(size).exec();
    const count = await Appointment.countDocuments(query).exec();

    const resData = appointments.map((appointment) => { 
      return {
        _id: appointment._id,
        status: appointment.status,
        accountNature: appointment?.managerFillIn?.basicInfo?.accountNature,
        enterpriseName: appointment.qrCodeInfo.enterpriseName,
        clientFillInTime: appointment.clientFillInTime,
        legalPersonName: appointment?.clientFillIn?.baseInfo?.legalPersonName,
        legalPersonIDNumber: appointment?.clientFillIn?.baseInfo?.legalPersonIDNumber,
        contactName: appointment?.managerFillIn?.basicInfo?.contactName,
        contactInfo: appointment?.managerFillIn?.basicInfo?.contactInfo,
        managerName: appointment?.qrCodeInfo?.managerName,
        managerAccount: appointment?.qrCodeInfo?.managerStaffId,
        branchId: appointment?.clientFillIn?.appointmentInfo?.branch?.branchId,
      }
    })

    res.json({
      code: 0,
      message: '获取成功',
      data: resData,
      pagination: {
        totalPage: Math.ceil(count / size),
        page: Number(page),
        size: Number(size),
        total: count,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

// 获取预约详情
router.get('/appointment/:id', permissionCheck, async (req, res) => { 
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).exec();
    if (!appointment) { 
      return res.status(404).json({ code: 1, message: '未找到该预约' });
    }
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.post('/appointment/audit/update-branch', permissionCheck, async (req, res) => { 
  try {

    const { _id, branchId } = req.body;
    
    const branch = await Branch.findById(_id);
    if (!branch) {
      return res.status(404).json({ code: 1, message: '未找到该网点' });
    }
    branch.branchId = branchId;
    await branch.save();

    res.json({ code: 0, message: '设置成功', branch });

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

// appointment
router.post('/appointment/audit/:id', permissionCheck, async (req, res) => { 
  try {
    const { id } = req.params;
    const { status, auditInfo, qrCodeInfo, managerFillIn, clientFillIn, expireTime } = req.body;

    console.log(req.body)

    if (!status) { 
      return res.status(400).json({ code: 1, message: '缺少参数 status' });
    }

    const valideStatus = [
      'waittingForScan', // 待扫码的状态
      'returned', // B客户经理 退回，待C客户修改
      'managerToFill', // 客户经理未补录  提交这一刻，关联 clientC
      'managerFilling', // 客户经理填表中
      'auditting', // 柜台审核中
      'cancelled', // C客户取消申请
      'auditPassed', 'auditFailed', ]

    if (!valideStatus.includes(status)) {
      return res.status(400).json({
        code: 1, message: `status 参数错误，status 只能是以下值之一：${valideStatus.join(',')}` });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '未找到该预约' });
    }

    if (appointment.status !== 'auditting') {
      return res.status(400).json({ code: 1, message: '状态错误，该预约不能审核' });
    }
    appointment.status = status;

    if (status === 'auditFailed') {
      await deleteOldAppointment(appointment)
    }

    if (expireTime) {
      appointment.expireTime = new Date(expireTime);
    }

    appointment.auditInfo = auditInfo;
    appointment.auditTime = Date.now();

    // 如果存在  req.body.qrCodeInfo, managerFillIn, clientFillIn
    // 深度遍历 appointment.qrCodeInfo, managerFillIn, clientFillIn 的每一个属性，替换掉 appointment.qrCodeInfo, managerFillIn, clientFillIn 对应属性的值，注意对象不要直接替换，只对值进行替换

    const deepReplace = (target, source) => { 
      for (const key in source) {
        if (typeof source[key] === 'object') {
          deepReplace(target[key], source[key])
        } else {
          target[key] = source[key]
        }
      }
    }

    if (qrCodeInfo) {
      deepReplace(appointment.qrCodeInfo, qrCodeInfo)
    }
    if (managerFillIn) {
      deepReplace(appointment.managerFillIn, managerFillIn)
    }
    if (clientFillIn) {
      deepReplace(appointment.clientFillIn, clientFillIn)
    }

    await Appointment.updateOne({ _id: id }, appointment).exec()

    sendTemplateMessage(appointment);

    res.json({ code: 0, message: '审核成功', data: appointment });

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})


const sendTemplateMessage = async (appointment) => {
  const client = await Client.findById(appointment.clientId);
  if (!client.openid) {
    return;
  }

  const data = {
    time4: {
      value:  appointment?.clientFillIn?.date,
      color: "#173177",
    },
    thing5: {
      value: appointment.status === 'auditPassed' ? '预约成功' : '预约审核未通过',
      color: "#173177",
    },
  };

  sendSubscribeMessage(client.openid, '63L3m4h4tlqkagwVZaile8ZhtgRhsTiyWeKTDxChNAw', `pages/appointment-detail/index?id=${appointment._id}`, data)
};

// 测试发送模版消息
/*
### 测试发送模版消息
POST {{baseUrl}}/api/v1/auditor/appointment/audit/{{appointmentId}}/sendTemplateMessage
Content-Type: application/json
Authorization: {{jwtTokenA}}

{
    "touser": "xxxxxx",
    "template_id": "xxxxxx",
    "data": ""
}
*/
router.post('/appointment/audit/:id/sendTemplateMessage', permissionCheck, async (req, res) => { 
  try {
    // const { id } = req.params;
    const { touser, template_id, data, page = '' } = req.body;

    // const appointment = await Appointment.findById(id);
    // if (!appointment) {
    //   return res.status(404).json({ code: 1, message: '未找到该预约' });
    // }

    // if (appointment.status !== 'auditting') {
    //   return res.status(400).json({ code: 1, message: '状态错误，该预约不能审核' });
    // }

    const result = await sendSubscribeMessage(touser, template_id, page, data);

     

    res.json({ code: 0, message: '发送成功', data: result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})


router.post('/appointment/audit/get-calendar/:year', permissionCheck, async (req, res) => { 
  try {
    const { year } = req.params;
    const calendar = await getCalendar(year);

     

    res.json({ code: 0, message: '发送成功', data: calendar });

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})



module.exports = router;
