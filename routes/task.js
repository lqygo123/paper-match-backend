const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const { File, DuplicateResult, Report } = require("../models");
const runPythonScript = require('../compare/exec')
const { transfromScan, transfromDigital } = require('../transfrom/transfrom')
const path = require("path");

class TaskQueue {
  concurry = 2; // 并发数
  queue = []; // 任务队列
  running = []; // 正在运行的任务

  constructor(concurry) {
    this.concurry = concurry || 2;
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
      taskItem.task().then(() => {
        this.complete(taskItem, true);
      }).catch(() => {
        this.complete(taskItem, false);
      });
    }
  }

  complete(taskItem, isSuccess) {
    const index = this.running.indexOf(taskItem);
    if (index > -1) {
      this.running.splice(index, 1);
    }
    taskItem.isRunning = false;
    if (isSuccess) {
      taskItem.onSuccess();
    } else {
      taskItem.onFail();
    }
    this.run();
  }
}

const createTaskItem = (name, delay) => ({
  name,
  isRunning: false,
  task: () => new Promise(resolve => setTimeout(resolve, delay)),
  onSuccess: () => console.log(`${name} completed`),
  onFail: () => console.log(`${name} failed`),
});

const createBatchTask = (tasks) => {
  return new Promise((resolve, reject) => {
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

router.post("/exec-duplicate", async (req, res) => {
  try {
    const { biddingFileId, targetFileId, skipFileId, mode = 'digital' } = req.body;
    const biddingFile = await File.findById(biddingFileId);
    const targetFile = await File.findById(targetFileId);
    const skipFile = await File.findById(skipFileId);

    if (!biddingFile || !targetFile) {
      return res.status(404).json({ code: 1, message: "未找到该文件" });
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
      console.log('runPythonScript res length', scanData.length)
      if (!scanData) { 
        return res.status(500).json({ code: 1, message: "算法执行失败" });
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
      // fs.writeFileSync(`digital-${duplicateResult._id}.json`, digitalData)
      if (!digitalData) { 
        return res.status(500).json({ code: 1, message: "算法执行失败" });
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

    res.json({ code: 0, message: "执行成功", data: duplicateResult });

  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 1, message: "服务器错误", error });
  }
});

router.post("/create-duplicate-task", async (req, res) => {
  const { metaInfo, taskList } = req.body;
})

module.exports = router;