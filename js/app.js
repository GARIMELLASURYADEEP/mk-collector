const STORAGE_KEY = 'mkmobile-tracker-data';

const defaultData = {
  souls: [],
  crystals: [],
  koins: [],
  prediction: {
    avgSoulsPerDay: 0,
    note: ''
  }
};

let appData = loadData();
let soulsEditId = null;
let crystalsEditId = null;
let koinsEditId = null;

const elements = {
  pages: document.querySelectorAll('.page'),
  navButtons: document.querySelectorAll('.nav-link'),
  mobileActions: document.querySelectorAll('.nav-action[data-menu]'),
  mobileSheetOverlay: document.getElementById('mobileSheetOverlay'),
  mobileSheetTitle: document.getElementById('mobileSheetTitle'),
  mobileSheetBody: document.getElementById('mobileSheetBody'),
  mobileSheetClose: document.getElementById('mobileSheetClose'),
  totalSouls: document.getElementById('totalSouls'),
  totalCrystals: document.getElementById('totalCrystals'),
  totalKoins: document.getElementById('totalKoins'),
  todaysCollection: document.getElementById('todaysCollection'),
  weeklyTotals: document.getElementById('weeklyTotals'),
  monthlyTotals: document.getElementById('monthlyTotals'),
  dashboardRecent: document.getElementById('dashboardRecent'),
  soulsDailyAvg: document.getElementById('soulsDailyAvg'),
  soulsWeeklyAvg: document.getElementById('soulsWeeklyAvg'),
  soulsMonthlyAvg: document.getElementById('soulsMonthlyAvg'),
  soulsForm: document.getElementById('soulsForm'),
  soulsAmount: document.getElementById('soulsAmount'),
  soulsDate: document.getElementById('soulsDate'),
  soulsSource: document.getElementById('soulsSource'),
  soulsCustomSourceGroup: document.getElementById('soulsCustomSourceGroup'),
  soulsCustomSource: document.getElementById('soulsCustomSource'),
  soulsNote: document.getElementById('soulsNote'),
  soulsHistory: document.getElementById('soulsHistory'),
  soulsSubmit: document.getElementById('soulsSubmit'),
  soulsCancelEdit: document.getElementById('soulsCancelEdit'),
  crystalsForm: document.getElementById('crystalsForm'),
  crystalsAmount: document.getElementById('crystalsAmount'),
  crystalsDate: document.getElementById('crystalsDate'),
  crystalsReason: document.getElementById('crystalsReason'),
  crystalsHistory: document.getElementById('crystalsHistory'),
  crystalsSubmit: document.getElementById('crystalsSubmit'),
  crystalsCancelEdit: document.getElementById('crystalsCancelEdit'),
  koinsForm: document.getElementById('koinsForm'),
  koinsAmount: document.getElementById('koinsAmount'),
  koinsDate: document.getElementById('koinsDate'),
  koinsReason: document.getElementById('koinsReason'),
  koinsHistory: document.getElementById('koinsHistory'),
  koinsSubmit: document.getElementById('koinsSubmit'),
  koinsCancelEdit: document.getElementById('koinsCancelEdit'),
  sourceDistributionText: document.getElementById('sourceDistributionText'),
  growthTrendText: document.getElementById('growthTrendText'),
  weeklyTotalsText: document.getElementById('weeklyTotalsText'),
  predictionsForm: document.getElementById('predictionsForm'),
  avgSoulsPerDay: document.getElementById('avgSoulsPerDay'),
  predictionNote: document.getElementById('predictionNote'),
  projWeek: document.getElementById('projWeek'),
  projMonth: document.getElementById('projMonth'),
  proj3Month: document.getElementById('proj3Month'),
  proj6Month: document.getElementById('proj6Month'),
  projYear: document.getElementById('projYear'),
  predictionSummary: document.getElementById('predictionSummary'),
  exportData: document.getElementById('exportData'),
  importData: document.getElementById('importData'),
  backupFile: document.getElementById('backupFile'),
  clearData: document.getElementById('clearData')
  ,trackerMenuBtn: document.getElementById('trackerMenuBtn')
  ,trackerMenu: document.getElementById('trackerMenu')
  ,trackerMenuBtnBottom: document.getElementById('trackerMenuBtnBottom')
  ,trackerMenuBottom: document.getElementById('trackerMenuBottom')
};

