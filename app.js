// ══════════════════════════════════════════════
//   AgroNutri PWA — app.js
//   Lógica principal portada desde Kotlin/Compose
// ══════════════════════════════════════════════

// ── STATE ──────────────────────────────────────
const state = {
  currentScreen: 'home',
  history: JSON.parse(localStorage.getItem('agro_history') || '[]'),
  geminiApiKey: localStorage.getItem('gemini_api_key') || '',
  chatHistory: [],
  calcResult: null,
};

// ── UTILS ──────────────────────────────────────
function saveHistory() {
  localStorage.setItem('agro_history', JSON.stringify(state.history));
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function showToast(msg, ms = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), ms);
}

function el(id) { return document.getElementById(id); }

// ── CALCULATION (ported from AgroViewModel.kt) ──
function calculateRequirements({
  targetYield, cropNPerTon, cropPPerTon, cropKPerTon,
  soilN, soilP, soilK, soilMo,
  fertNPercent, fertPPercent
}) {
  // N
  const totalNDemand = targetYield * cropNPerTon;
  const availableN   = (soilN * 2.0) + (soilMo * 20.0);
  const netNDeficit  = Math.max(0, totalNDemand - availableN);
  const fertNRate    = fertNPercent > 0 ? (netNDeficit / (fertNPercent / 100)) : 0;

  // P
  const totalPDemand = targetYield * cropPPerTon;
  const availableP   = soilP * 0.5;
  const netPDeficit  = Math.max(0, totalPDemand - availableP);
  const fertPRate    = fertPPercent > 0 ? (netPDeficit / (fertPPercent / 100)) : 0;

  // K
  const totalKDemand = targetYield * cropKPerTon;
  const availableK   = soilK * 1.2;
  const netKDeficit  = Math.max(0, totalKDemand - availableK);

  return {
    totalNDemand, availableN, netNDeficit, fertNRate,
    totalPDemand, availableP, netPDeficit, fertPRate,
    totalKDemand, availableK, netKDeficit
  };
}

// ── NAVIGATION ──────────────────────────────────
function navigateTo(screen, opts = {}) {
  state.currentScreen = screen;

  // Update bottom nav
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screen);
  });

  // Back button & save button
  const btnBack = el('btn-back');
  const btnSave = el('btn-save');
  btnBack.classList.toggle('hidden', !opts.showBack);
  btnSave.classList.toggle('hidden', screen !== 'calculator');

  // Topbar title
  const titles = {
    home: null, calculator: 'Calculadora', 'dosis-ppm': 'Dosis ➔ ppm Suelo', 'plant-doctor': 'Diagnóstico por Foto', crops: 'Base de Cultivos',
    fertilizers: 'Fertilizantes', history: 'Historial', ai: 'Consultor IA'
  };
  const titleEl = el('topbar-title');
  if (titles[screen] && titles[screen] !== null) {
    titleEl.innerHTML = `<span class="topbar-name">${titles[screen]}</span>`;
  } else {
    titleEl.innerHTML = `
      <svg class="topbar-logo" width="26" height="26" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#2d6a4f"/>
        <path d="M32 14 C32 14 20 24 20 34 C20 40.627 25.373 46 32 46 C38.627 46 44 40.627 44 34 C44 24 32 14 32 14Z" fill="#52b788"/>
        <path d="M32 20 L32 42" stroke="#b7e4c7" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <div>
        <span class="topbar-name">AgroNutri</span>
        <span class="topbar-sub">Consultoría Nutricional</span>
      </div>`;
  }

  renderScreen(screen, opts);
}

// ── SCREENS ──────────────────────────────────────
function renderScreen(name, opts = {}) {
  const container = el('screen-container');

  switch (name) {
    case 'home':        container.innerHTML = renderHome(); break;
    case 'calculator':  container.innerHTML = renderCalculator(); attachCalcEvents(); break;
    case 'dosis-ppm':   container.innerHTML = renderDosisToPpm(); attachDosisPpmEvents(); break;
    case 'plant-doctor':container.innerHTML = renderPlantDoctor(); attachPlantDoctorEvents(); break;
    case 'crops':       container.innerHTML = renderCrops(); break;
    case 'fertilizers': container.innerHTML = renderFertilizers(); break;
    case 'history':     container.innerHTML = renderHistory(); attachHistoryEvents(); break;
    case 'ai':          container.innerHTML = renderAi(); attachAiEvents(); break;
    case 'history-detail': container.innerHTML = renderHistoryDetail(opts.item); break;
  }

  // Animate bars after render
  requestAnimationFrame(() => {
    document.querySelectorAll('.fert-bar-fill[data-pct]').forEach(bar => {
      bar.style.width = bar.dataset.pct + '%';
    });
  });

  container.scrollTop = 0;
}

