const { spawn } = require('child_process');

// 要执行的Python脚本
const pythonScript = './dummy.py';

// 传递给Python脚本的参数
const pythonArgs = ['get_digital_pdf_compare_result', 'xxxx/xxxx/dd.pdf', 'xxxx/xxxx/aa.pdf'];

// 使用spawn方法执行Python脚本
const pythonProcess = spawn('python', [pythonScript, ...pythonArgs]);

// 处理Python脚本的输出
pythonProcess.stdout.on('data', (data) => {
  console.log(`Python Output:`, data.toString('utf8'));
});

// 处理Python脚本的错误
pythonProcess.stderr.on('data', (data) => {
  console.error(`Python Error: ${data}`);
});

// 监听Python脚本的退出事件
pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});