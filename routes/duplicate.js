const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs-extra");
const { File, DuplicateResult, DuplicateResultDetail, Report } = require("../models");
const { transfromScan, transfromDigital } = require('../transfrom/transfrom')

const compireFile = async (biddingFilePath, targetFilePath, skipFiles, mode) => {
  // 先用 mock data
  console.log('compireFile biddingFilePath', biddingFilePath)
  console.log('compireFile targetFilePath', targetFilePath)
  console.log('compireFile skipFiles', skipFiles)
  console.log('compireFile mode', mode)
  return {}
}

const extractAbstract = (result) => {
  delete result.textRepetitions
  delete result.imageRepetitions
  delete result.ocrRepetitions
  delete result.pdf1Pages
  return result
}

router.post("/exec-duplicate", async (req, res) => {
  try {
    const { biddingFileId, targetFileId, skipFileIds, mode = 'digital' } = req.body;
    const biddingFile = await File.findById(biddingFileId);
    const targetFile = await File.findById(targetFileId);
    const skipFiles = (await File.find({ _id: { $in: skipFileIds } }) || []).map(file => file.fileFullPath);

    if (!biddingFile || !targetFile) {
      return res.status(404).json({ code: 1, message: "未找到该文件" });
    }

    const duplicateResult = await DuplicateResult.create({
      biddingFileId,
      biddingFileName: biddingFile.fileName,
      targetFileId,
      targetFileName: targetFile.fileName,
      skipFileIds,
      mode
    });
    let result

    if (mode === 'ocr') {
      const scanData = require('../transfrom/input_scan.json') // todo 替换成算法返回结果
      result = await transfromScan(scanData, duplicateResult)
    }

    if (mode === 'digital') {
      const digitalData = require('../transfrom/input_digital.json') // todo 替换成算法返回结果
      result = await transfromDigital(digitalData, duplicateResult)
    }

    const duplicateResultDetail = await DuplicateResultDetail.create({
      detail: result,
      duplicateResultId: duplicateResult._id,
    });

    const abstract = extractAbstract(result)

    await duplicateResult.updateOne({ detail: duplicateResultDetail._id, abstract });
    duplicateResult.abstract = abstract

    res.json({ code: 0, message: "执行成功", data: duplicateResult });

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
    const detail = await DuplicateResultDetail.findById(duplicateResult.detail);
    res.json({ code: 0, message: "获取成功", data: duplicateResult, detail: detail.detail });
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

// update report
router.post("/update-report", async (req, res) => { 
  try {
    const { id, metaInfo } = req.body;
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ code: 1, message: "未找到该报告" });
    }
    await report.updateOne({ metaInfo });
    res.json({ code: 0, message: "更新成功", data: report });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
})

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

router.post("/get-duplicates", async (req, res) => {
  try {
    const { duplicateIds } = req.body;
    const duplicateResult = await DuplicateResult.find({ _id: { $in: duplicateIds } });
    res.json({ code: 0, message: "执行成功", data: duplicateResult });

  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
})

module.exports = router;