// ── HOME ──────────────────────────────────────────
function renderHome() {
  const count = state.history.length;
  const lastCrop = count > 0 ? state.history[0].cropName : '—';
  return `
  <div class="screen">
    <div class="hero-banner">
      <h2>🌱 Bienvenido</h2>
      <p>Herramienta de diagnóstico nutricional y recomendación de fertilización</p>
      <div class="hero-stat">
        <div class="hero-stat-item">
          <div class="val">${count}</div>
          <div class="lbl">Análisis guardados</div>
        </div>
        <div class="hero-stat-item">
          <div class="val">${CROPS.length}</div>
          <div class="lbl">Cultivos en BD</div>
        </div>
        <div class="hero-stat-item">
          <div class="val">${FERTILIZERS.length}</div>
          <div class="lbl">Fertilizantes</div>
        </div>
      </div>
    </div>

    <p class="section-title">Acciones rápidas</p>
    <div class="quick-actions">
      <div class="action-card" onclick="navigateTo('calculator')">
        <div class="action-icon green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2"/><line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div>
          <h3>Calcular NPK</h3>
          <p>Calcular dosis necesaria</p>
        </div>
      </div>
      <div class="action-card" onclick="navigateTo('plant-doctor')">
        <div class="action-icon purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/></svg>
        </div>
        <div>
          <h3>Diagnóstico Foto</h3>
          <p>Detección de enfermedades</p>
        </div>
      </div>
      <div class="action-card" onclick="navigateTo('dosis-ppm')">
        <div class="action-icon orange">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <h3>Dosis ➔ ppm</h3>
          <p>Convertir kg/ha a ppm</p>
        </div>
      </div>
      <div class="action-card" onclick="navigateTo('crops')">
        <div class="action-icon blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C12 2 6 8 6 13a6 6 0 0012 0C18 8 12 2 12 2z" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div>
          <h3>Cultivos</h3>
          <p>Ver base de datos</p>
        </div>
      </div>
      <div class="action-card" onclick="navigateTo('fertilizers')">
        <div class="action-icon orange">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div>
          <h3>Fertilizantes</h3>
          <p>Composición y usos</p>
        </div>
      </div>
      <div class="action-card" onclick="navigateTo('history')">
        <div class="action-icon teal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <div>
          <h3>Historial</h3>
          <p>${count} análisis guardados</p>
        </div>
      </div>
      <div class="action-card action-ai" onclick="navigateTo('ai', {showBack:true})">
        <div class="action-icon purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M9 15s1 2 3 2 3-2 3-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div>
          <h3>Consultor IA – Gemini</h3>
          <p>Asistente agronómico experto</p>
        </div>
      </div>
    </div>

    ${count > 0 ? `
    <p class="section-title">Último análisis</p>
    ${renderHistoryCard(state.history[0])}
    ` : ''}
  </div>`;
}

