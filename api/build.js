const fs = require('fs');
const path = require('path');
const cp = require('child_process');

console.log('==============================================');
console.log('Starting RailTrack India Vercel Build Process');
console.log('Current working directory:', process.cwd());
console.log('==============================================');

// Detect where the frontend source is located
let frontendDir = '.';
if (fs.existsSync('src/App.tsx')) {
  frontendDir = '.';
} else if (fs.existsSync('frontend/src/App.tsx')) {
  frontendDir = 'frontend';
} else if (fs.existsSync('../frontend/src/App.tsx')) {
  frontendDir = '../frontend';
} else if (fs.existsSync('../../frontend/src/App.tsx')) {
  frontendDir = '../../frontend';
}

const targetDir = path.resolve(frontendDir);
console.log('Resolved frontend directory:', targetDir);

// 1. Install frontend dependencies
console.log('Running npm install in:', targetDir);
cp.execSync('npm install', { cwd: targetDir, stdio: 'inherit' });

// 2. Build frontend using Vite
console.log('Running npm run build in:', targetDir);
cp.execSync('npm run build', { cwd: targetDir, stdio: 'inherit' });

const builtDist = path.join(targetDir, 'dist');
console.log('Frontend build successful. Output at:', builtDist);

// Helper function to mirror directory
function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

// 3. Mirror dist to root/dist and frontend/dist so Vercel finds it anywhere
const possibleRoots = [
  process.cwd(),
  path.resolve(process.cwd(), '..'),
  path.resolve(targetDir, '..')
];

possibleRoots.forEach(rootPath => {
  try {
    const rDist = path.join(rootPath, 'dist');
    const fDist = path.join(rootPath, 'frontend', 'dist');
    if (rDist !== builtDist) copyFolderSync(builtDist, rDist);
    if (fDist !== builtDist) copyFolderSync(builtDist, fDist);
  } catch (err) {
    // Ignore non-fatal copy errors
  }
});

console.log('==============================================');
console.log('RailTrack Build Completed Successfully!');
console.log('==============================================');
