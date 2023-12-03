const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs-extra");
const { File, DuplicateResult, Report } = require("../models");
const { exec } = require("child_process")

const compireFile = async (biddingFilePath, targetFilePath, skipFiles) => {
  // const { promisify } = require("util");
  // const execAsync = promisify(exec);
  // const command = `python3 ./python/compare.py ${biddingFilePath} ${targetFilePath} ${skipFiles}`;
  // const { stdout, stderr } = await execAsync(command);
  // return JSON.parse(stdout);

  // 先用 mock data
  console.log('compireFile biddingFilePath', biddingFilePath)
  console.log('compireFile targetFilePath', targetFilePath)
  console.log('compireFile skipFiles', skipFiles)
  return {}
}

const extractAbstract = (result) => {
  return {}
}

router.post("/exec-duplicate", async (req, res) => {
  try {
    const { biddingFileId, targetFileId, skipFileIds } = req.body;
    const biddingFile = await File.findById(biddingFileId);
    const targetFile = await File.findById(targetFileId);
    const skipFiles = (await File.find({ _id: { $in: skipFileIds } }) || []).map(file => file.fileFullPath);

    if (!biddingFile || !targetFile) {
      return res.status(404).json({ code: 1, message: "未找到该文件" });
    }

    const compireRes = await compireFile(biddingFile.fileFullPath, targetFile.fileFullPath, skipFiles);
    const duplicateResult = await DuplicateResult.create({
      biddingFileId,
      targetFileId,
      skipFileIds,
      result: compireRes,
      abstract: extractAbstract(compireRes),
    });
    return res.json({ code: 0, message: "执行成功", data: duplicateResult });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

// get duplicateResult detail
router.get("/duplicate-result/:id", async (req, res) => {
  try {
    const duplicateResult = await DuplicateResult.findById(req.params.id);
    if (!duplicateResult) {
      return res.status(404).json({ code: 1, message: "未找到该比对" });
    }
    res.json({ code: 0, message: "获取成功", data: duplicateResult });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

// create report
router.post("/create-report", async (req, res) => {
  try {
    const { results, metaInfo } = req.body;
    const report = await Report.create({
      results,
      metaInfo,
      reportTime: new Date(),
    });
    res.json({ code: 0, message: "创建成功", data: report });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

// get report  , 支持查询 , 支持参数 startTime, endTime, 以及 metaInfo 中的任意字段
  /*
    metaInfo: {
      projectName: String,
      biddingID: String,
      biddingCompany: String,
      biddingAgent: String,
      participateCompany: String,
      time: string,
    }
  */
 // 其中 metaInfo 中字段均为选填，可能存在，存在则为模糊查询，不存在则不查询 
router.get("/reports", async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    const query = {};
    if (startTime && !endTime) {
      query.reportTime = { $gte: startTime };
    }
    if (!startTime && endTime) {
      query.reportTime = { $lte: endTime };
    }
    if (startTime && endTime) {
      query.reportTime = { $gte: startTime, $lte: endTime };
    }

    const { projectName, biddingID, biddingCompany, biddingAgent, participateCompany, time } = req.query;
  
    if (projectName) {
      query["metaInfo.projectName"] = { $regex: projectName };
    }
    if (biddingID) {
      query["metaInfo.biddingID"] = { $regex: biddingID };
    }
    if (biddingCompany) {
      query["metaInfo.biddingCompany"] = { $regex: biddingCompany };
    }
    if (biddingAgent) {
      query["metaInfo.biddingAgent"] = { $regex: biddingAgent };
    }
    if (participateCompany) {
      query["metaInfo.participateCompany"] = { $regex: participateCompany };
    }
    if (time) {
      query["metaInfo.time"] = { $regex: time };
    }
    const reports = (await Report.find(query) || []);
    res.json({ code: 0, message: "获取成功", data: reports });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

// get report detail
router.get("/report/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ code: 1, message: "未找到该报告" });
    }
    res.json({ code: 0, message: "获取成功", data: report });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

module.exports = router;