// ── CALCULATOR ─────────────────────────────────────
function renderCalculator() {
  const crop = CROPS[0];
  const fertN = FERTILIZERS.filter(f => f.nContent > 0);
  const fertP = FERTILIZERS.filter(f => f.pContent > 0);

  return `
  <div class="screen" id="calc-screen">
    <div class="card">
      <p class="section-title" style="margin-top:0">Nombre del análisis</p>
      <div class="form-group">
        <input class="form-input" id="c-name" value="Lote 1 - Muestreo Suelo" />
      </div>

      <p class="section-title">Cultivo y rendimiento objetivo</p>
      <div class="form-group">
        <label class="form-label">Cultivo</label>
        <select class="form-select" id="c-crop">
          ${CROPS.map((c,i) => `<option value="${i}">${c.name} (${c.scientificName})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Rendimiento objetivo</label>
        <div class="input-unit-wrap">
          <input class="form-input" id="c-yield" type="number" step="0.5" value="${crop.typicalYield}" />
          <span class="input-unit">t/ha</span>
        </div>
      </div>
    </div>

    <div class="card">
      <p class="section-title" style="margin-top:0">Análisis de suelo</p>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nitrógeno (N)</label>
          <div class="input-unit-wrap">
            <input class="form-input" id="c-soilN" type="number" step="1" value="15" />
            <span class="input-unit">ppm</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Fósforo (P – Bray)</label>
          <div class="input-unit-wrap">
            <input class="form-input" id="c-soilP" type="number" step="1" value="12" />
            <span class="input-unit">ppm</span>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Potasio (K)</label>
          <div class="input-unit-wrap">
            <input class="form-input" id="c-soilK" type="number" step="10" value="180" />
            <span class="input-unit">ppm</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">pH del suelo</label>
          <div class="input-unit-wrap">
            <input class="form-input" id="c-ph" type="number" step="0.1" value="6.4" />
            <span class="input-unit">pH</span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Materia Orgánica</label>
        <div class="input-unit-wrap">
          <input class="form-input" id="c-mo" type="number" step="0.1" value="2.5" />
          <span class="input-unit">%</span>
        </div>
      </div>
    </div>

    <div class="card">
      <p class="section-title" style="margin-top:0">Fertilizantes seleccionados</p>
      <div class="form-group">
        <label class="form-label">Fuente nitrogenada</label>
        <select class="form-select" id="c-fertN">
          ${fertN.map((f,i) => `<option value="${i}">${f.name} – ${f.nContent}% N</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fuente fosfatada</label>
        <select class="form-select" id="c-fertP">
          ${fertP.map((f,i) => `<option value="${i}">${f.name} – ${f.pContent}% P₂O₅</option>`).join('')}
        </select>
      </div>
    </div>

    <button class="btn btn-primary" id="btn-calc">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2"/><line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      Calcular Requerimientos
    </button>

    <div id="calc-result"></div>
  </div>`;
}

function attachCalcEvents() {
  el('c-crop').addEventListener('change', () => {
    const crop = CROPS[parseInt(el('c-crop').value)];
    el('c-yield').value = crop.typicalYield;
  });

  el('btn-calc').addEventListener('click', runCalculation);

  el('btn-save').addEventListener('click', saveAnalysis);
}

function runCalculation() {
  const cropIdx = parseInt(el('c-crop').value);
  const crop = CROPS[cropIdx];
  const fertNArr = FERTILIZERS.filter(f => f.nContent > 0);
  const fertPArr = FERTILIZERS.filter(f => f.pContent > 0);
  const fertN = fertNArr[parseInt(el('c-fertN').value)];
  const fertP = fertPArr[parseInt(el('c-fertP').value)];

  const r = calculateRequirements({
    targetYield: parseFloat(el('c-yield').value) || crop.typicalYield,
    cropNPerTon: crop.nPerTon,
    cropPPerTon: crop.pPerTon,
    cropKPerTon: crop.kPerTon,
    soilN: parseFloat(el('c-soilN').value) || 0,
    soilP: parseFloat(el('c-soilP').value) || 0,
    soilK: parseFloat(el('c-soilK').value) || 0,
    soilMo: parseFloat(el('c-mo').value) || 2,
    fertNPercent: fertN.nContent,
    fertPPercent: fertP.pContent,
  });

  state.calcResult = { r, crop, fertN, fertP,
    name: el('c-name').value,
    yield: el('c-yield').value,
    soilN: el('c-soilN').value,
    soilP: el('c-soilP').value,
    soilK: el('c-soilK').value,
    ph: el('c-ph').value,
    mo: el('c-mo').value,
  };

  el('calc-result').innerHTML = `
    <div class="result-card">
      <h3>📊 Resultados de fertilización</h3>
      <div class="npk-grid">
        <div class="npk-item n">
          <div class="el">N</div>
          <div class="val">${r.fertNRate.toFixed(0)}</div>
          <div class="unit">kg ${fertN.name}/ha</div>
        </div>
        <div class="npk-item p">
          <div class="el">P₂O₅</div>
          <div class="val">${r.fertPRate.toFixed(0)}</div>
          <div class="unit">kg ${fertP.name}/ha</div>
        </div>
        <div class="npk-item k">
          <div class="el">K₂O</div>
          <div class="val">${r.netKDeficit.toFixed(0)}</div>
          <div class="unit">kg K₂O/ha</div>
        </div>
      </div>

      <div class="result-detail-row">
        <span>Demanda total N</span>
        <span style="color:var(--c-n)">${r.totalNDemand.toFixed(1)} kg N/ha</span>
      </div>
      <div class="result-detail-row">
        <span>N disponible suelo</span>
        <span>${r.availableN.toFixed(1)} kg N/ha</span>
      </div>
      <div class="result-detail-row">
        <span>Déficit neto N</span>
        <span>${r.netNDeficit.toFixed(1)} kg N/ha</span>
      </div>
      <div class="result-detail-row" style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:12px">
        <span>Demanda total P₂O₅</span>
        <span style="color:var(--c-p)">${r.totalPDemand.toFixed(1)} kg/ha</span>
      </div>
      <div class="result-detail-row">
        <span>P disponible suelo</span>
        <span>${r.availableP.toFixed(1)} kg/ha</span>
      </div>
      <div class="result-detail-row">
        <span>Déficit neto P₂O₅</span>
        <span>${r.netPDeficit.toFixed(1)} kg/ha</span>
      </div>
      <div class="result-detail-row" style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:12px">
        <span>Demanda total K₂O</span>
        <span style="color:var(--c-k)">${r.totalKDemand.toFixed(1)} kg/ha</span>
      </div>
      <div class="result-detail-row">
        <span>K disponible suelo</span>
        <span>${r.availableK.toFixed(1)} kg/ha</span>
      </div>
    </div>`;

  el('btn-save').classList.remove('hidden');
  el('calc-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── DOSIS ➔ PPM CALCULATOR ────────────────────────
function renderDosisToPpm() {
  return `
  <div class="screen">
    <div class="card">
      <h3 style="font-size:16px; font-weight:700; color:var(--c-accent); margin-bottom:12px">🔄 Conversor: Dosis (kg/ha) ➔ ppm en Suelo</h3>
      <p style="font-size:13px; color:var(--c-text-2); margin-bottom:16px; line-height:1.5">
        Calculá cuántas partes por millón (ppm) de cada nutriente estás incorporando al suelo al aplicar una determinada cantidad de fertilizante.
      </p>

      <div class="form-group">
        <label class="form-label">Fertilizante</label>
        <select class="form-select" id="dp-fert">
          ${FERTILIZERS.map((f,i) => `<option value="${i}">${f.name} (${f.formula})</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Dosis a aplicar</label>
        <div class="input-unit-wrap">
          <input class="form-input" id="dp-dose" type="number" step="10" value="100" />
          <span class="input-unit">kg/ha</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Profundidad suelo</label>
          <div class="input-unit-wrap">
            <input class="form-input" id="dp-depth" type="number" step="5" value="20" />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Densidad aparente</label>
          <div class="input-unit-wrap">
            <input class="form-input" id="dp-density" type="number" step="0.05" value="1.25" />
            <span class="input-unit">g/cm³</span>
          </div>
        </div>
      </div>
    </div>

    <button class="btn btn-primary" id="btn-calc-dp">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Calcular ppm Aportadas
    </button>

    <div id="dp-result"></div>
  </div>`;
}

function attachDosisPpmEvents() {
  el('btn-calc-dp')?.addEventListener('click', runDosisPpmCalc);
  el('dp-fert')?.addEventListener('change', runDosisPpmCalc);
  el('dp-dose')?.addEventListener('input', runDosisPpmCalc);
  runDosisPpmCalc();
}

function runDosisPpmCalc() {
  const fert = FERTILIZERS[parseInt(el('dp-fert').value)];
  const dose = parseFloat(el('dp-dose').value) || 0;
  const depth = parseFloat(el('dp-depth').value) || 20;
  const density = parseFloat(el('dp-density').value) || 1.25;

  // Mass of 1 ha of soil in kg: depth(cm) * density(g/cm3) * 100,000
  const soilMassKg = depth * density * 100000; // e.g. 20 * 1.25 * 100000 = 2,500,000 kg

  const nKg = dose * (fert.nContent / 100);
  const p2o5Kg = dose * (fert.pContent / 100);
  const pElemKg = p2o5Kg * 0.4364; // Elemental P
  const k2oKg = dose * (fert.kContent / 100);
  const sKg = dose * (fert.sulfurContent / 100);

  const ppmN = (nKg / soilMassKg) * 1e6;
  const ppmP2O5 = (p2o5Kg / soilMassKg) * 1e6;
  const ppmP = (pElemKg / soilMassKg) * 1e6;
  const ppmK2O = (k2oKg / soilMassKg) * 1e6;
  const ppmS = (sKg / soilMassKg) * 1e6;

  el('dp-result').innerHTML = `
    <div class="result-card">
      <h3>📈 ppm incorporadas al suelo (${depth} cm)</h3>
      <div class="npk-grid">
        <div class="npk-item n">
          <div class="el">Nitrógeno (N)</div>
          <div class="val">+${ppmN.toFixed(1)}</div>
          <div class="unit">ppm (${nKg.toFixed(1)} kg N/ha)</div>
        </div>
        <div class="npk-item p">
          <div class="el">Fósforo (P₂O₅)</div>
          <div class="val">+${ppmP2O5.toFixed(1)}</div>
          <div class="unit">ppm (${p2o5Kg.toFixed(1)} kg P₂O₅/ha)</div>
        </div>
        <div class="npk-item k">
          <div class="el">Potasio (K₂O)</div>
          <div class="val">+${ppmK2O.toFixed(1)}</div>
          <div class="unit">ppm (${k2oKg.toFixed(1)} kg K₂O/ha)</div>
        </div>
      </div>

      <div class="result-detail-row">
        <span>Fósforo elemental (P)</span>
        <span style="color:var(--c-p)">+${ppmP.toFixed(1)} ppm (${pElemKg.toFixed(1)} kg P/ha)</span>
      </div>
      ${sKg > 0 ? `
      <div class="result-detail-row">
        <span>Azufre (S)</span>
        <span style="color:var(--c-warn)">+${ppmS.toFixed(1)} ppm (${sKg.toFixed(1)} kg S/ha)</span>
      </div>` : ''}
      <div class="result-detail-row" style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.08); padding-top:10px">
        <span>Masa de suelo considerada</span>
        <span>${(soilMassKg/1000).toLocaleString('es-AR')} t/ha</span>
      </div>
      <div class="result-detail-row">
        <span>Equivalencia agronómica</span>
        <span>1 ppm ≈ ${(soilMassKg/1e6).toFixed(2)} kg/ha de nutriente</span>
      </div>
    </div>`;
}

}

// ── PLANT DOCTOR (AI VISION DIAGNOSIS) ─────────────
let pdSelectedImageBase64 = null;
let pdSelectedMimeType = 'image/jpeg';

function renderPlantDoctor() {
  const hasKey = !!state.geminiApiKey;
  return `
  <div class="screen">
    <div class="card">
      <h3 style="font-size:16px; font-weight:700; color:var(--c-accent); margin-bottom:8px">📸 Diagnóstico Fitosanitario por Foto</h3>
      <p style="font-size:13px; color:var(--c-text-2); margin-bottom:16px; line-height:1.5">
        Sacá una foto a la hoja, tallo o fruto afectado (cultivos agrícolas o plantas de jardín) para identificar enfermedades, plagas o deficiencias nutricionales con Inteligencia Artificial.
      </p>

      ${!hasKey ? `
      <div class="api-key-banner">
        <strong>⚠️ API Key de Gemini requerida</strong>
        Ingresá tu API Key de Gemini para activar la visión por cámara.
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <input class="form-input" id="pd-key-input" type="password" placeholder="AIza..." />
      </div>
      <button class="btn btn-primary btn-sm" onclick="saveApiKeyFromPd()" style="margin-bottom:16px">
        Guardar API Key
      </button>
      ` : ''}

      <input type="file" id="pd-file-input" accept="image/*" capture="environment" style="display:none" />

      <div id="pd-upload-area" style="border:2px dashed var(--c-border); border-radius:var(--radius); padding:24px; text-align:center; cursor:pointer; background:var(--c-bg); transition:border-color 0.2s">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style="margin-bottom:8px; color:var(--c-primary)"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/></svg>
        <div style="font-weight:600; font-size:15px; margin-bottom:4px">Tomar Foto o Seleccionar de Galería</div>
        <div style="font-size:12px; color:var(--c-text-3)">Hacé clic aquí para abrir la cámara del teléfono</div>
      </div>

      <div id="pd-preview-container" class="hidden" style="margin-top:16px; text-align:center">
        <img id="pd-img-preview" style="max-width:100%; max-height:260px; border-radius:var(--radius-sm); border:1px solid var(--c-border); object-fit:cover" />
        <button class="btn btn-secondary btn-sm" id="btn-pd-change-img" style="margin-top:8px">
          🔄 Cambiar foto
        </button>
      </div>

      <div class="form-group" style="margin-top:16px">
        <label class="form-label">Nota o síntoma adicional (Opcional)</label>
        <input class="form-input" id="pd-notes" placeholder="Ej. Hojas inferiores en Maíz V6 con amarillamiento..." />
      </div>
    </div>

    <button class="btn btn-primary" id="btn-pd-analyze" ${!hasKey ? 'disabled' : ''}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      Diagnosticar Imagen
    </button>

    <div id="pd-result-area"></div>
  </div>`;
}

function saveApiKeyFromPd() {
  const k = el('pd-key-input')?.value.trim();
  if (!k) { showToast('⚠️ Ingresá una clave válida'); return; }
  state.geminiApiKey = k;
  localStorage.setItem('gemini_api_key', k);
  showToast('✅ Clave guardada');
  navigateTo('plant-doctor');
}

function attachPlantDoctorEvents() {
  const uploadArea = el('pd-upload-area');
  const fileInput = el('pd-file-input');
  const changeBtn = el('btn-pd-change-img');
  const analyzeBtn = el('btn-pd-analyze');

  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => fileInput.click());
    changeBtn?.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;

      pdSelectedMimeType = file.type || 'image/jpeg';
      const reader = new FileReader();
      reader.onload = function(evt) {
        const fullDataUrl = evt.target.result;
        pdSelectedImageBase64 = fullDataUrl.split(',')[1];

        el('pd-img-preview').src = fullDataUrl;
        el('pd-upload-area').classList.add('hidden');
        el('pd-preview-container').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    });
  }

  analyzeBtn?.addEventListener('click', runPlantDoctorAnalysis);
}

async function runPlantDoctorAnalysis() {
  if (!pdSelectedImageBase64) {
    showToast('⚠️ Por favor tomá o seleccioná una foto primero');
    return;
  }
  if (!state.geminiApiKey) {
    showToast('⚠️ Se requiere API Key de Gemini');
    return;
  }

  const notes = el('pd-notes')?.value.trim() || '';
  const resultArea = el('pd-result-area');

  resultArea.innerHTML = `
    <div class="result-card" style="text-align:center; padding:32px 16px">
      <div class="splash-spinner" style="margin:0 auto 16px auto"></div>
      <h4 style="color:var(--c-accent); font-size:16px; margin-bottom:6px">Analizando síntomas con IA...</h4>
      <p style="font-size:12px; color:var(--c-text-2)">Gemini Vision está examinando la imagen y patrones foliares.</p>
    </div>`;

  resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const systemPrompt = `Sos un agrónomo fitopatólogo, botánico y especialista en protección vegetal en Sudamérica. 
Analizás la imagen provista de la planta o cultivo (agrícola u ornamental).
Da tu diagnóstico claro y bien estructurado en español usando exactamente estos encabezados en negrita:

🌱 **ESPECIE / CULTIVO IDENTIFICADO**
🦠 **DIAGNÓSTICO FITOSANITARIO** (Indicar enfermedad, plaga o deficiencia nutricional)
📊 **NIVEL DE CERTEZA / GRAVEDAD**
🔍 **SÍNTOMAS OBSERVADOS EN LA IMAGEN**
🛡️ **RECOMENDACIÓN Y MANEJO** (Manejo integrado, productos sugeridos, riego o fertilización)

Sé directo, práctico y profesional.`;

    const promptText = `Analizá esta imagen. ${notes ? 'Nota del usuario: ' + notes : ''}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${state.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType: pdSelectedMimeType, data: pdSelectedImageBase64 } },
                { text: promptText }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Error al comunicarse con Gemini');
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar un diagnóstico.';

    // Format Markdown bolding & line breaks
    const formattedHtml = resultText
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--c-accent)">$1</strong>')
      .replace(/\n/g, '<br>');

    resultArea.innerHTML = `
      <div class="result-card" style="line-height:1.6; font-size:14px">
        <h3 style="font-size:17px; font-weight:700; color:var(--c-accent); margin-bottom:14px">📋 Informe de Diagnóstico Fitosanitario</h3>
        <div style="color:var(--c-text); background:rgba(0,0,0,0.2); padding:16px; border-radius:var(--radius-sm); border:1px solid var(--c-border)">
          ${formattedHtml}
        </div>
      </div>`;

  } catch (err) {
    resultArea.innerHTML = `
      <div class="card" style="border-color:var(--c-danger); margin-top:16px">
        <h4 style="color:var(--c-danger); font-weight:700; margin-bottom:6px">⚠️ Error en el diagnóstico</h4>
        <p style="font-size:13px; color:var(--c-text-2)">${err.message}</p>
      </div>`;
  }
}

