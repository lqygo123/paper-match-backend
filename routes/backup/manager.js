const express = require('express');
const { Manager, Appointment, QrcodeImage } = require('../../models');
const { generateToken } = require('../../common/jwt-auth');
const { genQrCode, } = require('../common/wechat');

const router = express.Router();

const qrCodeExpireTime = 1000 * 60 * 60 * 24 * 14;

router.post('/login', async (req, res) => {
  try {
    const { managerId, managerInfo } = req.body;

    if (!managerId || !managerInfo) {
      return res.status(400).json({ code: 1, message: '缺少参数 ' });
    }

    let manager = await Manager.findOne({ managerId })
    if (!manager) {
      // 创建客户经理
      console.log(`Creating manager ${managerId}`)
      manager = await Manager.create({
        managerId,
        managerInfo
      });
    }
    const token = generateToken({ type: 'b', id: manager._id });
    res.json({ code: 0, message: '登录成功', data: { jwtToken: token } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});

const permissionCheck = async (req, res, next) => { 
  const jwtPayload = req.jwtPayload;
  if (jwtPayload.type !== 'b') {
    return res.status(401).json({ code: 1, message: '无权限' });
  }
  const manager = await Manager.findById(jwtPayload.id);
  if (!manager) {
    return res.status(404).json({ code: 1, message: '未找到该客户经理' });
  }
  req.manager = manager;
  next()
}

// update manager info
router.post('/update', permissionCheck, async (req, res) => { 
  try {
    const { managerInfo } = req.body;
    if (!managerInfo) {
      return res.status(400).json({ code: 1, message: '缺少参数 managerInfo' });
    }
    const manager = req.manager;
    manager.managerInfo = managerInfo;
    manager.save();
    res.json({ code: 0, message: '更新成功', managerInfo: manager.managerInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.post('/create-qrcode', permissionCheck, async (req, res) => {
  try {
    const { qrCodeInfo } = req.body;
    if (!qrCodeInfo) {
      return res.status(400).json({ code: 1, message: '缺少参数 qrCodeInfo' });
    }
    const manager = req.manager;
    console.log(`Creating qrcode for ${manager.managerId}`)

    const appointment = await Appointment.create({
      status: 'waittingForScan',
      qrCodeInfo,
      managerId: manager._id,
      isExpired: false,
      expireTime: new Date(Date.now() + qrCodeExpireTime),
      createTime: new Date(),
    });

    const qrCodeBuffer = await genQrCode(`${appointment._id.toString()}`);
    if (qrCodeBuffer.length < 1000) {
      res.status(500).json({ code: 1, message: '二维码生成失败', error: qrCodeBuffer.toString('utf8') });
      return
    }

    const qrCodeBase64 = `data:image/png;base64,${qrCodeBuffer.toString('base64')}`;

    const qrcodeImage = await QrcodeImage.create({
      imageBase64: qrCodeBase64,
    });

    // 添加 qrCodeBase64 到 appointment.qrCodeInfo， 并持久化存储到表中
    await Appointment.findByIdAndUpdate(appointment._id, {
      qrCodeInfo: {
        ...qrCodeInfo,
        qrcodeImageId: qrcodeImage._id,
      }
    }, { new: true }).exec();

    manager.updateOne({
      $push: {
        appointments: appointment._id
      }
    }).exec();
    appointment.qrCodeInfo.qrcodeImageId = qrcodeImage._id;
    appointment.qrCodeInfo.qrCodeBase64 = qrCodeBase64;
    res.json({ code: 0, message: '创建成功', data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/qrcode-img/:id', async (req, res) => { 
  try {
    const { id } = req.params;
    const qrcodeImage = await QrcodeImage.findById(id).exec();

    if (!qrcodeImage) {
      return res.status(404).json({ code: 1, message: '未找到该二维码' });
    }

    res.json({ code: 0, message: '获取成功', data: qrcodeImage });

  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/qrcodes', permissionCheck, async (req, res) => { 
  try {
    const manager = req.manager;
    const appointments = await Appointment.find({
      managerId: manager._id,
      // status: 'waittingForScan',
    }).sort({ createTime: -1 }).exec();
    res.json({ code: 0, message: '获取成功', data: appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/appointments', permissionCheck, async (req, res) => { 
  try {
    const manager = req.manager;
    const { from, to } = req.query;
    const findParams = {
      managerId: manager._id,
      status: { $nin: ['waittingForScan', 'returned'] },
    }

    if (from) {
      findParams.clientFillInTime = {
        $gte: new Date(from)
      }
    }

    if (to) {
      if (!findParams.clientFillInTime) {
        findParams.clientFillInTime = {};
      }
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1);
      findParams.clientFillInTime.$lte = toDate;
    }

    const appointments = await Appointment.find(findParams).exec();

    res.json({ code: 0, message: '获取成功', data: appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/appointment/:id', permissionCheck, async (req, res) => { 
  try {
    const manager = req.manager;
    const { id } = req.params;
    const appointment = await Appointment.findOne({
      managerId: manager._id,
      _id: id
    }).exec();

    if (!appointment) {
      return res.status(404).json({ code: 1, message: '未找到该预约' });
    }

    if (appointment.qrCodeInfo.qrcodeImageId) {
      const qrcodeImage = await QrcodeImage.findById(appointment.qrCodeInfo.qrcodeImageId).exec();
      appointment.qrCodeInfo.qrCodeBase64 = qrcodeImage.imageBase64;
    }

    res.json({ code: 0, message: '获取成功', data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.delete('/qrcode/:id', permissionCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).exec();
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '未找到该预约' });
    }
    if (appointment.status !== 'waittingForScan' && appointment.status !== 'expired') {
      return res.status(400).json({ code: 1, message: '该预约已被申请，无法删除' });
    }
    if (appointment.managerId.toString() !== req.manager._id.toString()) {
      return res.status(401).json({ code: 1, message: '无权限, 不能操作非自身的预约' });
    }
    appointment.deleteOne();
    req.manager.updateOne({
      $pull: {
        appointments: appointment._id
      }
    }).exec();

    res.json({ code: 0, message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});

// TODO 后端校验客户经理补录信息
const validateAppointmentFillInfo = (managerFillIn) => {
  console.log('validateAppointmentFillInfo', managerFillIn);
  return {
    validate: true,
    message: '校验成功'
  }
}

router.post('/form/start/:id', permissionCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).exec();
  
    if (!appointment) { 
      return res.status(404).json({ code: 1, message: '未找到该预约' });
    }
    if (appointment.managerId.toString() !== req.manager._id.toString()) { 
      console.log(appointment.managerId, req.manager._id);
      return res.status(401).json({ code: 1, message: '无权限, 不能操作非自身的预约' });
    }
    if (appointment.status !== 'managerToFill') { 
      return res.status(400).json({ code: 1, message: '状态错误，该预约已经开始或者不能开始' });
    }
    appointment.status = 'managerFilling';
    await appointment.save();
    res.json({ code: 0, message: '开始填表' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.post('/form/save/:id', permissionCheck, async (req, res) => { 
  try {
    const { id } = req.params;
    const { managerFillIn } = req.body;
    if (!managerFillIn) {
      return res.status(400).json({ code: 1, message: '缺少参数 managerFillIn' });
    }
    const appointment = await Appointment.findById(id).exec();
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '未找到该预约' });
    }
    if (appointment.managerId.toString() !== req.manager._id.toString()) { 
      return res.status(401).json({ code: 1, message: '无权限, 不能操作非自身的预约' });
    }
    if (appointment.status !== 'managerFilling') { 
      return res.status(400).json({ code: 1, message: '状态错误，该预约不能保存' });
    }
    appointment.managerFillIn = managerFillIn;
    await appointment.save();

    res.json({ code: 0, message: '保存临时状态成功', data: appointment  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.post('/form/submit/:id', permissionCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { managerFillIn } = req.body;
    if (!managerFillIn) {
      return res.status(400).json({ code: 1, message: '缺少参数 managerFillIn' });
    }
    const appointment = await Appointment.findById(id).exec();
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '未找到该预约' });
    }
    if (appointment.managerId.toString() !== req.manager._id.toString()) {
      return res.status(401).json({ code: 1, message: '无权限, 不能操作非自身的预约' });
    }
    if (appointment.status !== 'managerFilling') {
      return res.status(400).json({ code: 1, message: '状态错误，该预约不能提交' });
    }

    // 后端表单校验
    const validateResult = validateAppointmentFillInfo(managerFillIn);
    if (!validateResult.validate) {
      return res.status(400).json({ code: 1, message: validateResult.message });
    }

    appointment.status = 'auditting';
    appointment.managerFillIn = managerFillIn;
    await Appointment.updateOne({ _id: appointment._id }, {
      status: 'auditting',
      managerFillIn: appointment.managerFillIn,
    }).exec();

    res.json({ code: 0, message: '提交成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.post('/form/return/:id', permissionCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { returnReason } = req.body;
    if (!returnReason) {
      return res.status(400).json({ code: 1, message: '缺少参数 returnReason' });
    }
    const appointment = await Appointment.findById(id).exec();
    if (!appointment) {
      return res.status(404).json({ code: 1, message: '未找到该预约' });
    }
    if (appointment.managerId.toString() !== req.manager._id.toString()) { 
      return res.status(401).json({ code: 1, message: '无权限, 不能操作非自身的预约' });
    }
    if (appointment.status !== 'managerFilling') { 
      return res.status(400).json({ code: 1, message: '状态错误，该预约不能退回' });
    }

    const returnInfo = {
      returnReason,
      returnTime: new Date(),
    }

    appointment.status = 'returned';

    if (!appointment.managerFillIn) { 
      appointment.managerFillIn = {};
    }

    appointment.managerFillIn.returnInfo = returnInfo;
    await Appointment.updateOne({ _id: appointment._id }, {
      status: 'returned',
      managerFillIn: appointment.managerFillIn,
    }).exec();

    res.json({ code: 0, message: '退回成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

module.exports = router;