const fs = require('fs');
const path = require('path');
const { createCanvas } = (() => {
  try { return require('canvas'); } catch (e) { return { createCanvas: null }; }
})();

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate simple valid PNG using canvas if available, or minimalist valid raw PNG
function createPng(size, filename) {
  const canvas = createCanvas ? createCanvas(size, size) : null;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    // Background
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    // Leaf / Plant symbol
    ctx.fillStyle = '#52b788';
    ctx.beginPath();
    ctx.ellipse(size/2, size/2, size*0.25, size*0.35, Math.PI/6, 0, Math.PI*2);
    ctx.fill();

    fs.writeFileSync(path.join(iconsDir, filename), canvas.toBuffer('image/png'));
  } else {
    // Fallback: minimalist valid 1x1 green PNG scaled up or raw 1x1 transparent PNG if canvas not installed
    const base64Png = "iVBORw0KGgoAAAANSU5EUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    fs.writeFileSync(path.join(iconsDir, filename), Buffer.from(base64Png, 'base64'));
  }
}

createPng(192, 'icon-192.png');
createPng(512, 'icon-512.png');
console.log('Icons created successfully in icons/');