let sourceDistributionChart;
let growthTrendChart;
let weeklyTotalsChart;

initialize();

function initialize() {
  attachNavigation();
  attachMobileMenu();
  attachTrackerMenu();
  attachForms();
  attachSettings();
  populateDefaultDates();
  renderAll();
}

function attachNavigation() {
  elements.navButtons.forEach(button => {
    if (button.dataset && button.dataset.target) {
      button.addEventListener('click', () => {
        setActivePage(button.dataset.target);
        closeMobileMenu();
      });
    }
  });
}

function attachMobileMenu() {
  elements.mobileActions.forEach(button => {
    button.addEventListener('click', () => {
      const menuType = button.dataset.menu;
      if (!menuType) return;
      openMobileMenu(menuType);
    });
  });

  elements.mobileSheetClose.addEventListener('click', closeMobileMenu);

  elements.mobileSheetOverlay.addEventListener('click', event => {
    if (event.target === elements.mobileSheetOverlay) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  });
}

const mobileMenuConfig = {
  track: [
    { label: 'Souls', target: 'souls' },
    { label: 'Dragon Crystal', target: 'crystals' },
    { label: 'Koins', target: 'koins' }
  ],
  analytics: [
    { label: 'Souls Analytics', target: 'souls-analytics' },
    { label: 'Dragon Crystal Analytics', target: 'crystals-analytics' },
    { label: 'Koins Analytics', target: 'koins-analytics' }
  ],
  predict: [
    { label: 'Souls Prediction', target: 'souls-prediction' },
    { label: 'Dragon Crystal Prediction', target: 'crystals-prediction' },
    { label: 'Koins Prediction', target: 'koins-prediction' }
  ]
};

function openMobileMenu(menuType) {
  const items = mobileMenuConfig[menuType] || [];
  elements.mobileSheetTitle.textContent = menuType === 'track' ? 'Track' : menuType === 'analytics' ? 'Analytics' : 'Predict';
  elements.mobileSheetBody.innerHTML = items.map(item => `
    <button class="sheet-item" type="button" data-target="${item.target}">${item.label}</button>
  `).join('');

  elements.mobileSheetBody.querySelectorAll('.sheet-item').forEach(item => {
    item.addEventListener('click', () => {
      setActivePage(item.dataset.target);
      closeMobileMenu();
    });
  });

  elements.mobileSheetOverlay.hidden = false;
  elements.mobileSheetOverlay.classList.add('visible');
}

function closeMobileMenu() {
  elements.mobileSheetOverlay.hidden = true;
  elements.mobileSheetOverlay.classList.remove('visible');
}

function attachTrackerMenu() {
  const toggles = [elements.trackerMenuBtn, elements.trackerMenuBtnBottom].filter(Boolean);
  toggles.forEach(toggle => {
    const wrapper = toggle.closest('.tracker-dropdown');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      const menu = wrapper.querySelector('.tracker-menu');
      if (menu) menu.setAttribute('aria-hidden', String(!isOpen));
    });
  });

  // close when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.tracker-dropdown.open').forEach(w => {
      w.classList.remove('open');
      const t = w.querySelector('.tracker-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
      const m = w.querySelector('.tracker-menu');
      if (m) m.setAttribute('aria-hidden', 'true');
    });
  });

  // menu item selection
  document.querySelectorAll('.tracker-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = item.dataset.target;
      if (target) setActivePage(target);
      // close all menus
      document.querySelectorAll('.tracker-dropdown.open').forEach(w => {
        w.classList.remove('open');
        const t = w.querySelector('.tracker-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
        const m = w.querySelector('.tracker-menu');
        if (m) m.setAttribute('aria-hidden', 'true');
      });
    });
  });
}

