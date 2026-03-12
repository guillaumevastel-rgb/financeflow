// FinanceFlow – Moteur principal (version corrigée)
// Sections : OCR, Data Engine, Filters, UI, Charts, PDF, PWA

/***********************
 * OCR MODULE (advanced)
 ***********************/
async function runOCR(file) {
  // Requiert Tesseract (chargé côté page)
  return Tesseract.recognize(file, 'fra', {
    logger: m => console.log(m)
  }).then(({ data: { text } }) => {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    const out = { total: null, ht: null, tva: [], date: null, magasin: null, paiement: null };

    // DATE (formats: 12/03/2026, 12-03/2026, 12.03.26)
    const dateRegex = /(\d{2})[\/\.-](\d{2})[\/\.-](\d{2,4})/;
    const d = cleaned.match(dateRegex);
    if (d) {
      const year = d[3].length === 2 ? '20' + d[3] : d[3];
      out.date = `${year}-${d[2]}-${d[1]}`;
    }

    // TOTAL TTC
    const totalRegex = /(?:total\s*ttc|total\s*:?\s*ttc|\bttc\b)[^\d]*([\d]+[.,]\d{2})/i;
    const t = cleaned.match(totalRegex);
    if (t) {
      out.total = parseFloat(t[1].replace(',', '.'));
    }

    // HT
    const htRegex = /(?:\bht\b|hors\s*taxe)[^\d]*([\d]+[.,]\d{2})/i;
    const h = cleaned.match(htRegex);
    if (h) {
      out.ht = parseFloat(h[1].replace(',', '.'));
    }

    // TVA multi-taux : "TVA 20% 2,40" ou "TVA 5,5%: 0,55"
    const tvaRegex = /tva[^\d%]*([\d]{1,2}(?:[.,]\d{1,2})?)\s*%[^\d]*([\d]+[.,]\d{2})/gi;
    let m;
    while ((m = tvaRegex.exec(cleaned)) !== null) {
      const rate = parseFloat(m[1].replace(',', '.'));
      const amount = parseFloat(m[2].replace(',', '.'));
      if (!Number.isNaN(rate) && !Number.isNaN(amount)) {
        out.tva.push({ rate, amount });
      }
    }

    // MAGASIN (heuristique: première ligne courte)
    const firstLine = (text.split(/\r?\n/)[0] || '').trim();
    if (firstLine && firstLine.length < 40) out.magasin = firstLine;

    // MODE DE PAIEMENT
    if (/\b(cb|carte|visa|mastercard)\b/i.test(cleaned)) out.paiement = 'Carte Bancaire';
    if (/(espèces|especes|cash)/i.test(cleaned)) out.paiement = 'Espèces';

    return out;
  });
}

/***********************
 * DATA ENGINE
 ***********************/
let DB = [];
const DB_KEY = 'financeflow_db_v1';

function dbLoad() {
  try {
    DB = JSON.parse(localStorage.getItem(DB_KEY)) || [];
  } catch (e) {
    DB = [];
  }
}
function dbSave() { localStorage.setItem(DB_KEY, JSON.stringify(DB)); }

function addExpense(obj) {
  // Attends un objet {id, date(YYYY-MM-DD), category, amount(Number), note}
  DB.push(obj);
  dbSave();
}

function deleteExpense(id) {
  DB = DB.filter(x => x.id !== id);
  dbSave();
}

function updateExpense(id, data) {
  const i = DB.findIndex(x => x.id === id);
  if (i >= 0) {
    DB[i] = { ...DB[i], ...data };
    dbSave();
  }
}

function searchExpenses(q) {
  q = (q || '').toLowerCase();
  return DB.filter(x =>
    (x.category || '').toLowerCase().includes(q) ||
    (x.note || '').toLowerCase().includes(q)
  );
}

dbLoad();

/***********************
 * FILTERS
 ***********************/
function filterExpenses(opts = {}) {
  const { dateStart, dateEnd, cat, min, max, text } = opts;
  const q = (text || '').toLowerCase();

  return DB.filter(x => {
    let ok = true;

    // Dates au format ISO string (YYYY-MM-DD) ou convertir avant stockage
    if (dateStart && x.date && x.date < dateStart) ok = false;
    if (dateEnd && x.date && x.date > dateEnd) ok = false;

    if (cat && cat !== 'ALL' && x.category !== cat) ok = false;

    const amount = typeof x.amount === 'number' ? x.amount : parseFloat(String(x.amount).replace(',', '.'));
    if (min != null && amount < min) ok = false;
    if (max != null && amount > max) ok = false;

    if (q && !((x.note || '').toLowerCase().includes(q))) ok = false;

    return ok;
  });
}

/***********************
 * UI (placeholders)
 ***********************/
function renderUI() {
  console.log('Rendu UI placeholder');
  // TODO: Rendu dynamique
}
function bindUI() {
  console.log('Binding UI placeholder');
  // TODO: Ajout des listeners
}
bindUI();
renderUI();

/***********************
 * CHARTS (placeholders)
 ***********************/
let charts = { cat: null, month: null, tva: null };
function initCharts() {
  console.log('Init charts placeholder');
  // TODO: Instanciation Chart.js
}
function updateCharts() {
  console.log('Update charts placeholder');
  // TODO: MAJ des graphiques
}
initCharts();

/***********************
 * PDF EXPORT (placeholder)
 ***********************/
function exportPDF() {
  console.log('Export PDF placeholder');
  // TODO: Génération PDF (table, totaux, etc.)
}

/***********************
 * PWA BOOTSTRAP
 ***********************/
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(reg => console.log('Service Worker enregistré', reg.scope))
      .catch(err => console.error('SW registration failed', err));
  });
}
