const express = require('express');
const { Client, Appointment, Timetable, Branch } = require('../../models');
const { generateToken } = require('../../common/jwt-auth');
const { getTPlusNWorkDays } = require('../common/holiday');
const { deleteOldAppointment } = require('../common/appointment');
const { codeForLoginInfo, decodeEncriptData } = require('../common/wechat');
const { MAX_APPOINTMENT_NUM, SGB_BASE_URL } = require('../../config');
const axios = require('axios');

const router = express.Router();

router.post('/wx-login', async (req, res) => {
  try {
    const { code, } = req.body;

    if (!code) {
      return res.status(400).json({ code: 1, message: '缺少参数' });
    }

    const { openid, session_key } = await codeForLoginInfo(code);
    let client = await Client.findOne({ openid })
    if (!client) {
      // 创建客户
      console.log(`Creating client ${openid}`)
      client = await Client.create({
        openid,
        clientInfo: {},
      });
    }

    client.session_key = session_key;
    await client.save();

    const token = generateToken({ type: 'c', id: client._id });
    res.json({ code: 0, message: '登录成功', data: { jwtToken: token, clientInfo: client.clientInfo } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});



router.post('/login', async (req, res) => {
  try {
    const { openId, clientInfo } = req.body;

    if (!openId || !clientInfo) {
      return res.status(400).json({ code: 1, message: '缺少参数' });
    }

    let client = await Client.findOne({ openId })
    if (!client) {
      // 创建客户
      console.log(`Creating client ${openId}`)
      client = await Client.create({
        openId,
        clientInfo
      });
    }
    const token = generateToken({ type: 'c', id: client._id });
    res.json({ code: 0, message: '登录成功', data: { jwtToken: token, clientInfo: client.clientInfo } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});

const permissionCheck = async (req, res, next) => { 

  try {
    const jwtPayload = req.jwtPayload;
    if (jwtPayload.type !== 'c') {
      return res.status(401).json({ code: 1, message: '无权限' });
    }
    const client = await Client.findById(jwtPayload.id);
    if (!client) {
      return res.status(401).json({ code: 1, message: '未找到该客户' });
    }
    req.client = client;
    next()
  } catch (error) {
    res.status(401).json({ code: 1, message: '授权错误' });
  }
}

router.post('/save-client-info', permissionCheck, async (req, res) => {
  try {
    const { clientInfo } = req.body;
    const client = req.client;
    client.clientInfo = clientInfo;
    await client.save();
    res.json({ code: 0, message: '保存成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});

router.post('/decode-encripted-data', permissionCheck, async (req, res) => { 
  try {
    const { encryptedData, iv } = req.body;
    const { session_key } = req.client;

    if (!session_key) {
      return res.status(400).json({ code: 1, message: '非微信 login，无 session_key，无法解密数据' });
    }

    const data = decodeEncriptData(encryptedData, iv, session_key);
    res.json({ code: 0, message: '解密成功', data });
  } catch (error) {
    console.error(error);
    res.status(401).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/timetable/:id', permissionCheck, async (req, res) => { 
  try {
    const branchId = req.params.id;
    const numOfDays = parseInt(req.query.num) || 5;
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ code: 1, message: '未找到该支行信息' });
    }
    const today = new Date();
    // const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const toDayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
    const workDateList = await getTPlusNWorkDays(toDayString, numOfDays)

    // console.log('getTPlusNWorkDays workDateList', workDateList)
  
    const timetableMap = {}
  
    // 对于 workDateList 中的每个日期，如果 branch.timetable[workDate] 不存在，则创建一个 Timetable
    await Promise.all(
      workDateList.map(async (workDate) => {
        if (!branch.timetable) { 
          branch.timetable = {}
        }
        if (!branch.timetable.get(workDate)) {
          console.log(`create timetable for ${branch.name} on ${workDate}`)
          const timetable = await Timetable.create({
            date: workDate,
            branch: branchId,
            morningAppointments: [],
            afternoonAppointments: [],
          });
          branch.timetable.set(workDate, timetable._id.toString());
          timetableMap[workDate] = timetable;
        } else {
          const timetable = await Timetable.findById(branch.timetable.get(workDate));
          timetableMap[workDate] = timetable;
        }
      })
    );
    await branch.save();
    res.json({ code: 0, message: '获取成功', data: timetableMap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/current', permissionCheck, async (req, res) => { 
  try {
    // 获取 表中 clientId 为自己 且状态 仅为 returned 或者 managerToFill 的预约
    const currentAppointment = await Appointment.findOne({
      clientId: req.client._id,
      status: { $in: ['returned', 'managerToFill', 'managerFilling', 'auditting'] },
    })
    return res.json({ code: 0, message: '获取成功', data: currentAppointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/history', permissionCheck, async (req, res) => { 
  try {
    const history = await Appointment.find({
      clientId: req.client._id,
      status: { $nin: ['returned', 'managerToFill', 'managerFilling', 'auditting'] },
    })
    return res.json({ code: 0, message: '获取成功', data: history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/qrcode/:id', permissionCheck, async (req, res) => { 
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '找不到该预约' });
    }
    if (appointment.status !== 'waittingForScan') {
      return res.status(400).json({ code: 1, message: '该预约已被使用' });
    }
    return res.json({ code: 0, message: '获取成功', data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/appointment/:id', permissionCheck, async (req, res) => { 
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '找不到该预约' });
    }
    return res.json({ code: 0, message: '获取成功', data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.post('/join', permissionCheck, async (req, res) => { 
  try {
    const { appointmentId, clientFillIn } = req.body;

    if (!appointmentId || !clientFillIn ) { 
      return res.status(400).json({ code: 1, message: '缺少参数' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '找不到二维码对应的预约，可能被撤销，请联系客户经理' });
    }
    if (appointment.clientId || appointment.status !== 'waittingForScan') {
      return res.status(400).json({ code: 1, message: '该二维码已经被申请' });
    }
    if (appointment.isExpired) {
      return res.status(400).json({ code: 1, message: '该二维码已过期' });
    }

    const currentAppointment = await Appointment.findOne({
      clientId: req.client._id,
      status: { $in: ['returned', 'managerToFill', 'auditting'] },
    })

    if (currentAppointment) {
      return res.status(400).json({ code: 1, message: '您已经有一个正在进行的预约' });
    }

    // 处理时间表
    const branch = await Branch.findById(clientFillIn.branchId);
    if (!branch) {
      return res.status(404).json({ code: 1, message: '找不到该支行信息' });
    }

    const timetable = await Timetable.findById(branch.timetable.get(clientFillIn.date));
    if (!timetable) { 
      return res.status(404).json({ code: 1, message: '无效的预约时间' });
    }

    const appointments = timetable[clientFillIn.period === 'morning' ? 'morningAppointments' : 'afternoonAppointments'];

    if (appointments.length >= MAX_APPOINTMENT_NUM) {
      return res.status(400).json({ code: 1, message: '该时间段预约已满，请选择其他时间段' });
    }
    appointments.push(appointment._id);

    await timetable.save();

    // 处理预约信息
    appointment.clientId = req.client._id;
    appointment.clientFillIn = clientFillIn;
    appointment.status = 'managerToFill';
    appointment.clientFillInTime = new Date();
    await appointment.save();

    return res.json({ code: 0, message: '预约成功', });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})



router.post('/update', permissionCheck, async (req, res) => { 
  try {
    const { appointmentId, clientFillIn } = req.body;

    if (!appointmentId || !clientFillIn ) { 
      return res.status(400).json({ code: 1, message: '缺少参数' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '找不到二维码对应的预约' });
    }
    if (appointment.clientId.toString() !== req.client._id.toString()) {
      return res.status(401).json({ code: 1, message: '无权限' });
    }
    if (
      appointment.status !== 'managerToFill'
      && appointment.status !== 'returned'
      && appointment.status !== 'cancelled'
      && appointment.status !== 'auditFailed'
    ) {
      return res.status(400).json({ code: 1, message: '该预约不可修改' });
    }

    // 处理时间表
    const branch = await Branch.findById(clientFillIn.branchId);
    if (!branch) {
      return res.status(404).json({ code: 1, message: '找不到该支行信息' });
    }
    const timetable = await Timetable.findById(branch.timetable.get(clientFillIn.date));
    if (!timetable) { 
      return res.status(404).json({ code: 1, message: '无效的预约时间' });
    }
    const appointments = timetable[clientFillIn.period === 'morning' ? 'morningAppointments' : 'afternoonAppointments'];
    if (appointments.length >= MAX_APPOINTMENT_NUM) {
      return res.status(400).json({ code: 1, message: '该时间段预约已满，请选择其他时间段' });
    }
    appointments.push(appointment._id);
    await timetable.save();

    await deleteOldAppointment(appointmentId);

    // 处理预约信息
    appointment.clientId = req.client._id;
    appointment.clientFillIn = clientFillIn;
    appointment.status = 'managerToFill';
    // await appointment.save();
    await Appointment.updateOne({ _id: appointmentId }, appointment).exec()

    return res.json({ code: 0, message: '修改成功', data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.post('/cancel', permissionCheck, async (req, res) => { 
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '找不到该预约' });
    }
    if (appointment.clientId.toString() !== req.client._id.toString()) {
      return res.status(401).json({ code: 1, message: '无权限' });
    }
    if (appointment.status !== 'managerToFill' && appointment.status !== 'returned') {
      return res.status(400).json({ code: 1, message: '该预约不可取消' });
    }

    await deleteOldAppointment(appointmentId);
    appointment.status = 'cancelled';
    
    // 为 appointment.clientFillIn 添加 cancelTime 字段
    appointment.clientFillIn.cancelTime = new Date();

    // await appointment.save();
    await Appointment.updateOne({ _id: appointmentId }, appointment).exec()

    return res.json({ code: 0, message: '取消成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/sms-code', permissionCheck, async (req, res) => {
  try {
    const { appointmentId, phone } = req.query;

    if (!appointmentId || !phone) {
      return res.status(400).json({ code: 1, message: '缺少参数' });
    }

    
    // ${SGB_BASE_URL}/api/v1/swan/sgb-service/ocr/mob/sms
    const result = await axios.post(`${SGB_BASE_URL}/api/v1/swan/sgb-service/ocr/mob/sms`, {
      mob: phone.toString(),
    })
    if (result.status === 200) { 
      res.json({
        code: 0, message: '发送成功'
      })
      return
    } else {
      res.status(500).json({ code: 1, message: '服务器错误', error: result.data.error });
      return
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.post('/sms-validate', permissionCheck, async (req, res) => { 
  try {
    const { appointmentId, smsCode, phone } = req.body;

    if (!appointmentId || !smsCode || !phone) {
      return res.status(400).json({ code: 1, message: '缺少参数' });
    }
    
    console.log(`POST ${SGB_BASE_URL}/api/v1/swan/sgb-service/ocr/mob/sms/_check`, {
      mob: phone.toString(),
      verifyCode: smsCode.toString(),
    })

    const result = await axios.post(`${SGB_BASE_URL}/api/v1/swan/sgb-service/ocr/mob/sms/_check`, {
      mob: phone.toString(),
      verifyCode: smsCode.toString(),
    })
    if (result.status !== 200) { 
      res.status(500).json({ code: 1, message: '服务器错误', error: result.data.error });
      return
    }

    console.log('sms-validate res', result.data)


    if (result.data.verifyResult) {
      res.status(200).json({ code: 0, message: '验证成功', result: result.data });
    } else {
      res.status(400).json({ code: 1, message: '验证码错误', result: result.data });
      return
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})


module.exports = router;