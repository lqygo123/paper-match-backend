const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { generateToken, isAdmin } = require("../common/jwt-auth");


router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ code: 1, message: "用户名或密码错误" });
    }
    if (!user.enabled) {
      return res.status(403).json({ code: 1, message: "该用户未授权，请联系管理员开通权限" });
    }
    const token = generateToken({ userId: user._id, role: user.role });
    res.json({ code: 0, message: "登录成功", data: { token, role: user.role, username: user.username } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

// 判断 jwt权限，role 是否为 admin

router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });
    res.json({ code: 0, message: "ok", data: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

// 修改用户信息

router.post("/update-user", isAdmin, async (req, res) => { 
  try {
    const { userId, info } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ code: 1, message: "未找到该用户" });
    }

    const { username } = info;
    const sameNameUser = await User.find({ username });
    if (sameNameUser.length > 0 && sameNameUser[0]._id.toString() !== userId) {
      return res.status(400).json({ code: 1, message: "用户名已存在" });
    }
    if (info.role) {
      return res.status(400).json({ code: 1, message: "不允许修改用户角色" });
    }

    if (info.username) {
      user.username = info.username;
    }
    if (info.password) {
      user.password = info.password;
    }
    if (info.enabled !== undefined) {
      user.enabled = info.enabled;
    }
    if (info.name) {
      user.name = info.name;
    }
    await user.save();
    res.json({ code: 0, message: "ok" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

module.exports = router;