function setActivePage(target) {
  elements.pages.forEach(page => page.id === target ? page.classList.add('active') : page.classList.remove('active'));
  elements.navButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.target === target);
  });
}

function attachForms() {
  elements.soulsSource.addEventListener('change', () => {
    elements.soulsCustomSourceGroup.hidden = elements.soulsSource.value !== 'Others';
  });

  elements.soulsForm.addEventListener('submit', event => {
    event.preventDefault();
    handleSoulSubmit();
  });

  elements.soulsCancelEdit.addEventListener('click', resetSoulForm);

  elements.crystalsForm.addEventListener('submit', event => {
    event.preventDefault();
    handleCrystalsSubmit();
  });
  elements.crystalsCancelEdit.addEventListener('click', resetCrystalsForm);

  elements.koinsForm.addEventListener('submit', event => {
    event.preventDefault();
    handleKoinsSubmit();
  });
  elements.koinsCancelEdit.addEventListener('click', resetKoinsForm);

  elements.predictionsForm.addEventListener('submit', event => {
    event.preventDefault();
    savePredictions();
  });
}

function attachSettings() {
  elements.exportData.addEventListener('click', exportBackup);
  elements.importData.addEventListener('click', () => elements.backupFile.click());
  elements.backupFile.addEventListener('change', handleImportFile);
  elements.clearData.addEventListener('click', clearAllData);
}