function saveAnalysis() {
  if (!state.calcResult) return;
  const { r, crop, fertN, fertP, name, yield: yld, soilN, soilP, soilK, ph, mo } = state.calcResult;
  const entry = {
    id: Date.now(),
    name, cropName: crop.name, yieldTarget: yld,
    soilN, soilP, soilK, ph, mo,
    fertNName: fertN.name, fertPName: fertP.name,
    fertNRate: r.fertNRate.toFixed(1),
    fertPRate: r.fertPRate.toFixed(1),
    fertKDef: r.netKDeficit.toFixed(1),
    timestamp: Date.now()
  };
  state.history.unshift(entry);
  saveHistory();
  showToast('✅ Análisis guardado');
}

// ── HISTORY ─────────────────────────────────────
function renderHistoryCard(item) {
  return `
  <div class="history-item" onclick="showHistoryDetail(${item.id})">
    <div class="history-item-header">
      <div>
        <div class="history-item-name">${item.name}</div>
        <div class="history-item-date">🗓 ${formatDate(item.timestamp)}</div>
      </div>
      <span class="history-item-crop">${item.cropName}</span>
    </div>
    <div class="npk-chips">
      <span class="chip chip-n">N: ${item.fertNRate} kg/ha ${item.fertNName}</span>
      <span class="chip chip-p">P: ${item.fertPRate} kg/ha ${item.fertPName}</span>
      <span class="chip chip-k">K déficit: ${item.fertKDef} kg/ha</span>
    </div>
  </div>`;
}

