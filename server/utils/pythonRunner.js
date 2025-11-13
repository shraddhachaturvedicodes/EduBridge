// server/utils/pythonRunner.js
// Helper to run the Python sentiment script. Returns a string like "Positive"/"Neutral"/"Negative"
const { spawn } = require('child_process');
const path = require('path');

function runPythonAnalysis(text) {
  return new Promise((resolve, reject) => {
    if (!text) return resolve(null);

    // Use the system python; the script path relative to project root:
    const script = path.join(process.cwd(), 'sentiment_module', 'analyze.py');

    // Use 'python' in PATH. If you need specific python, set PYTHON_BIN env var in .env.
    const pythonBin = process.env.PYTHON_BIN || 'python';

    const proc = spawn(pythonBin, [script, text], { cwd: process.cwd() });

    let out = '';
    let errBuf = '';

    proc.stdout.on('data', (d) => out += d.toString());
    proc.stderr.on('data', (d) => errBuf += d.toString());

    proc.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script failed. code:', code, 'stderr:', errBuf);
        return reject(new Error('Python script execution failed'));
      }
      try {
        const parsed = JSON.parse(out);
        return resolve(parsed.sentiment || null);
      } catch (e) {
        console.error('Invalid output from python script', out);
        return reject(new Error('Invalid output from python script'));
      }
    });

    proc.on('error', (err) => {
      console.error('Failed to start Python:', err);
      reject(err);
    });
  });
}

module.exports = {
  runPythonAnalysis
};
