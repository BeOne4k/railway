const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, 'node_modules', 'bpg-nino-mtavruli', 'fonts', 'bpg-nino-mtavruli-webfont.ttf');

fs.readFile(fontPath, (err, data) => {
  if (err) {
    console.error('Failed to read font file:', err);
    return;
  }
  const base64Font = data.toString('base64');
  console.log(base64Font);
});