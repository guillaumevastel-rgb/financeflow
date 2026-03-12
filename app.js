// FinanceFlow – Moteur principal
// Ce fichier gère : le stockage local, l'OCR (lecture de ticket) et l'affichage des cartes.

// --- 1. GESTION DES DONNÉES ---
let DB = [];
const DB_KEY = 'frais_v5'; // Utilisation de la même clé que votre fichier HTML pour la compatibilité.

// Charge les données au démarrage
function dbLoad() {
try {
DB = JSON.parse(localStorage.getItem(DB_KEY)) || [];
} catch (e) {
DB = [];
}
}

// Sauvegarde et rafraîchit l'interface
function dbSave() {
localStorage.setItem(DB_KEY, JSON.stringify(DB));
renderUI();
}

// --- 2. MODULE OCR (Lecture du ticket) ---
async function runOCR(file) {
const progressBar = document.getElementById('progress-bar');
const statusDiv = document.getElementById('ocr-status');
const statusPerc = document.getElementById('ocr-perc');

if (statusDiv) statusDiv.style.display = 'block';

// Utilisation de Tesseract.js pour extraire le texte de l'image.
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

// --- 3. RENDU DE L'INTERFACE (Cartes de dépenses) ---
function renderUI() {
const listContainer = document.getElementById('l');
const searchInput = document.getElementById('recherche');
const query = searchInput ? searchInput.value.toLowerCase() : "";

if (!listContainer) return;

let totalTtc = 0, totalTvaGlobal = 0;
let statsTva = { "20": 0, "10": 0, "5.5": 0, "2.1": 0 };

listContainer.innerHTML = '';

// Filtre et tri par date.
const filtered = DB.filter(x =>
(x.ct || '').toLowerCase().includes(query) ||
(x.nt || '').toLowerCase().includes(query)
).sort((a, b) => b.dt.localeCompare(a.dt));

filtered.forEach(x => {
totalTtc += x.mt;
let tvaHtml = '';

});

// Mise à jour des totaux dans le header.
if (document.getElementById('totalTTC')) document.getElementById('totalTTC').innerText = totalTtc.toFixed(2) + ' €';
if (document.getElementById('stat-tva20')) document.getElementById('stat-tva20').innerText = statsTva["20"].toFixed(2);
if (document.getElementById('stat-tva10')) document.getElementById('stat-tva10').innerText = statsTva["10"].toFixed(2);
if (document.getElementById('stat-tva5')) document.getElementById('stat-tva5').innerText = statsTva["5.5"].toFixed(2);
if (document.getElementById('totalTVA')) document.getElementById('totalTVA').innerText = totalTvaGlobal.toFixed(2);
}

// --- 4. ÉVÉNEMENTS ---
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

// Suppression globale
window.deleteExpense = (id) => {
if(confirm('Supprimer cette dépense ?')) {
DB = DB.filter(x => x.id !== id);
dbSave();
}
};

// Initialisation
dbLoad();
document.addEventListener('DOMContentLoaded', () => {
bindUI();
renderUI();
});
