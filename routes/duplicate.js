const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs-extra");
const { DuplicateResult, Report } = require("../models");


// get duplicateResult detail
router.get("/duplicate-result/:id", async (req, res) => {
  try {
    const duplicateResult = await DuplicateResult.findById(req.params.id);
    if (!duplicateResult) {
      return res.status(404).json({ code: 1, message: "未找到该比对" });
    }
    let linkResult 
    if (duplicateResult.linkedResultId) { 
      linkResult = await DuplicateResult.findById(duplicateResult.linkedResultId);
    }

    // const detail = await DuplicateResultDetail.findById(duplicateResult.detail);
    let filePath 
    if (linkResult) {
      filePath = path.join(__dirname, '../', 'files', `result-${linkResult._id}.json`)
    } else {
      filePath = path.join(__dirname, '../', 'files', `result-${duplicateResult._id}.json`)
    }
    // const detail = fs.readFileSync(filePath, 'utf-8')

    // 使用 流读取文件
    const detail = await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' })
      let data = ''
      readStream.on('data', (chunk) => {
        data += chunk
      })
      readStream.on('end', () => {
        resolve(data.toString('utf-8'))
      })
      readStream.on('error', (err) => {
        reject(err)
      })
    })

    res.json({ code: 0, message: "获取成功", data: duplicateResult, detail: JSON.parse(detail) });
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
      query["metaInfo.time"] = { $gte: startTime };
    }
    if (!startTime && endTime) {
      query["metaInfo.time"] = { $lte: endTime };
    }
    if (startTime && endTime) {
      query["metaInfo.time"] = { $gte: startTime, $lte: endTime };
    }

    const { projectName, biddingNumber, biddingCompany, participatingCompany } = req.query;
  
    if (projectName) {
      query["metaInfo.projectName"] = { $regex: projectName };
    }
    if (biddingNumber) {
      query["metaInfo.biddingNumber"] = { $regex: biddingNumber };
    }
    if (biddingCompany) {
      query["metaInfo.biddingCompany"] = { $regex: biddingCompany };
    }
    if (participatingCompany) {
      query["metaInfo.participatingCompany"] = { $regex: participatingCompany };
    }

    const { page = 1, pageSize = 10 } = req.query;
    const reports = await Report.find(query).sort({ reportTime: -1 }).skip((page - 1) * pageSize).limit(Number(pageSize)) || [];
    const total = await Report.countDocuments(query);

    res.json({ code: 0, message: "获取成功", data: reports, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

router.post("/delete-report", async (req, res) => {
  try {
    const { id } = req.body;

    console.log('delete-report', id)
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ code: 1, message: "未找到该报告" });
    }
    await Report.deleteOne({ _id: id });
    res.json({ code: 0, message: "删除成功" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
})

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
