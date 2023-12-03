const express = require('express');
const { Branch } = require('../../models');

const router = express.Router();

// TODO 修改权限，只有 A 端柜台用户才可以执行

// 查询所有银行支行信息
router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find();
    const returnData = branches.map((branch) => {
      return {
        _id: branch._id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        areaCode: branch.areaCode,
        branchId: branch.branchId,
      }
    });
    res.json({ code: 0, message: '查询成功', data: returnData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});

// 查询单个银行支行信息
router.get('/:id', async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ code: 1, message: '未找到该支行信息' });
    }
    res.json({ code: 0, message: '查询成功', data: branch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});

// 添加银行支行信息
router.post('/', async (req, res) => {
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.json({ code: 0, message: '添加成功', data: branch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});

// 修改银行支行信息
router.put('/:id', async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!branch) {
      return res.status(404).json({ code: 1, message: '未找到该支行信息' });
    }
    res.json({ code: 0, message: '修改成功', data: branch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 1, message: '服务器错误', error });
  }
});

module.exports = router;