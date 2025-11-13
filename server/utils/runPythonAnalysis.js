// server/utils/runPythonAnalysis.js
const { spawn } = require('child_process');

const runPythonAnalysis = (text) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['sentiment_module/analyze.py', text], {
      cwd: process.cwd(),
    });

    let out = '';
    let errOut = '';

    pythonProcess.stdout.on('data', (c) => (out += c.toString()));
    pythonProcess.stderr.on('data', (c) => (errOut += c.toString()));

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script failed (code ${code}):`, errOut);
        return reject(new Error('Python script execution failed.'));
      }
      try {
        const parsed = JSON.parse(out);
        resolve(parsed.sentiment);
      } catch (e) {
        console.error('Invalid JSON from python script:', out);
        reject(new Error('Invalid output from Python script.'));
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err.message || err);
      reject(new Error('Failed to start Python process.'));
    });
  });
};

module.exports = { runPythonAnalysis };
