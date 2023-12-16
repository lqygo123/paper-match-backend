const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const { File, DuplicateResult, Report } = require("../models");
const runPythonScript = require('../compare/exec')
const { transfromScan, transfromDigital } = require('../transfrom/transfrom')
const path = require("path");
const { TASK_CONCURRENCY } = require('../config')

class TaskQueue {
  concurry = 2; // 并发数
  queue = []; // 任务队列
  running = []; // 正在运行的任务

  constructor(concurry) {
    this.concurry = concurry || 1;
  }

  updateRunning(taskId, key, value) { 
    const taskItem = this.running.find(item => item.taskId === taskId)
    if (taskItem) {
      taskItem[key] = value
    }
  }

  enqueue(taskItem) {
    this.queue.push(taskItem);
    this.run();
  }

  createBatchTask(tasks) {
    return new Promise((resolve) => {
      let completedTasks = 0;
      const results = [];
  
      tasks.forEach((task, index) => {
        this.enqueue({
          ...task,
          onSuccess: (result) => {
            results[index] = { status: 'success', result };
            completedTasks++;
            if (completedTasks === tasks.length) {
              resolve(results);
            }
          },
          onFail: (error) => {
            results[index] = { status: 'failed', error };
            completedTasks++;
            if (completedTasks === tasks.length) {
              resolve(results);
            }
          },
        });
      });
    });
  }

  run() {
    if (this.running.length < this.concurry && this.queue.length) {
      const taskItem = this.queue.shift();
      this.running.push(taskItem);
      taskItem.isRunning = true;
      taskItem.task().then((res) => {
        this.complete(taskItem, true, res);
      }).catch((err) => {
        this.complete(taskItem, false, err);
      });
    }
  }

  complete(taskItem, isSuccess, res) {
    const index = this.running.indexOf(taskItem);
    if (index > -1) {
      this.running.splice(index, 1);
    }
    taskItem.isRunning = false;
    if (isSuccess) {
      taskItem.onSuccess(res);
    } else {
      taskItem.onFail(res);
    }
    this.run();
  }
}

const taskQueue = new TaskQueue(TASK_CONCURRENCY);

const execDuplicate = async (payload, taskId) => { 

  const { biddingFileId, targetFileId, skipFileId, biddingFileName, targetFileName, mode = 'digital' } = payload;

  console.log('execDuplicate', taskId, biddingFileName, '对比', targetFileName, mode)

  const biddingFile = await File.findById(biddingFileId);
  const targetFile = await File.findById(targetFileId);
  const skipFile = await File.findById(skipFileId);

  if (!biddingFile || !targetFile) {
    throw new Error('未找到文件')
  }

  const duplicateResult = await DuplicateResult.create({
    biddingFileId,
    biddingFileName: biddingFile.fileName,
    targetFileId,
    targetFileName: targetFile.fileName,
    skipFileId,
    mode
  });
  let result

  if (mode === 'ocr') {
    const pdf1AbsPath = path.join(__dirname, '../', 'files', biddingFileId)
    const pdf2AbsPath = path.join(__dirname, '../', 'files', targetFileId)
    const options = {
      method: "compare_scan",
      pdf1: pdf1AbsPath,
      pdf2: pdf2AbsPath
    }
    if (skipFile) {
      options.exclude = path.join(__dirname, '../', 'files', skipFileId)
    }
    console.log('runPythonScript', JSON.stringify(options))
    const scanData = await runPythonScript(options);
    fs.writeFileSync(path.join(__dirname, '../', 'files', `output-ocr-${duplicateResult._id}.json`), scanData)
    if (!scanData) { 
      throw new Error('算法执行失败')
    }
    result = await transfromScan(scanData, duplicateResult)
  }

  if (mode === 'digital') {
    // const digitalData = require('../transfrom/input_digital.json') // todo 替换成算法返回结果

    const pdf1AbsPath = path.join(__dirname, '../', 'files', biddingFileId)
    const pdf2AbsPath = path.join(__dirname, '../', 'files', targetFileId)
    const options = {
      method: "compare_digital",
      pdf1: pdf1AbsPath,
      pdf2: pdf2AbsPath,
    }
    if (skipFile) {
      options.exclude = path.join(__dirname, '../', 'files', skipFileId)
    }
    console.log('runPythonScript', JSON.stringify(options))
    const digitalData = await runPythonScript(options);
    console.log('runPythonScript res length', digitalData.length)
    fs.writeFileSync(path.join(__dirname, '../', 'files', `output-digital-${duplicateResult._id}.json`), digitalData)
    if (!digitalData) { 
      throw new Error('算法执行失败')
    }
    result = await transfromDigital(digitalData, duplicateResult)
  }

  // 写入 result 到 $ duplicateResult._id
  const resultPath = path.join(__dirname, '../', 'files', `result-${duplicateResult._id}.json`)
  fs.ensureDirSync(path.join(__dirname, '../', 'files'))
  fs.writeFileSync(resultPath, JSON.stringify(result))

  const abstract = {
    ...result
  }
  delete abstract.textRepetitions
  delete abstract.imageRepetitions
  delete abstract.ocrRepetitions
  delete abstract.pdf1Pages
  await duplicateResult.updateOne({ abstract });
  duplicateResult.abstract = abstract

  return duplicateResult
}

router.post("/exec-duplicate", async (req, res) => {
  try {
    // const { biddingFileId, targetFileId, skipFileId, mode = 'digital' } = req.body;
    const duplicateResult = await execDuplicate(req.body)
    res.json({ code: 0, message: "执行成功", data: duplicateResult });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

router.post("/create-duplicate-task", async (req, res) => {
  const { taskList, reportMetaInfo } = req.body;

  const creator = {
    name: req.jwtPayload.name,
    role: req.jwtPayload.role,
  }

  const batchId = 'batch-' + Date.now() + Math.random().toString(36).substr(2);

  const bachTaskPromise = taskQueue.createBatchTask(taskList.map((task, index) => {
    const taskId = Date.now() + Math.random().toString(36).substr(2);
    return {
      taskId,
      batchId,
      reportMetaInfo,
      batchTotal: taskList.length,
      batchIndex: index,
      creator,
      createAt: Date.now(),
      task: async () => { 
        try {
          const res = await execDuplicate(task, taskId)
          console.log('task completed', res)
          return res._id
        } catch (error) {
          console.error('task err', error)
          throw error
        }
      } 
    }
  }))
  res.json({ code: 0, message: "创建队列" });
  const results = await bachTaskPromise
  console.log('create-duplicate-task down', results, reportMetaInfo)

  // todo createreport 
  const report = await Report.create({
    results: results.map(item => item && item.result && item.result._id).filter(_id => _id),
    metaInfo: reportMetaInfo,
    reportTime: new Date(),
  });

  console.log('create-duplicate-task report 创建成功', report._id)
})

router.get("/current-tasks", async (req, res) => { 
  res.json({
    code: 0, message: "执行成功", data: {
      running: taskQueue.running,
      queue: taskQueue.queue
    }
  });
})

module.exports = router;