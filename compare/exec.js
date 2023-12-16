const { spawn } = require("child_process");
const path = require('path')
// const fs = require('fs-extra')


// method = "compare_digital" | "compare_scan"
function runPythonScript(options) {
  const { method, pdf1, pdf2, exclude, text_thresh, filter_thresh, image_thresh } = options;

  // const python = spawn('python', ['compare_digital.py', 'D:/paper-match/paper-match-backend/compare/pdf1.pdf', 'D:/paper-match/paper-match-backend/compare/pdf2.pdf', '--text_thresh', '0.4', '--filter_thresh', '20']);
  const pyAbsPath = path.join(__dirname, method + '.py')
  const args = [pyAbsPath];
  args.push(pdf1);
  args.push(pdf2);
  if (exclude) args.push("--exclude", exclude);
  // args.push("--text_thresh", text_thresh || "0.1");
  // args.push("--filter_thresh", filter_thresh || '6');
  // if (image_thresh) args.push("--image_thresh", image_thresh)

  return new Promise((resolve, reject) => {

    console.log('spawn python', ...args)
    const python = spawn("python", args, {
      cwd: __dirname,
    });

    let dataString = "";
    let errorString = "";

    python.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorString += data.toString();
      console.error(`stderr: ${data}`);
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(`Python script exited with code ${code}: ${errorString}`)
        );
      } else {
        // fs.writeFileSync(`output-${Date.now()}.json`, dataString)
        resolve(dataString);
      }
    });
  });
}

module.exports = runPythonScript

// const fs = require("fs");
// const test = async () => {
//   const res = await runPythonScript({
//     method: "compare_scan",
//     pdf1: "D:/paper-match/paper-match-backend/compare/pdf1.pdf",
//     pdf2: "D:/paper-match/paper-match-backend/compare/pdf2.pdf",
//     text_thresh: "0.4",
//     filter_thresh: "20",
//   });
//   fs.writeFileSync(
//     "D:/paper-match/paper-match-backend/compare/output1.json",
//     res
//   );
// };

// test();
