const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  const padding = size * 0.1;
  const radius = size * 0.18;
  
  // Flat rounded square background - solid color
  ctx.beginPath();
  ctx.moveTo(padding + radius, padding);
  ctx.lineTo(size - padding - radius, padding);
  ctx.quadraticCurveTo(size - padding, padding, size - padding, padding + radius);
  ctx.lineTo(size - padding, size - padding - radius);
  ctx.quadraticCurveTo(size - padding, size - padding, size - padding - radius, size - padding);
  ctx.lineTo(padding + radius, size - padding);
  ctx.quadraticCurveTo(padding, size - padding, padding, size - padding - radius);
  ctx.lineTo(padding, padding + radius);
  ctx.quadraticCurveTo(padding, padding, padding + radius, padding);
  ctx.closePath();
  
  ctx.fillStyle = '#6c63ff';
  ctx.fill();
  
  // Larger centered profile
  const faceY = size * 0.4;
  const faceSize = size * 0.28;
  const centerX = size * 0.5;
  
  // Head circle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(centerX, faceY, faceSize * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Neck
  ctx.fillRect(centerX - faceSize * 0.18, faceY + faceSize * 0.35, faceSize * 0.36, faceSize * 0.3);
  
  // Shoulders
  ctx.beginPath();
  ctx.ellipse(centerX, faceY + faceSize * 0.65, faceSize * 0.5, faceSize * 0.18, 0, Math.PI, 0);
  ctx.fill();
  
  // Translation arrows below - closer to person
  const arrowY = size * 0.68;
  const arrowLen = size * 0.09;
  const arrowHeadSize = size * 0.02;
  const arrowSpacing = size * 0.035;
  
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.025;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Right arrow
  ctx.beginPath();
  ctx.moveTo(centerX - arrowLen / 2, arrowY);
  ctx.lineTo(centerX + arrowLen / 2, arrowY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + arrowLen / 2, arrowY);
  ctx.lineTo(centerX + arrowLen / 2 - arrowHeadSize * 2.5, arrowY - arrowHeadSize * 2.5);
  ctx.lineTo(centerX + arrowLen / 2 - arrowHeadSize * 2.5, arrowY + arrowHeadSize * 2.5);
  ctx.closePath();
  ctx.fill();
  
  // Left arrow - spaced apart
  ctx.beginPath();
  ctx.moveTo(centerX + arrowLen / 2, arrowY + arrowSpacing);
  ctx.lineTo(centerX - arrowLen / 2, arrowY + arrowSpacing);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX - arrowLen / 2, arrowY + arrowSpacing);
  ctx.lineTo(centerX - arrowLen / 2 + arrowHeadSize * 2.5, arrowY + arrowSpacing + arrowHeadSize * 6);
  ctx.lineTo(centerX - arrowLen / 2 + arrowHeadSize * 2.5, arrowY + arrowSpacing + arrowHeadSize);
  ctx.closePath();
  ctx.fill();
  
  // Export as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icons/${size}.png`, buffer);
  console.log(`Generated icons/${size}.png (${buffer.length} bytes)`);
}

createIcon(16);
createIcon(32);
createIcon(48);
createIcon(128);

console.log('All icons generated successfully!');
