let allData = [];
let currentPdf = null;
let currentPage = 1;
let totalPages = 0;
let selectedDia = null;
let pdfMap = {};
const pdfjs = window['pdfjsLib'] || window['pdfjs-dist/build/pdf'];

// Espera o PDF.js estar carregado
function initPdfJs() {
  if (typeof pdfjs !== 'undefined' && pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
}

function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBookName(livro) {
  if (!livro) return '';
  const parts = livro.split('-').map(p => p.trim());
  return parts.length ? parts[parts.length - 1] : livro;
}

async function findPageForChapter(pdf, livro, chapter) {
  const bookName = normalizeText(extractBookName(livro));
  const chapterToken = `${chapter}`;
  for (let page = 1; page <= pdf.numPages; page += 1) {
    try {
      const pdfPage = await pdf.getPage(page);
      const textContent = await pdfPage.getTextContent();
      const pageText = normalizeText(textContent.items.map(item => item.str).join(' '));
      const candidate = `${bookName} ${chapterToken}`;
      const candidate2 = `${bookName}${chapterToken}`;
      if (pageText.includes(candidate) || pageText.includes(candidate2)) {
        return page;
      }
    } catch (err) {
      console.warn('Erro lendo página PDF', page, err);
    }
  }
  return 1;
}

async function fetchData() {
  const res = await fetch('/api/bible');
  if (!res.ok) {
    document.body.innerHTML = '<p>Erro ao carregar dados. Rode o import script no servidor.</p>';
    return [];
  }
  return res.json();
}

function parseBibleReference(ref) {
  const match = ref.match(/(\d+)/);
  return match ? parseInt(match[1]) : 1;
}

function buildPdfMap(data) {
  data.forEach(row => {
    const chapter = parseBibleReference(row['Capítulos/Passagem']);
    pdfMap[row.Dia] = {
      livro: row['Período/Livro'],
      capitulos: row['Capítulos/Passagem'],
      chapter: chapter,
      page: null
    };
  });
}

async function toggleConcluido(dia, currentStatus, e) {
  e.stopPropagation();
  const newStatus = currentStatus === '☑' ? '☐' : '☑';
  try {
    const res = await fetch(`/api/bible/${dia}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concluido: newStatus === '☑' })
    });
    if (res.ok) {
      const result = await res.json();
      const item = allData.find(d => d.Dia === dia);
      if (item) {
        item['☑ Concluído'] = result.item['☑ Concluído'];
        renderTable(allData, document.getElementById('q').value);
      }
    }
  } catch (err) {
    console.error('Erro ao atualizar:', err);
  }
}

async function openBibleDay(dia) {
  selectedDia = dia;
  const pdfFile = `/api/pdf?dia=${dia}`;
  try {
    const pdf = await pdfjs.getDocument(pdfFile).promise;
    currentPdf = pdf;
    totalPages = pdf.numPages;
    const info = pdfMap[dia] || {};
    document.getElementById('pdf-title').textContent = `${info.livro} - ${info.capitulos}`;
    const startPage = info.page || await findPageForChapter(pdf, info.livro, info.chapter);
    if (!info.page) {
      pdfMap[dia].page = startPage;
    }
    currentPage = startPage;
    await renderPdfPage(startPage);
    highlightDiaRow(dia);
  } catch (err) {
    console.error('Erro ao abrir PDF:', err);
    document.getElementById('pdf-viewer').innerHTML = '<div class="pdf-no-file">Erro ao carregar o PDF. Certifique-se que o arquivo PDF está em server/pdf/biblia.pdf</div>';
  }
}

async function renderPdfPage(pageNum) {
  if (!currentPdf || pageNum < 1 || pageNum > totalPages) return;
  currentPage = pageNum;
  const page = await currentPdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.classList.add('pdf-canvas');
  
  await page.render({ canvasContext: ctx, viewport }).promise;
  
  const viewer = document.getElementById('pdf-viewer');
  viewer.innerHTML = '';
  viewer.appendChild(canvas);
  
  document.getElementById('pdf-page').textContent = `${pageNum} / ${totalPages}`;
}

function highlightDiaRow(dia) {
  document.querySelectorAll('tbody tr').forEach(r => r.classList.remove('active'));
  const row = document.querySelector(`tbody tr[data-dia="${dia}"]`);
  if (row) row.classList.add('active');
}

function renderTable(data, q) {
  const thead = document.getElementById('thead');
  const tbody = document.getElementById('tbody');
  thead.innerHTML = '';
  tbody.innerHTML = '';
  if (!data || data.length === 0) return;

  const keys = Object.keys(data[0]);
  const tr = document.createElement('tr');
  keys.forEach(k => { const th = document.createElement('th'); th.textContent = k; tr.appendChild(th); });
  thead.appendChild(tr);

  const filtered = data.filter(row => {
    if (!q) return true;
    const s = JSON.stringify(row).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  document.getElementById('count').textContent = `${filtered.length} / ${data.length} registros`;

  filtered.forEach(row => {
    const r = document.createElement('tr');
    r.dataset.dia = row.Dia;
    r.addEventListener('click', () => openBibleDay(row.Dia));
    
    keys.forEach(k => {
      const td = document.createElement('td');
      if (k === '☑ Concluído') {
        const checkbox = document.createElement('button');
        checkbox.textContent = row[k] == null ? '☐' : row[k];
        checkbox.addEventListener('click', (e) => toggleConcluido(row.Dia, row[k], e));
        td.appendChild(checkbox);
      } else {
        td.textContent = row[k] == null ? '' : row[k];
      }
      r.appendChild(td);
    });
    tbody.appendChild(r);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  initPdfJs();
  allData = await fetchData();
  buildPdfMap(allData);
  const input = document.getElementById('q');
  renderTable(allData, '');
  input.addEventListener('input', () => renderTable(allData, input.value));
  
  document.getElementById('pdf-next').addEventListener('click', () => {
    if (currentPdf && currentPage < totalPages) renderPdfPage(currentPage + 1);
  });
  document.getElementById('pdf-prev').addEventListener('click', () => {
    if (currentPdf && currentPage > 1) renderPdfPage(currentPage - 1);
  });
});
