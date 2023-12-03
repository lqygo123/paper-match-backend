const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const upload = multer();
const { File } = require("../models");
const fs = require("fs");

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { originalname, buffer } = req.file;
    const file = await File.create({
      fileName: originalname,
      uploadTime: new Date(),
    });
    const fileName = file._id.toString();
    const fileFullPath = path.join(__dirname, "../files", fileName);
    fs.writeFileSync(fileFullPath, buffer);
    file.fileFullPath = fileFullPath;
    await file.save();
    res.json({ code: 0, message: "上传成功", data: file });

  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ code: 1, message: "未找到该文件" });
    }
    const { fileFullPath, fileName } = file;
    res.download(fileFullPath, fileName);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ code: 1, message: "未找到该文件" });
    }
    const { fileFullPath } = file;
    fs.unlinkSync(fileFullPath);
    await file.remove();
    res.json({ code: 0, message: "删除成功" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

// static files


module.exports = router;