function populateDefaultDates() {
  const today = new Date().toISOString().slice(0, 10);
  elements.soulsDate.value = today;
  elements.crystalsDate.value = today;
  elements.koinsDate.value = today;
}

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultData));
  } catch (error) {
    console.error('Failed to load data:', error);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function renderAll() {
  renderDashboard();
  renderSoulHistory();
  renderCrystalsHistory();
  renderKoinsHistory();
  renderPredictionForm();
  renderAnalytics();
}

function renderDashboard() {
  const totalSouls = sumEntries(appData.souls);
  const totalCrystals = sumEntries(appData.crystals);
  const totalKoins = sumEntries(appData.koins);
  const today = getDateKey(new Date());
  const todayTotal = sumEntries(appData.souls.filter(e => e.date === today)) + sumEntries(appData.crystals.filter(e => e.date === today)) + sumEntries(appData.koins.filter(e => e.date === today));
  const weeklyTotal = sumEntries(filterLastDays([...appData.souls, ...appData.crystals, ...appData.koins], 7));
  const monthlyTotal = sumEntries(filterMonth([...appData.souls, ...appData.crystals, ...appData.koins], new Date()));

  elements.totalSouls.textContent = formatNumber(totalSouls);
  elements.totalCrystals.textContent = formatNumber(totalCrystals);
  elements.totalKoins.textContent = formatNumber(totalKoins);
  elements.todaysCollection.textContent = formatNumber(todayTotal);
  elements.weeklyTotals.textContent = formatNumber(weeklyTotal);
  elements.monthlyTotals.textContent = formatNumber(monthlyTotal);

  const soulDays = countDays(appData.souls);
  elements.soulsDailyAvg.textContent = formatNumber(soulDays > 0 ? totalSouls / soulDays : 0);
  elements.soulsWeeklyAvg.textContent = formatNumber(totalSouls / Math.max(1, getWeekCount(appData.souls)));
  elements.soulsMonthlyAvg.textContent = formatNumber(totalSouls / Math.max(1, getMonthCount(appData.souls)));

  renderRecentEntries();
}

function renderRecentEntries() {
  const recent = [...appData.souls.slice(-2).reverse(), ...appData.crystals.slice(-2).reverse(), ...appData.koins.slice(-2).reverse()];
  const items = recent.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  elements.dashboardRecent.innerHTML = items.map(entry => renderRecentCard(entry)).join('') || '<div class="card-message">No entries yet. Add data to watch your progress.</div>';
}

function renderRecentCard(entry) {
  const icon = entry.type === 'souls' ? '🟢' : entry.type === 'crystals' ? '🔴' : '🟡';
  return `<article class="card entry-row" style="grid-template-columns: auto 1fr">
    <div>${icon}</div>
    <div class="entry-meta">
      <strong>${entry.amount} ${entry.type === 'koins' ? 'Koins' : entry.type === 'crystals' ? 'Crystals' : 'Souls'}</strong>
      <small>${entry.date} · ${entry.source || entry.reason}</small>
      ${entry.note ? `<small>${entry.note}</small>` : ''}
    </div>
  </article>`;
}

function renderSoulHistory() {
  elements.soulsHistory.innerHTML = appData.souls.length ? appData.souls.slice().reverse().map(renderSoulEntry).join('') : '<div class="card-message">No soul entries yet.</div>';
}

function renderCrystalsHistory() {
  elements.crystalsHistory.innerHTML = appData.crystals.length ? appData.crystals.slice().reverse().map(renderCrystalEntry).join('') : '<div class="card-message">No crystal entries yet.</div>';
}

function renderKoinsHistory() {
  elements.koinsHistory.innerHTML = appData.koins.length ? appData.koins.slice().reverse().map(renderKoinEntry).join('') : '<div class="card-message">No koin entries yet.</div>';
}

function renderSoulEntry(entry) {
  return `<div class="entry-row">
    <div class="entry-meta">
      <strong>${entry.amount} Souls</strong>
      <span>${entry.date} · ${entry.source}</span>
      ${entry.note ? `<small>${entry.note}</small>` : ''}
    </div>
    <div class="entry-actions">
      <button type="button" onclick="editSoulEntry('${entry.id}')">Edit</button>
      <button type="button" onclick="deleteSoulEntry('${entry.id}')">Delete</button>
    </div>
  </div>`;
}

function renderCrystalEntry(entry) {
  return `<div class="entry-row">
    <div class="entry-meta">
      <strong>${entry.amount} Crystals</strong>
      <span>${entry.date} · ${entry.reason}</span>
    </div>
    <div class="entry-actions">
      <button type="button" onclick="editCrystalEntry('${entry.id}')">Edit</button>
      <button type="button" onclick="deleteCrystalEntry('${entry.id}')">Delete</button>
    </div>
  </div>`;
}

function renderKoinEntry(entry) {
  return `<div class="entry-row">
    <div class="entry-meta">
      <strong>${entry.amount} Koins</strong>
      <span>${entry.date} · ${entry.reason}</span>
    </div>
    <div class="entry-actions">
      <button type="button" onclick="editKoinEntry('${entry.id}')">Edit</button>
      <button type="button" onclick="deleteKoinEntry('${entry.id}')">Delete</button>
    </div>
  </div>`;
}

window.editSoulEntry = id => {
  const entry = appData.souls.find(item => item.id === id);
  if (!entry) return;
  soulsEditId = id;
  elements.soulsAmount.value = entry.amount;
  elements.soulsDate.value = entry.date;
  if (['Challenge','Daily Quests','Realm Klash','Missions','Towers'].includes(entry.source)) {
    elements.soulsSource.value = entry.source;
    elements.soulsCustomSourceGroup.hidden = true;
    elements.soulsCustomSource.value = '';
  } else {
    elements.soulsSource.value = 'Others';
    elements.soulsCustomSourceGroup.hidden = false;
    elements.soulsCustomSource.value = entry.source;
  }
  elements.soulsNote.value = entry.note || '';
  elements.soulsSubmit.textContent = 'Update Souls';
  elements.soulsCancelEdit.hidden = false;
};

window.deleteSoulEntry = id => {
  appData.souls = appData.souls.filter(item => item.id !== id);
  saveData();
  renderAll();
};

window.editCrystalEntry = id => {
  const entry = appData.crystals.find(item => item.id === id);
  if (!entry) return;
  crystalsEditId = id;
  elements.crystalsAmount.value = entry.amount;
  elements.crystalsDate.value = entry.date;
  elements.crystalsReason.value = entry.reason;
  elements.crystalsSubmit.textContent = 'Update Crystals';
  elements.crystalsCancelEdit.hidden = false;
};

window.deleteCrystalEntry = id => {
  appData.crystals = appData.crystals.filter(item => item.id !== id);
  saveData();
  renderAll();
};

window.editKoinEntry = id => {
  const entry = appData.koins.find(item => item.id === id);
  if (!entry) return;
  koinsEditId = id;
  elements.koinsAmount.value = entry.amount;
  elements.koinsDate.value = entry.date;
  elements.koinsReason.value = entry.reason;
  elements.koinsSubmit.textContent = 'Update Koins';
  elements.koinsCancelEdit.hidden = false;
};

window.deleteKoinEntry = id => {
  appData.koins = appData.koins.filter(item => item.id !== id);
  saveData();
  renderAll();
};

function handleSoulSubmit() {
  const amount = Number(elements.soulsAmount.value) || 0;
  const date = elements.soulsDate.value;
  const sourceValue = elements.soulsSource.value;
  const source = sourceValue === 'Others' ? elements.soulsCustomSource.value.trim() || 'Others' : sourceValue;
  const note = elements.soulsNote.value.trim();
  if (amount <= 0 || !date) return;

  const entry = {
    id: soulsEditId || crypto.randomUUID(),
    amount,
    date,
    source,
    note,
    type: 'souls'
  };

  if (soulsEditId) {
    appData.souls = appData.souls.map(item => item.id === soulsEditId ? entry : item);
  } else {
    appData.souls.push(entry);
  }

  saveData();
  resetSoulForm();
  renderAll();
}

function resetSoulForm() {
  soulsEditId = null;
  elements.soulsForm.reset();
  populateDefaultDates();
  elements.soulsCustomSourceGroup.hidden = true;
  elements.soulsSubmit.textContent = 'Add Souls';
  elements.soulsCancelEdit.hidden = true;
}

function handleCrystalsSubmit() {
  const amount = Number(elements.crystalsAmount.value) || 0;
  const date = elements.crystalsDate.value;
  const reason = elements.crystalsReason.value.trim();
  if (amount <= 0 || !date || !reason) return;

  const entry = {
    id: crystalsEditId || crypto.randomUUID(),
    amount,
    date,
    reason,
    type: 'crystals'
  };

  if (crystalsEditId) {
    appData.crystals = appData.crystals.map(item => item.id === crystalsEditId ? entry : item);
  } else {
    appData.crystals.push(entry);
  }

  saveData();
  resetCrystalsForm();
  renderAll();
}

function resetCrystalsForm() {
  crystalsEditId = null;
  elements.crystalsForm.reset();
  populateDefaultDates();
  elements.crystalsSubmit.textContent = 'Add Crystals';
  elements.crystalsCancelEdit.hidden = true;
}

function handleKoinsSubmit() {
  const amount = Number(elements.koinsAmount.value) || 0;
  const date = elements.koinsDate.value;
  const reason = elements.koinsReason.value.trim();
  if (amount <= 0 || !date || !reason) return;

  const entry = {
    id: koinsEditId || crypto.randomUUID(),
    amount,
    date,
    reason,
    type: 'koins'
  };

  if (koinsEditId) {
    appData.koins = appData.koins.map(item => item.id === koinsEditId ? entry : item);
  } else {
    appData.koins.push(entry);
  }

  saveData();
  resetKoinsForm();
  renderAll();
}

function resetKoinsForm() {
  koinsEditId = null;
  elements.koinsForm.reset();
  populateDefaultDates();
  elements.koinsSubmit.textContent = 'Add Koins';
  elements.koinsCancelEdit.hidden = true;
}

function sumEntries(entries) {
  return entries.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function getDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function filterLastDays(entries, days) {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - (days - 1));
  return entries.filter(item => new Date(item.date) >= threshold);
}

function filterMonth(entries, date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return entries.filter(item => {
    const d = new Date(item.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

function countDays(entries) {
  const uniqueDays = new Set(entries.map(item => item.date));
  return uniqueDays.size;
}

function getWeekCount(entries) {
  if (!entries.length) return 1;
  const dates = entries.map(item => new Date(item.date).getTime());
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  const days = Math.ceil((max - min) / (1000 * 60 * 60 * 24)) + 1;
  return Math.ceil(days / 7);
}

function getMonthCount(entries) {
  if (!entries.length) return 1;
  const dates = entries.map(item => new Date(item.date).getTime());
  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));
  const months = (max.getFullYear() - min.getFullYear()) * 12 + (max.getMonth() - min.getMonth()) + 1;
  return Math.max(1, months);
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function renderAnalytics() {
  renderSourceDistributionChart();
  renderGrowthTrendChart();
  renderWeeklyTotalsChart();
}

function renderSourceDistributionChart() {
  const sources = {}
  appData.souls.forEach(entry => {
    sources[entry.source] = (sources[entry.source] || 0) + entry.amount;
  });
  const labels = Object.keys(sources);
  const data = labels.map(label => sources[label]);
  const colors = labels.map(label => getSourceColor(label));
  const text = generateSourceExplanation(sources);

  if (sourceDistributionChart) {
    sourceDistributionChart.data.labels = labels;
    sourceDistributionChart.data.datasets[0].data = data;
    sourceDistributionChart.data.datasets[0].backgroundColor = colors;
    sourceDistributionChart.update();
  } else {
    const ctx = document.getElementById('sourceDistributionChart');
    sourceDistributionChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0 }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { color: '#ddd' } } }
      }
    });
  }

  elements.sourceDistributionText.textContent = text;
}