function renderHistory() {
  return `<div class="screen">
    <p class="section-title" style="margin-top:0">${state.history.length} análisis guardados</p>
    ${state.history.length === 0 ? `
    <div class="empty-state">
      <svg width="60" height="60" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <h3>Sin análisis aún</h3>
      <p>Usá la Calculadora para crear tu primer análisis de suelo</p>
    </div>` :
    state.history.map(item => renderHistoryCard(item)).join('')}
  </div>`;
}

function attachHistoryEvents() {}

function showHistoryDetail(id) {
  const item = state.history.find(h => h.id === id);
  if (!item) return;
  navigateTo('history-detail', { showBack: true, item });
}

function renderHistoryDetail(item) {
  return `<div class="screen">
    <div class="card">
      <h2 style="font-size:18px; font-weight:700; margin-bottom:4px">${item.name}</h2>
      <span class="history-item-crop" style="display:inline-block;margin-bottom:12px">${item.cropName}</span>
      <div class="result-detail-row">
        <span>Rendimiento objetivo</span><span>${item.yieldTarget} t/ha</span>
      </div>
      <div class="result-detail-row">
        <span>N suelo</span><span>${item.soilN} ppm</span>
      </div>
      <div class="result-detail-row">
        <span>P suelo (Bray)</span><span>${item.soilP} ppm</span>
      </div>
      <div class="result-detail-row">
        <span>K suelo</span><span>${item.soilK} ppm</span>
      </div>
      <div class="result-detail-row">
        <span>pH</span><span>${item.ph}</span>
      </div>
      <div class="result-detail-row">
        <span>Materia orgánica</span><span>${item.mo}%</span>
      </div>
    </div>
    <div class="result-card">
      <h3>📊 Recomendación</h3>
      <div class="npk-grid">
        <div class="npk-item n">
          <div class="el">N</div>
          <div class="val">${parseFloat(item.fertNRate).toFixed(0)}</div>
          <div class="unit">kg ${item.fertNName}/ha</div>
        </div>
        <div class="npk-item p">
          <div class="el">P₂O₅</div>
          <div class="val">${parseFloat(item.fertPRate).toFixed(0)}</div>
          <div class="unit">kg ${item.fertPName}/ha</div>
        </div>
        <div class="npk-item k">
          <div class="el">K₂O</div>
          <div class="val">${parseFloat(item.fertKDef).toFixed(0)}</div>
          <div class="unit">kg déficit/ha</div>
        </div>
      </div>
    </div>
    <div class="result-detail-row" style="padding:12px 0">
      <span style="color:var(--c-text-3); font-size:12px">${formatDate(item.timestamp)}</span>
    </div>
    <button class="btn btn-danger btn-sm" onclick="deleteHistory(${item.id})">
      🗑 Eliminar este análisis
    </button>
  </div>`;
}

