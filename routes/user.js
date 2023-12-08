const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { generateToken } = require("../common/jwt-auth");


router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ code: 1, message: "用户名或密码错误" });
    }
    const token = generateToken({ userId: user._id });
    res.json({ code: 0, message: "登录成功", data: { token } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

module.exports = router;