function getSourceColor(source) {
  if (source === 'Daily Quests') return 'rgba(67,213,106,0.95)';
  if (source === 'Challenge') return 'rgba(41,187,120,0.92)';
  if (source === 'Realm Klash') return 'rgba(255,170,0,0.9)';
  if (source === 'Missions') return 'rgba(255,120,80,0.92)';
  if (source === 'Towers') return 'rgba(255,90,65,0.88)';
  return 'rgba(180,180,180,0.8)';
}

function generateSourceExplanation(sources) {
  const total = Object.values(sources).reduce((sum, amount) => sum + amount, 0);
  if (!total) return 'Add soul entries to see source distribution and insights here.';
  const sorted = Object.entries(sources).sort((a, b) => b[1] - a[1]);
  const [topSource, topAmount] = sorted[0];
  const ratio = Math.round((topAmount / total) * 100);
  const line = `${topSource} accounts for ${ratio}% of souls earned.`;
  const second = sorted[1] ? `Next highest source is ${sorted[1][0]}.` : 'Keep building your daily collection.';
  return `${line} ${second}`;
}

function renderGrowthTrendChart() {
  const last30 = getRollingTotals(appData.souls, 30);
  const labels = last30.map(item => item.date);
  const data = last30.map(item => item.total);
  const average = data.length ? data[data.length - 1] / 30 : 0;
  const summary = data.length > 1 ? (data[data.length - 1] > data[0] ? 'Soul growth is trending upward.' : 'Trend is stable; add more entries for a stronger pace.') : 'Add more soul entries to shape your trend.';

  if (growthTrendChart) {
    growthTrendChart.data.labels = labels;
    growthTrendChart.data.datasets[0].data = data;
    growthTrendChart.update();
  } else {
    const ctx = document.getElementById('growthTrendChart');
    growthTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{ label: 'Souls', data, borderColor: '#43d56a', backgroundColor: 'rgba(67,213,106,0.15)', fill: true, tension: 0.25, pointRadius: 2 }]
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { color: '#ccc' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#ccc' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  elements.growthTrendText.textContent = `${summary} Average per day is ${formatNumber(average)} souls.`;
}

function getRollingTotals(entries, days) {
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = getDateKey(day);
    const dailyAmount = entries.filter(item => item.date === key).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const previousTotal = result.length ? result[result.length - 1].total : 0;
    result.push({ date: key, total: previousTotal + dailyAmount });
  }
  return result;
}

