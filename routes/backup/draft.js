const express = require('express');
const { Draft } = require('../../models');

const router = express.Router();

router.post('/:id', async (req, res) => { 
  try {
    const { id: appointmentId } = req.params;
    if (!appointmentId) {
      return res.status(404).json({ code: 1, message: '参数错误' });
    }

    const userId = req.jwtPayload.id;


    let draft = await Draft.findOne({ appointmentId: appointmentId });
    if (!draft) {
      draft = await Draft.create({
        appointmentId: appointmentId, drafts: {
          [userId]: req.body
        }
      });
    } else {
      if(!draft.drafts) draft.drafts = {};
      draft.drafts[userId] = req.body;
      await Draft.updateOne({ _id: draft._id }, { $set: { drafts: draft.drafts } });
    }

    res.json({ code: 0, message: '保存成功' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

router.get('/:id', async (req, res) => { 
  try {
    const { id: appointmentId } = req.params;
    if (!appointmentId) {
      return res.status(404).json({ code: 1, message: '参数错误' });
    }

    const userId = req.jwtPayload.id;

    const draft = await Draft.findOne({ appointmentId: appointmentId });
    if (!draft) {
      return res.json({ code: 0, message: '获取成功', data: {} });
    } else {
      return res.json({ code: 0, message: '获取成功', data: draft.drafts[userId] || {} });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
})

module.exports = router;