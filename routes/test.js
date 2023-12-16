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

const createTaskItem = (name, delay) => ({
  name,
  isRunning: false,
  task: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`${name} completed`);
        resolve(name + 'res');
      }, delay);
    })
  },
  onSuccess: () => console.log(`${name} onSuccess`),
  onFail: () => console.log(`${name} onFail`),
});

const taskQueue = new TaskQueue()

let timespassed = 0;
let interval = 100

setInterval(() => {
  timespassed += interval
  console.log(timespassed, taskQueue.running.map(item => item.name), taskQueue.queue.map(item => item.name));
}, interval);

taskQueue.createBatchTask([
  createTaskItem('task5', 1000),
  createTaskItem('task6', 5000),
  createTaskItem('task7', 1000),
  createTaskItem('task8', 1000),
]).then((results) => {
  console.log('batch task completed', results);
})