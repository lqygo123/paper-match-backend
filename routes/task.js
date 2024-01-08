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
  completedTasks = []; // 已完成的任务，最多 2 份

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

  cancel(taskId) {
    console.log('cancel', taskId)
    const taskItem = this.running.find(item => item.taskId === taskId);
    if (taskItem) {
      taskItem.cancelled = true;
      this.complete(taskItem, false, 'Task cancelled');
    } else {
      const index = this.queue.findIndex(item => item.taskId === taskId);
      if (index > -1) {
        this.queue.splice(index, 1);
      }
    }
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

  const { biddingFileId, targetFileId, skipFileId, biddingFileName, targetFileName, mode = 'digital', enableImageCompare } = payload;

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
    const { dataString, errorString, spanPythonArgs } = await runPythonScript(options);
    // fs.writeFileSync(path.join(__dirname, '../', 'files', `output-ocr-${duplicateResult._id}.json`), dataString)
    if (!dataString) { 
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      const formattedDate = `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
      const logPath = path.join(__dirname, '../', 'error-logs')
      fs.ensureDirSync(logPath)

      // 文件已经存在，覆盖，不存在则创建
      fs.writeFileSync(path.join(logPath, `error_log_${formattedDate}.log`), errorString, { encoding: 'utf-8', flag: 'w' })
      console.error('算法执行失败 输出 stdout 为空，算法运行参数：',spanPythonArgs, '错误日志:', path.join(logPath, `error_log_${formattedDate}.log`))
      throw new Error('算法执行失败')
    }
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 2000);
    })
    result = await transfromScan(dataString, duplicateResult)
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
    if (enableImageCompare) {
      options.compareImage = true
    }
    console.log('runPythonScript', JSON.stringify(options))
    const { dataString, errorString, spanPythonArgs } = await runPythonScript(options);
    // console.log('runPythonScript res length', digitalData.length)
    // fs.writeFileSync(path.join(__dirname, '../', 'files', `output-digital-${duplicateResult._id}.json`), dataString)
    if (!dataString) { 
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      const formattedDate = `${year}_${month}_${day}_${hours}.${minutes}.${seconds}`;
      const logPath = path.join(__dirname, '../', 'error-logs')
      fs.ensureDirSync(logPath)
      fs.writeFileSync(path.join(logPath, `error_log_${formattedDate}.log`), errorString)
      console.error('算法执行失败 输出 stdout 为空，算法运行参数：',spanPythonArgs, '错误日志:', path.join(logPath, `error_log_${formattedDate}.log`))
      throw new Error('算法执行失败')
    }
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 5000);
    })
    result = await transfromDigital(dataString, duplicateResult)
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
  delete abstract.pdf2Pages

  await duplicateResult.updateOne({ abstract });
  duplicateResult.abstract = abstract


  // const duplicateResult2 = await DuplicateResult.create({
  //   biddingFileId: biddingFileId,
  //   biddingFileName: targetFile.fileName,
  //   targetFileId: targetFileId,
  //   targetFileName: biddingFile.fileName,
  //   skipFileId,
  //   mode,
  //   linkedResultId: duplicateResult._id,
  //   abstract: {
  //     ...abstract,
  //     pdf1TextTotal: abstract.pdf2TextTotal,
  //     pdf2TextTotal: abstract.pdf1TextTotal,
  //     pdf1ImageTotal: abstract.pdf2ImageTotal,
  //     pdf2ImageTotal: abstract.pdf1ImageTotal,
  //   }
  // });
  
  // return [duplicateResult, duplicateResult2]
  return [duplicateResult]
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
          return res
        } catch (error) {
          console.error('task err', error)
          throw error
        }
      } 
    }
  }))
  res.json({ code: 0, message: "创建队列成功", data: { batchId } });
  const results = await bachTaskPromise
  console.log('create-duplicate-task down', results, reportMetaInfo)

  // const resultList = results.map(item => item && item.result && item.result._id).filter(_id => _id)
  const resultList = []
  results.forEach(item => {
    if (item && item.result && item.result.length) {
      item.result.forEach(resultItem => {
        resultList.push(resultItem._id)
      })
    }
  })

  if (resultList.length) {
    const report = await Report.create({
      results: resultList,
      metaInfo: reportMetaInfo,
      reportTime: new Date(),
    });
    console.log('create-duplicate-task report 创建成功', report._id)
    if (taskQueue.completedTasks.length > 2) { 
      taskQueue.completedTasks.shift()
    }
    taskQueue.completedTasks.push({
      batchId,
      reportId: report._id,
      reportMetaInfo: reportMetaInfo,
      reportTime: new Date(),
      creator,
      createAt: Date.now(),
      isFinished: true,
    });
  }
})

router.post("/cancel-duplicate-task", async (req, res) => {
  const { taskId } = req.body;
  taskQueue.cancel(taskId);
  res.json({ code: 0, message: "取消成功" });
});

router.post("/cancel-batch-duplicate-task", async (req, res) => {
  const { batchId } = req.body;

  taskQueue.queue.filter(item => item.batchId === batchId).forEach(item => {
    taskQueue.cancel(item.taskId)
  })

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 1000)
  })

  taskQueue.running.filter(item => item.batchId === batchId).forEach(item => {
    taskQueue.cancel(item.taskId)
  })

  res.json({ code: 0, message: "取消成功" });
});

router.get("/current-tasks", async (req, res) => { 
  res.json({
    code: 0, message: "执行成功", data: {
      running: taskQueue.running,
      queue: taskQueue.queue,
      completedTasks: taskQueue.completedTasks,
    }
  });
})

module.exports = router;