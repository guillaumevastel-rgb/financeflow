// FinanceFlow – Moteur principal
// Sections : Gestion des données, OCR, Interface, Caméra

// --- GESTION DES DONNÉES ---
let DB = [];
const DB_KEY = 'financeflow_db_v1';

function dbLoad() {
try {
DB = JSON.parse(localStorage.getItem(DB_KEY)) || [];
} catch (e) {
DB = [];
}
}

function dbSave() {
localStorage.setItem(DB_KEY, JSON.stringify(DB));
}

function addExpense(obj) {
const newExpense = {
id: Date.now(),
date: obj.date || new Date().toISOString().split('T')[0],
magasin: obj.magasin || 'Inconnu',
amount: parseFloat(obj.total) || 0,
paiement: obj.paiement || 'N/A',
category: 'Général'
};
DB.push(newExpense);
dbSave();
renderUI();
}

function deleteExpense(id) {
DB = DB.filter(x => x.id !== id);
dbSave();
renderUI();
}

// --- MODULE OCR ---
async function runOCR(file) {
const btnApply = document.getElementById('ocr-apply');
if(btnApply) {
btnApply.textContent = "Analyse en cours...";
btnApply.disabled = true;
}

// Utilise Tesseract.js (doit être chargé dans index.html)
return Tesseract.recognize(file, 'fra', {
logger: m => console.log(m)
}).then(({ data: { text } }) => {
const cleaned = text.replace(/\s+/g, ' ').trim();
const out = { total: null, date: null, magasin: null, paiement: null };

});
}

// --- INTERFACE UTILISATEUR (UI) ---
function bindUI() {
const fabAdd = document.getElementById('fab-add');
const ocrModal = document.getElementById('ocr-modal');
const ocrClose = document.getElementById('ocr-close');
const ocrFile = document.getElementById('ocr-file');
const btnCreate = document.getElementById('ocr-create');

if (fabAdd) {
fabAdd.onclick = () => { ocrModal.style.display = 'flex'; };
}

if (ocrClose) {
ocrClose.onclick = () => {
ocrModal.style.display = 'none';
stopCamera();
};
}

if (ocrFile) {
ocrFile.onchange = async (e) => {
const file = e.target.files[0];
if (!file) return;
const result = await runOCR(file);
fillOCRFields(result);
};
}

if (btnCreate) {
btnCreate.onclick = () => {
const data = {
magasin: document.getElementById('ocr-magasin').textContent.replace('—', '').trim(),
total: document.getElementById('ocr-total').textContent.replace('€', '').trim(),
date: document.getElementById('ocr-date').textContent.replace('—', '').trim(),
paiement: document.getElementById('ocr-paiement').textContent.replace('—', '').trim()
};

}
}

function fillOCRFields(data) {
if (data.total) document.getElementById('ocr-total').textContent = data.total + " €";
if (data.date) document.getElementById('ocr-date').textContent = data.date;
if (data.magasin) document.getElementById('ocr-magasin').textContent = data.magasin;
if (data.paiement) document.getElementById('ocr-paiement').textContent = data.paiement;
}

function renderUI() {
const app = document.getElementById('app');
if (!app) return;

if (DB.length === 0) {
app.innerHTML = '<div class="empty">Aucune dépense. Appuyez sur ＋ pour commencer.</div>';
return;
}

app.innerHTML = DB.sort((a,b) => b.id - a.id).map(exp => <div class="card fade-in" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:15px;"> <div> <strong>${exp.magasin}</strong><br> <small>${exp.date} • ${exp.paiement}</small> </div> <div style="text-align:right"> <div style="font-weight:bold; color:#4361ee; font-size:1.2em;">${exp.amount.toFixed(2)} €</div> <button onclick="window.deleteExpenseUI(${exp.id})" style="color:#e63946; background:none; border:none; cursor:pointer; font-size:0.8em;">Supprimer</button> </div> </div>).join('');
}

window.deleteExpenseUI = (id) => {
if(confirm("Supprimer cette dépense ?")) {
deleteExpense(id);
}
};

// --- CAMÉRA ---
let stream = null;
async function startCamera() {
const video = document.getElementById('ocr-camera');
try {
stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
video.srcObject = stream;
video.style.display = 'block';
} catch (err) {
alert("Accès caméra refusé");
}
}

function stopCamera() {
if (stream) {
stream.getTracks().forEach(t => t.stop());
stream = null;
}
}

const camBtn = document.getElementById('ocr-camera-start');
if(camBtn) camBtn.onclick = startCamera;

// --- INITIALISATION ---
dbLoad();
window.addEventListener('DOMContentLoaded', () => {
bindUI();
renderUI();
});
