const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const importExcel = require('./import_excel');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'data.json');

app.use(express.static(path.join(__dirname, '..', 'client')));

app.get('/api/bible', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.status(404).json({ error: 'Dados não encontrados. Rode o import script.' });
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ler dados.' });
  }
});

app.get('/api/pdf', (req, res) => {
  const pdfPath = path.join(__dirname, 'pdf', 'biblia.pdf');
  if (!fs.existsSync(pdfPath)) {
    return res.status(404).json({ error: 'PDF não encontrado em server/pdf/biblia.pdf' });
  }
  res.sendFile(pdfPath);
});

app.patch('/api/bible/:dia', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.status(404).json({ error: 'Dados não encontrados.' });
  }
  try {
    const dia = parseInt(req.params.dia);
    const concluido = req.body.concluido;
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    let data = JSON.parse(raw);
    const item = data.find(d => d.Dia === dia);
    if (!item) {
      return res.status(404).json({ error: 'Dia não encontrado.' });
    }
    item['☑ Concluído'] = concluido ? '☑' : '☐';
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.json({ ok: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/import', async (req, res) => {
  const filePath = req.body && req.body.path ? req.body.path : process.env.FILE_PATH;
  try {
    const out = await importExcel(filePath);
    res.json({ ok: true, saved: out });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
