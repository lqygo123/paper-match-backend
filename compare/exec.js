const { spawn } = require("child_process");
const path = require('path')


// method = "compare_digital" | "compare_scan"
function runPythonScript(options) {
  const { method, pdf1, pdf2, exclude } = options;
  const pyAbsPath = path.join(__dirname, method + '.py')
  const args = [pyAbsPath];

  args.push(pdf1);
  args.push(pdf2);
  if (exclude) args.push("--exclude", exclude);
  return new Promise((resolve) => {

    console.log('spawn python', ...args)
    let spanPythonArgs = args.join(' ')
    const python = spawn("python", args, {
      cwd: __dirname,
      windowsHide: true,
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
      resolve({
        dataString,
        errorString,
        code,
        spanPythonArgs
      });
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