function deleteHistory(id) {
  state.history = state.history.filter(h => h.id !== id);
  saveHistory();
  showToast('Análisis eliminado');
  navigateTo('history');
}

// ── CROPS ──────────────────────────────────────────
function renderCrops() {
  return `<div class="screen">
    ${CROPS.map(c => `
    <div class="crop-card">
      <div class="crop-card-header">
        <div>
          <div class="crop-name">${c.name}</div>
          <div class="crop-sci">${c.scientificName}</div>
        </div>
        <span class="crop-yield-badge">~${c.typicalYield} t/ha</span>
      </div>
      <div class="npk-req-row">
        <div class="npk-req-item n" style="background:rgba(100,181,246,0.1); border:1px solid rgba(100,181,246,0.2)">
          <div style="font-size:10px; color:var(--c-n); font-weight:600">N</div>
          <div style="font-size:16px; font-weight:700">${c.nPerTon}</div>
          <div style="font-size:9px; color:var(--c-text-3)">kg/t</div>
        </div>
        <div class="npk-req-item p" style="background:rgba(255,138,101,0.1); border:1px solid rgba(255,138,101,0.2)">
          <div style="font-size:10px; color:var(--c-p); font-weight:600">P₂O₅</div>
          <div style="font-size:16px; font-weight:700">${c.pPerTon}</div>
          <div style="font-size:9px; color:var(--c-text-3)">kg/t</div>
        </div>
        <div class="npk-req-item k" style="background:rgba(165,214,167,0.1); border:1px solid rgba(165,214,167,0.2)">
          <div style="font-size:10px; color:var(--c-k); font-weight:600">K₂O</div>
          <div style="font-size:16px; font-weight:700">${c.kPerTon}</div>
          <div style="font-size:9px; color:var(--c-text-3)">kg/t</div>
        </div>
      </div>
      <p class="crop-desc">${c.description}</p>
    </div>`).join('')}
  </div>`;
}

