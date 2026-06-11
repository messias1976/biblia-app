const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function importExcel(filePath) {
  const defaultPath = path.join(__dirname, 'data', 'Bíblia Toda em 180 Dias.xlsx');
  const desktopPath = 'C:/Users/messi/OneDrive/Desktop/Bíblia Toda em 180 Dias.xlsx';
  const fp = filePath || process.env.FILE_PATH || (fs.existsSync(defaultPath) ? defaultPath : desktopPath);

  if (!fs.existsSync(fp)) throw new Error(`Arquivo não encontrado: ${fp}`);

  const wb = XLSX.readFile(fp, { cellDates: true });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(ws, { defval: null });

  const outDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'data.json');
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf8');
  return outPath;
}

if (require.main === module) {
  const arg = process.argv[2];
  importExcel(arg).then(p => console.log('Saved:', p)).catch(e => { console.error(e.message); process.exit(1); });
}

module.exports = importExcel;