function renderWeeklyTotalsChart() {
  const weeklySets = getWeeklyTotals(appData.souls, 4);
  const labels = weeklySets.map(item => item.label);
  const data = weeklySets.map(item => item.value);
  const recent = weeklySets[weeklySets.length - 1]?.value || 0;
  const previous = weeklySets[weeklySets.length - 2]?.value || 0;
  const direction = recent >= previous ? 'increased' : 'decreased';
  const summary = weeklySets.length < 2 ? 'Add more weekly soul information to compare trends.' : `Recent weekly soul totals have ${direction} compared to the previous week.`;

  if (weeklyTotalsChart) {
    weeklyTotalsChart.data.labels = labels;
    weeklyTotalsChart.data.datasets[0].data = data;
    weeklyTotalsChart.update();
  } else {
    const ctx = document.getElementById('weeklyTotalsChart');
    weeklyTotalsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Weekly Souls', data, backgroundColor: 'rgba(67,213,106,0.78)' }]
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { color: '#ccc' }, grid: { display: false } },
          y: { ticks: { color: '#ccc' }, grid: { color: 'rgba(255,255,255,0.06)' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  elements.weeklyTotalsText.textContent = summary;
}

function getWeeklyTotals(entries, numberOfWeeks) {
  const today = new Date();
  const weeks = [];
  for (let i = numberOfWeeks - 1; i >= 0; i -= 1) {
    const end = new Date(today);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const label = `${getDateKey(start)} to ${getDateKey(end)}`;
    const total = entries.filter(entry => {
      const date = new Date(entry.date);
      return date >= start && date <= end;
    }).reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    weeks.push({ label, value: total });
  }
  return weeks;
}

function renderPredictionForm() {
  elements.avgSoulsPerDay.value = appData.prediction.avgSoulsPerDay || 0;
  elements.predictionNote.value = appData.prediction.note || '';
  updatePredictionCards();
}

function savePredictions() {
  const avg = Number(elements.avgSoulsPerDay.value) || 0;
  const note = elements.predictionNote.value.trim();
  appData.prediction.avgSoulsPerDay = avg;
  appData.prediction.note = note;
  saveData();
  updatePredictionCards();
}

function updatePredictionCards() {
  const avg = Number(appData.prediction.avgSoulsPerDay) || 0;
  const currentTotal = sumEntries(appData.souls);
  const week = avg * 7;
  const month = avg * 30;
  const three = avg * 90;
  const six = avg * 180;
  const year = avg * 365;

  elements.projWeek.textContent = formatNumber(week);
  elements.projMonth.textContent = formatNumber(month);
  elements.proj3Month.textContent = formatNumber(three);
  elements.proj6Month.textContent = formatNumber(six);
  elements.projYear.textContent = formatNumber(year);

  const totalYear = formatNumber(currentTotal + year);
  let summary = `With ${formatNumber(avg)} souls per day, you would add ${formatNumber(year)} souls in one year.`;
  if (appData.prediction.note) {
    summary += ` Estimate progress for ${appData.prediction.note}.`;
  }
  summary += ` Estimated total after one year: ${totalYear} souls.`;
  elements.predictionSummary.textContent = summary;
}

function exportBackup() {
  const content = JSON.stringify(appData, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mkmobile-tracker-backup.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (imported && typeof imported === 'object') {
        appData = {
          souls: Array.isArray(imported.souls) ? imported.souls : [],
          crystals: Array.isArray(imported.crystals) ? imported.crystals : [],
          koins: Array.isArray(imported.koins) ? imported.koins : [],
          prediction: typeof imported.prediction === 'object' ? imported.prediction : defaultData.prediction
        };
        saveData();
        renderAll();
        alert('Backup restored successfully.');
      }
    } catch (error) {
      alert('Import failed. Please select a valid backup file.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function clearAllData() {
  const confirmed = confirm('Clear all tracker data? This cannot be undone.');
  if (!confirmed) return;
  appData = JSON.parse(JSON.stringify(defaultData));
  saveData();
  renderAll();
}