// ── FERTILIZERS ────────────────────────────────────
function renderFertilizers() {
  const maxN = Math.max(...FERTILIZERS.map(f => f.nContent));
  const maxP = Math.max(...FERTILIZERS.map(f => f.pContent));
  const maxK = Math.max(...FERTILIZERS.map(f => f.kContent));

  return `<div class="screen">
    ${FERTILIZERS.map(f => `
    <div class="fert-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px">
        <div style="font-size:17px; font-weight:700">${f.name}</div>
        <span class="fert-formula">${f.formula}</span>
      </div>
      <div class="fert-bars">
        ${f.nContent > 0 ? `
        <div class="fert-bar-row">
          <span class="fert-bar-label" style="color:var(--c-n)">N</span>
          <div class="fert-bar-track">
            <div class="fert-bar-fill n" data-pct="${(f.nContent/maxN*100).toFixed(0)}" style="width:0"></div>
          </div>
          <span class="fert-bar-val">${f.nContent}%</span>
        </div>` : ''}
        ${f.pContent > 0 ? `
        <div class="fert-bar-row">
          <span class="fert-bar-label" style="color:var(--c-p)">P₂O₅</span>
          <div class="fert-bar-track">
            <div class="fert-bar-fill p" data-pct="${(f.pContent/maxP*100).toFixed(0)}" style="width:0"></div>
          </div>
          <span class="fert-bar-val">${f.pContent}%</span>
        </div>` : ''}
        ${f.kContent > 0 ? `
        <div class="fert-bar-row">
          <span class="fert-bar-label" style="color:var(--c-k)">K₂O</span>
          <div class="fert-bar-track">
            <div class="fert-bar-fill k" data-pct="${(f.kContent/maxK*100).toFixed(0)}" style="width:0"></div>
          </div>
          <span class="fert-bar-val">${f.kContent}%</span>
        </div>` : ''}
        ${f.sulfurContent > 0 ? `
        <div class="fert-bar-row">
          <span class="fert-bar-label" style="color:var(--c-warn)">S</span>
          <div class="fert-bar-track">
            <div style="height:100%; border-radius:3px; width:${f.sulfurContent/20*100}%; background:var(--c-warn); transition:width 0.6s ease"></div>
          </div>
          <span class="fert-bar-val">${f.sulfurContent}%</span>
        </div>` : ''}
      </div>
      <p class="crop-desc" style="margin-top:10px">${f.description}</p>
    </div>`).join('')}
  </div>`;
}

