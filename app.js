// FinanceFlow – Moteur principal (Version Finale)
// Gère le stockage, l'OCR, l'affichage et les exports.

/***********************

GESTION DES DONNÉES
***********************/
let DB = [];
const DB_KEY = 'frais_v5'; // Même clé que dans l'index pour conserver vos données

function dbLoad() {
try {
DB = JSON.parse(localStorage.getItem(DB_KEY)) || [];
} catch (e) {
DB = [];
}
}

function dbSave() {
localStorage.setItem(DB_KEY, JSON.stringify(DB));
renderUI(); // Met à jour l'écran après chaque changement
}

/***********************

MODULE OCR (Analyse de ticket)
***********************/
async function runOCR(file) {
const progressBar = document.getElementById('progress-bar');
const statusDiv = document.getElementById('ocr-status');
const statusPerc = document.getElementById('ocr-perc');

if (statusDiv) statusDiv.style.display = 'block';

return Tesseract.recognize(file, 'fra', {
logger: m => {
if (m.status === 'recognizing text' && progressBar) {
const progress = Math.round(m.progress * 100);
progressBar.style.width = progress + '%';
statusPerc.innerText = progress + '%';
}
}
}).then(({ data: { text } }) => {
const cleaned = text.replace(/\s+/g, ' ').trim();
const result = { total: null, date: null };

});
}

/***********************

RENDU DE L'INTERFACE (UI)
***********************/
function renderUI() {
const listContainer = document.getElementById('l');
const searchInput = document.getElementById('recherche');
const query = searchInput ? searchInput.value.toLowerCase() : "";

if (!listContainer) return;

let totalTtc = 0, totalTvaGlobal = 0;
let statsTva = { "20": 0, "10": 0, "5.5": 0, "2.1": 0 };

listContainer.innerHTML = '';

// Filtrage et tri (le plus récent en haut)
const filtered = DB.filter(x =>
(x.ct || '').toLowerCase().includes(query) ||
(x.nt || '').toLowerCase().includes(query)
).sort((a, b) => b.dt.localeCompare(a.dt));

filtered.forEach(x => {
totalTtc += x.mt;
let tvaHtml = '';

});

// Mise à jour des compteurs du Header
if (document.getElementById('totalTTC')) document.getElementById('totalTTC').innerText = totalTtc.toFixed(2) + ' €';
if (document.getElementById('stat-tva20')) document.getElementById('stat-tva20').innerText = statsTva["20"].toFixed(2);
if (document.getElementById('stat-tva10')) document.getElementById('stat-tva10').innerText = statsTva["10"].toFixed(2);
if (document.getElementById('stat-tva5')) document.getElementById('stat-tva5').innerText = statsTva["5.5"].toFixed(2);
if (document.getElementById('totalTVA')) document.getElementById('totalTVA').innerText = totalTvaGlobal.toFixed(2);
}

/***********************

ACTIONS & LISTENERS
***********************/
function bindUI() {
const form = document.getElementById('f');
const fileInput = document.getElementById('i');

if (fileInput) {
fileInput.onchange = async (e) => {
const file = e.target.files[0];
if (!file) return;
const result = await runOCR(file);
if (result.total) document.getElementById('m').value = result.total;
if (result.date) document.getElementById('d').value = result.date;
};
}

if (form) {
form.onsubmit = (e) => {
e.preventDefault();

}
}

// Global pour le bouton supprimer
window.deleteExpense = (id) => {
if(confirm('Supprimer cette dépense ?')) {
DB = DB.filter(x => x.id !== id);
dbSave();
}
};

// Initialisation au chargement
dbLoad();
document.addEventListener('DOMContentLoaded', () => {
bindUI();
renderUI();
});
