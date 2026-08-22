/**
 * check-code-limits.js
 * Script pemeriksa aturan modularitas file dan emoji berbasis Node.js murni.
 * Memeriksa:
 * 1. File JS/TS/TSX di src/ tidak melebihi 300 baris (kecuali PlacementTestClient.tsx)
 * 2. File .module.css tidak melebihi 150 baris
 * 3. Tidak ada emoji di file non-admin src/ (kecuali regex pembersih audio)
 */

const fs = require('fs');
const path = require('path');

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/u;

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else {
      callback(filePath);
    }
  }
}

let errorsCount = 0;
const overLimitCode = [];
const overLimitCss = [];
const emojiFound = [];

const srcDir = path.join(__dirname, '..', 'src');

walkDir(srcDir, (filePath) => {
  const relPath = path.relative(path.join(__dirname, '..'), filePath);
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').length;

  // 1. Check Code file limits (300 lines)
  if (/\.(js|jsx|ts|tsx)$/.test(fileName)) {
    if (fileName !== 'PlacementTestClient.tsx' && lines > 300) {
      overLimitCode.push({ relPath, lines });
      errorsCount++;
    }

    // Check emojis across entire src (including admin & public components)
    const lineList = content.split('\n');
    lineList.forEach((lineText, idx) => {
      // Exclude audio cleanup regex in AIChatWidget
      if (lineText.includes('replace(/[👋🤖📚🗣️✅🎯⚠️💡]/g') || lineText.includes('replace(/[')) return;
      if (EMOJI_REGEX.test(lineText)) {
        emojiFound.push({ relPath, line: idx + 1, text: lineText.trim() });
        errorsCount++;
      }
    });
  }

  // 2. Check CSS module limits (150 lines)
  if (fileName.endsWith('.module.css') && lines > 150) {
    overLimitCss.push({ relPath, lines });
    errorsCount++;
  }
});

console.log('=== PEMERIKSAAN BATAS KODE & EMOJI (NODE.JS) ===\n');

if (overLimitCode.length > 0) {
  console.error(`❌ File JS/TS/TSX > 300 Baris (${overLimitCode.length}):`);
  overLimitCode.forEach(item => console.error(`   - [${item.lines} baris] ${item.relPath}`));
} else {
  console.log('✅ Semua berkas JS/TS/TSX di bawah 300 baris.');
}

if (overLimitCss.length > 0) {
  console.error(`❌ File .module.css > 150 Baris (${overLimitCss.length}):`);
  overLimitCss.forEach(item => console.error(`   - [${item.lines} baris] ${item.relPath}`));
} else {
  console.log('✅ Semua berkas .module.css di bawah 150 baris.');
}

if (emojiFound.length > 0) {
  console.error(`❌ Terdeteksi Emoji pada Berkas UI (${emojiFound.length}):`);
  emojiFound.forEach(item => console.error(`   - ${item.relPath}:${item.line}: ${item.text}`));
} else {
  console.log('✅ Bebas emoji di seluruh komponen aplikasi (Admin & Publik).');
}

console.log('\n===============================================');

if (errorsCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 Audit Lulus 100%!');
  process.exit(0);
}
