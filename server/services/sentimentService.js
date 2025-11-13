// server/services/sentimentService.js
// spawns python script sentiment_module/analyze.py (project root)
// returns Promise<string> with sentiment label

const { spawn } = require('child_process');
const path = require('path');

async function runPythonAnalysis(text) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'sentiment_module', 'analyze.py');
    const python = process.env.PYTHON_BIN || 'python';
    const proc = spawn(python, [scriptPath, text], { cwd: process.cwd() });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script failed. Code:', code, 'stderr:', stderr);
        return reject(new Error('Python script execution failed.'));
      }
      try {
        const parsed = JSON.parse(stdout);
        return resolve(parsed.sentiment);
      } catch (e) {
        return reject(new Error('Invalid output from Python script.'));
      }
    });

    proc.on('error', (err) => {
      console.error('Failed to start Python:', err);
      reject(new Error('Failed to start Python process.'));
    });
  });
}

module.exports = { runPythonAnalysis };