// ── AI CONSULTANT ──────────────────────────────────
function renderAi() {
  const hasKey = !!state.geminiApiKey;
  return `
  <div class="screen" style="padding:0; display:flex; flex-direction:column; height:calc(100vh - 64px - 72px)">
    <div id="chat-messages" class="chat-messages" style="flex:1; overflow-y:auto; padding:16px">
      ${!hasKey ? `
      <div class="api-key-banner">
        <strong>⚠️ API Key de Gemini requerida</strong>
        Para usar el consultor IA, ingresá tu API key de Google Gemini (gratuita en aistudio.google.com).
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label class="form-label">API Key de Gemini</label>
        <input class="form-input" id="api-key-input" type="password" placeholder="AIza..." />
      </div>
      <button class="btn btn-primary btn-sm" onclick="saveApiKey()" style="margin-bottom:16px">
        Guardar API Key
      </button>
      ` : ''}
      <div class="msg ai">
        <div class="msg-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/><path d="M9 15s1 2 3 2 3-2 3-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div class="msg-bubble">Hola, soy tu asistente agronómico experto en nutrición de suelos y fertilización en Argentina. ¿En qué puedo ayudarte con tus análisis de suelo o recomendaciones de fertilizantes?</div>
      </div>
      ${state.chatHistory.map(m => `
      <div class="msg ${m.isUser ? 'user' : 'ai'}">
        ${!m.isUser ? `<div class="msg-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg></div>` : ''}
        <div class="msg-bubble">${m.text}</div>
      </div>`).join('')}
      <div id="typing" class="msg ai hidden">
        <div class="msg-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2"/></svg></div>
        <div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
      </div>
    </div>
    <div class="chat-input-area">
      <textarea class="chat-textarea" id="chat-input" rows="1" placeholder="Preguntá sobre suelos, fertilizantes..."></textarea>
      <button class="btn-send" id="btn-send-chat" ${!hasKey ? 'disabled' : ''}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>`;
}

function saveApiKey() {
  const key = el('api-key-input').value.trim();
  if (!key) { showToast('⚠️ Ingresá una API key válida'); return; }
  state.geminiApiKey = key;
  localStorage.setItem('gemini_api_key', key);
  showToast('✅ API Key guardada');
  navigateTo('ai', { showBack: true });
}

function attachAiEvents() {
  const sendBtn = el('btn-send-chat');
  const input = el('chat-input');
  if (!sendBtn || !input) return;

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  sendBtn.addEventListener('click', sendChat);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
  });
}

async function sendChat() {
  const input = el('chat-input');
  const msg = input.value.trim();
  if (!msg || !state.geminiApiKey) return;

  input.value = '';
  input.style.height = 'auto';

  // Add user message
  state.chatHistory.push({ text: msg, isUser: true });
  appendChatMsg(msg, true);

  // Show typing
  el('typing')?.classList.remove('hidden');
  scrollChatToBottom();

  try {
    const systemPrompt = `Sos un agrónomo experto en nutrición de suelos y fertilización en Argentina y Sudamérica. 
Respondés en español, de forma concisa y práctica. Mencionás cultivos como maíz, soja, trigo, girasol y sorgo. 
Usás unidades del sistema métrico (kg/ha, ppm, t/ha). Cuando sea relevante, mencionás épocas de aplicación y fraccionamiento.`;

    const conversationHistory = state.chatHistory.slice(-8).map(m => ({
      role: m.isUser ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${state.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: conversationHistory,
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Error de API');
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta.';

    el('typing')?.classList.add('hidden');
    state.chatHistory.push({ text: aiText, isUser: false });
    appendChatMsg(aiText, false);

  } catch (err) {
    el('typing')?.classList.add('hidden');
    const errMsg = `Error: ${err.message}. Verificá tu API key en aistudio.google.com`;
    appendChatMsg(errMsg, false);
  }

  scrollChatToBottom();
}

function appendChatMsg(text, isUser) {
  const container = el('chat-messages');
  const div = document.createElement('div');
  div.className = `msg ${isUser ? 'user' : 'ai'}`;
  div.innerHTML = `
    ${!isUser ? `<div class="msg-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg></div>` : ''}
    <div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
  // Insert before typing indicator
  const typing = el('typing');
  if (typing) container.insertBefore(div, typing);
  else container.appendChild(div);
}

function scrollChatToBottom() {
  const c = el('chat-messages');
  if (c) setTimeout(() => c.scrollTop = c.scrollHeight, 50);
}

// ── INIT ──────────────────────────────────────────
function init() {
  // Hide splash, show app
  setTimeout(() => {
    el('splash').classList.add('hidden');
    el('app').classList.remove('hidden');
    navigateTo('home');
  }, 900);

  // Bottom nav clicks
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });

  // Back button
  el('btn-back').addEventListener('click', () => {
    navigateTo(state.currentScreen === 'history-detail' ? 'history' : 'home');
  });
}

window.addEventListener('DOMContentLoaded', init);
