
// FinanceFlow – Moteur principal (placeholder avancé)
console.log('App.js – moteur avancé placeholder');

// Sections à compléter : OCR, Graphs, Filters, Export PDF, PWA


// === OCR MODULE BEGIN ===

function ocrAvailable(){ return (typeof window!=='undefined' && window.Tesseract && typeof window.Tesseract.recognize==='function'); }
async function runOCR(file) {
  console.log('OCR moteur en cours...');
  // Placeholder: full OCR logic will be inserted in later steps
  return {
    total: null,
    date: null,
    tva: [],
    ht: null,
    magasin: null,
    paiement: null
  };
}
// === OCR MODULE END ===



// === DATA ENGINE BEGIN ===
let DB = [];
const DB_KEY = 'financeflow_db_v1';

function dbLoad(){
  try { DB = JSON.parse(localStorage.getItem(DB_KEY)) || []; }
  catch(e){ DB = []; }
}

function dbSave(){ localStorage.setItem(DB_KEY, JSON.stringify(DB)); }

function addExpense(obj){ DB.push(obj); dbSave(); }
function deleteExpense(id){ DB = DB.filter(x=>x.id!==id); dbSave(); }
function updateExpense(id,data){
  let i = DB.findIndex(x=>x.id===id);
  if(i>=0){ DB[i] = {...DB[i],...data}; dbSave(); }
}

function searchExpenses(q){
  q = q.toLowerCase();
  return DB.filter(x =>
    x.category.toLowerCase().includes(q) ||
    (x.note||'').toLowerCase().includes(q)
  );
}

dbLoad();
// === DATA ENGINE END ===



// === FILTERS MODULE BEGIN ===
function filterExpenses(opts){
  const {dateStart, dateEnd, cat, min, max, text} = opts;
  return DB.filter(x=>{
    let ok = true;
    if(dateStart && x.date < dateStart) ok = false;
    if(dateEnd && x.date > dateEnd) ok = false;
    if(cat && cat !== 'ALL' && x.category !== cat) ok = false;
    if(min && x.amount < min) ok = false;
    if(max && x.amount > max) ok = false;
    if(text && !(x.note||'').toLowerCase().includes(text.toLowerCase())) ok = false;
    return ok;
  });
}
// === FILTERS MODULE END ===



// === UI MODULE BEGIN ===
function renderUI(){
  console.log('Rendu UI placeholder');
  // Placeholder: Full dynamic rendering to be implemented
}

function bindUI(){
  console.log('Binding UI placeholder');
  // Placeholder: attach event listeners for form, filters, buttons
}

// Auto-init
bindUI();
renderUI();
// === UI MODULE END ===



// === CHARTS MODULE BEGIN ===
let charts = { cat:null, month:null, tva:null };

function initCharts(){
  console.log('Init charts placeholder');
  // Placeholder: setup of Chart.js instances
}

function updateCharts(){
  console.log('Update charts placeholder');
  // Placeholder: dynamic chart updates based on DB and filters
}

initCharts();
// === CHARTS MODULE END ===



// === PDF EXPORT MODULE BEGIN ===
function exportPDF(){
  console.log('Export PDF placeholder');
  // Placeholder: full PDF rendering logic will be inserted later
  // Will include receipts, tables, totals, categories, TVA, etc.
}
// === PDF EXPORT MODULE END ===



// === PWA BOOTSTRAP MODULE BEGIN ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => {
        console.log('Service Worker enregistré', reg.scope);
      })
      .catch(err => console.error('SW registration failed', err));
  });
}
// === PWA BOOTSTRAP MODULE END ===



// === OCR MODULE ADVANCED BEGIN ===
async function runOCR(file){
  return Tesseract.recognize(file, 'fra', {
    logger:m=>console.log(m)
  }).then(({ data:{ text } }) => {
    let cleaned = text.replace(/\s+/g,' ').trim();
    let out = { total:null, ht:null, tva:[], date:null, magasin:null, paiement:null };

    // DATE extraction
    let dateRegex = /(\d{2})[\/\.-](\d{2})[\/\.-](\d{2,4})/;
    let d = cleaned.match(dateRegex);
    if(d){ out.date = `${d[3].length===2?'20'+d[3]:d[3]}-${d[2]}-${d[1]}`; }

    // TOTAL TTC extraction
    let totalRegex = /(total ttc|total\s*:|ttc)[^0-9]*([0-9]+[\.,][0-9]{2})/i;
    let t = cleaned.match(totalRegex);
    if(t){ out.total = parseFloat(t[2].replace(',', '.')); }

    // HT extraction
    let htRegex = /(ht|hors taxe)[^0-9]*([0-9]+[\.,][0-9]{2})/i;
    let h = cleaned.match(htRegex);
    if(h){ out.ht = parseFloat(h[2].replace(',', '.')); }

    // TVA extraction multi-rate
    let tvaRegex = /(tva[^0-9]*([0-9]{1,2}[\.,][0-9]{2})).*?([0-9]{1,2}[\.,]?[0-9]{0,2})%/gi;
    let m;
    while((m = tvaRegex.exec(cleaned)) !== null){
      out.tva.push({ amount: parseFloat(m[2].replace(',', '.')), rate: m[3] });
    }

    // MAGASIN (heuristic: first word in text)
    let firstLine = text.split(/
/)[0].trim();
    if(firstLine.length < 40) out.magasin = firstLine;

    // PAIEMENT detection
    if(/cb|carte|visa|mastercard/i.test(cleaned)) out.paiement = 'Carte Bancaire';
    if(/espèces|especes|cash/i.test(cleaned)) out.paiement = 'Espèces';

    return out;
  });
}
// === OCR MODULE ADVANCED END ===

