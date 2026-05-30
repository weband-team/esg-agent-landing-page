const fs = require('fs');
const path = require('path');
const https = require('https');

const { execSync } = require('child_process');

const fontsDir = path.join(__dirname, 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = {
  'Roboto-Regular.ttf': 'https://github.com/googlefonts/roboto-2/raw/main/src/hinted/Roboto-Regular.ttf',
  'Roboto-Bold.ttf': 'https://github.com/googlefonts/roboto-2/raw/main/src/hinted/Roboto-Bold.ttf'
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    try {
      execSync(`curl -s -L -o "${dest}" "${url}"`);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

async function main() {
  for (const [filename, url] of Object.entries(fonts)) {
    const dest = path.join(fontsDir, filename);
    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest);
      if (stats.size > 1000) {
        console.log(`Font already exists and looks valid: ${filename} (${stats.size} bytes)`);
        continue;
      } else {
        console.log(`Font exists but is empty or too small (${stats.size} bytes), removing and redownloading...`);
        fs.unlinkSync(dest);
      }
    }
    try {
      console.log(`Downloading ${filename}...`);
      await downloadFile(url, dest);
    } catch (err) {
      console.error(`Error downloading ${filename}:`, err);
    }
  }
}

main();
