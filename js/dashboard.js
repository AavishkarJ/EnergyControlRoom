import { EnergyData } from './models.js';

let powerChart, energyBarChart, gasChart, phasePowerChart, voltageChart, currentChart, energySplitChart, tariffChart, pfChart;

let P1_URL = "http://localhost/api/v1/data";
const MAX_POINTS = 3600; // keep 1 hour @ 1 point/sec

// IndexedDB Constants
const DB_NAME = 'EnergyControlRoomDB';
const DB_VERSION = 1;
const STORE_NAME = 'energy_data';

let isCachingEnabled = false;
let currentTimeframe = 'now';
let allData = []; // To store historical data when loaded

function updateP1Url(ip) {
  if (!ip) return;
  P1_URL = `http://${ip}/api/v1/data`;
  localStorage.setItem('p1_ip', ip);
}

function initCharts() {
  powerChart = new Chart(document.getElementById('powerChart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Power +',
          data: [],
          borderColor: '#ff4d3d',
          backgroundColor: 'rgba(255, 77, 61, 0.25)',
          borderWidth: 1,
          pointRadius: 0,
          fill: { target: 'origin' }
        },
        {
          label: 'Power -',
          data: [],
          borderColor: '#24d17f',
          backgroundColor: 'rgba(36, 209, 127, 0.25)',
          borderWidth: 1,
          pointRadius: 0,
          fill: { target: 'origin' }
        }
      ]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        x: { 
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'HH:mm'
            }
          },
          ticks: { maxRotation: 0, autoSkip: true }, 
          grid: { color: 'rgba(255,255,255,0.04)' } 
        },
        y: { grid: { color: 'rgba(255,255,255,0.06)' } }
      }
    }
  });

  energyBarChart = new Chart(document.getElementById('energyBarChart'), {
    type: 'bar',
    data: {
      labels: ['Import MWh', 'Export MWh', 'Active kW'],
      datasets: [{
        label: 'Energy snapshot',
        data: [0, 0, 0],
        backgroundColor: ['#ff4d3d', '#24d17f', '#ff4d3d'],
        borderRadius: 10
      }]
    },
    options: {
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' } }
      }
    }
  });

  gasChart = new Chart(document.getElementById('gasChart'), {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Gas m3',
          data: [],
          borderColor: '#4db6ff',
          backgroundColor: 'rgba(77, 182, 255, 0.2)',
          borderWidth: 1,
          pointRadius: 0,
          fill: true
        }
      ]
    },
    options: {
      animation: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        x: { 
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'HH:mm'
            }
          },
          ticks: { maxRotation: 0, autoSkip: true }, 
          grid: { color: 'rgba(255,255,255,0.04)' } 
        },
        y: { grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true }
      }
    }
  });

  phasePowerChart = new Chart(document.getElementById('phasePowerChart'), {
    type: 'bar',
    data: {
      labels: ['L1', 'L2', 'L3'],
      datasets: [{
        label: 'kW',
        data: [0, 0, 0],
        backgroundColor: ['#ff4d3d', '#f7b801', '#24d17f'],
        borderRadius: 10
      }]
    },
    options: {
      animation: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' } }
      }
    }
  });

  voltageChart = new Chart(document.getElementById('voltageChart'), {
    type: 'radar',
    data: {
      labels: ['L1', 'L2', 'L3'],
      datasets: [{
        label: 'V',
        data: [0, 0, 0],
        borderColor: '#6ce7b1',
        backgroundColor: 'rgba(36, 209, 127, 0.18)'
      }]
    },
    options: {
      animation: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          angleLines: { color: 'rgba(255,255,255,0.08)' },
          grid: { color: 'rgba(255,255,255,0.08)' },
          pointLabels: { color: '#cfe0e6' },
          ticks: { display: false }
        }
      }
    }
  });

  currentChart = new Chart(document.getElementById('currentChart'), {
    type: 'radar',
    data: {
      labels: ['L1', 'L2', 'L3'],
      datasets: [{
        label: 'A',
        data: [0, 0, 0],
        borderColor: '#ffb347',
        backgroundColor: 'rgba(247, 184, 1, 0.18)'
      }]
    },
    options: {
      animation: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          angleLines: { color: 'rgba(255,255,255,0.08)' },
          grid: { color: 'rgba(255,255,255,0.08)' },
          pointLabels: { color: '#cfe0e6' },
          ticks: { display: false }
        }
      }
    }
  });

  energySplitChart = new Chart(document.getElementById('energySplitChart'), {
    type: 'doughnut',
    data: {
      labels: ['Import', 'Export'],
      datasets: [{
        data: [0, 0],
        backgroundColor: ['#ff4d3d', '#24d17f']
      }]
    },
    options: {
      animation: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      cutout: '70%'
    }
  });

  tariffChart = new Chart(document.getElementById('tariffChart'), {
    type: 'doughnut',
    data: {
      labels: ['T1 import', 'T2 import', 'T1 export', 'T2 export'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ['#ff4d3d', '#f7b801', '#24d17f', '#4db6ff']
      }]
    },
    options: {
      animation: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      cutout: '62%'
    }
  });

  pfChart = new Chart(document.getElementById('pfChart'), {
    type: 'bar',
    data: {
      labels: ['L1', 'L2', 'L3'],
      datasets: [{
        label: 'Power Factor',
        data: [0, 0, 0],
        backgroundColor: ['#ff4d3d', '#f7b801', '#24d17f'],
        borderRadius: 10
      }]
    },
    options: {
      animation: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(255,255,255,0.06)' }, min: 0, max: 1 }
      }
    }
  });
}

const fmt = (value, digits = 0) => Number(value).toFixed(digits);

const formatGasTimestamp = (raw) => {
  if (!raw) return '--';
  const str = String(raw).padStart(12, '0');
  const yy = str.slice(0, 2);
  const mm = str.slice(2, 4);
  const dd = str.slice(4, 6);
  const hh = str.slice(6, 8);
  const mi = str.slice(8, 10);
  const ss = str.slice(10, 12);
  return `${dd}/${mm}/20${yy} ${hh}:${mi}:${ss}`;
};
let lastGasTimestamp = null;
let lastGasValue = -1;


function updateDashboard(payload) {
  const energy = new EnergyData(payload);
  const now = new Date();

  document.getElementById('last-update').textContent = `Last update: ${now.toLocaleTimeString()}`;
  document.getElementById('chip-ssid').textContent = `SSID: ${energy.wifi_ssid}`;
  document.getElementById('chip-meter').textContent = `Meter: ${energy.meter_model}`;
  document.getElementById('chip-smr').textContent = `SMR: ${energy.smr_version}`;
  document.getElementById('chip-strength').textContent = `WiFi: ${fmt(energy.wifi_strength)}%`;
  document.getElementById('chip-uid').textContent = `Smart Meter ID: ${energy.unique_id}`;
  document.getElementById('gas-id').textContent = `Gas Meter ID: ${energy.gas_unique_id}`;

  document.getElementById('active-power').innerHTML = `${fmt(energy.activePowerKW, 2)} <small>kW</small>`;
  document.getElementById('active-current').innerHTML = `${fmt(energy.active_current_a, 2)} <small>A</small>`;
  document.getElementById('active-voltage').innerHTML = `${fmt(energy.averageVoltage, 1)} <small>V</small>`;
  document.getElementById('voltage-imbalance').innerHTML = `${fmt(energy.phaseImbalance, 2)} <small>%</small>`;
  document.getElementById('active-tariff').textContent = energy.active_tariff ? `T${energy.active_tariff}` : '--';

  const bar = document.getElementById('power-bar');
  const magnitude = Math.min(Math.abs(energy.active_power_w) / 6000, 1);
  bar.style.width = `${magnitude * 100}%`;
  bar.style.background = energy.active_power_w >= 0
    ? 'linear-gradient(90deg, #ff4d3d, #ff9d8a)'
    : 'linear-gradient(90deg, #24d17f, #6ce7b1)';

  document.getElementById('l1').textContent = `${fmt(energy.active_power_l1_w / 1000, 2)} kW`;
  document.getElementById('l2').textContent = `${fmt(energy.active_power_l2_w / 1000, 2)} kW`;
  document.getElementById('l3').textContent = `${fmt(energy.active_power_l3_w / 1000, 2)} kW`;

  document.getElementById('import').textContent = `${fmt(energy.total_power_import_kwh / 1000, 2)} MWh`;
  document.getElementById('export').textContent = `${fmt(energy.total_power_export_kwh / 1000, 2)} MWh`;
  document.getElementById('active').textContent = `${fmt(energy.activePowerKW, 2)} kW`;

  phasePowerChart.data.datasets[0].data = [
    energy.active_power_l1_w / 1000,
    energy.active_power_l2_w / 1000,
    energy.active_power_l3_w / 1000
  ];

  voltageChart.data.datasets[0].data = [
    energy.active_voltage_l1_v,
    energy.active_voltage_l2_v,
    energy.active_voltage_l3_v
  ];

  currentChart.data.datasets[0].data = [
    energy.active_current_l1_a,
    energy.active_current_l2_a,
    energy.active_current_l3_a
  ];

  pfChart.data.datasets[0].data = [
    energy.powerFactorL1,
    energy.powerFactorL2,
    energy.powerFactorL3
  ];

  energySplitChart.data.datasets[0].data = [
    energy.total_power_import_kwh,
    energy.total_power_export_kwh
  ];

  const activeColor = energy.active_power_w >= 0 ? '#ff4d3d' : '#24d17f';
  energyBarChart.data.datasets[0].data = [
    energy.total_power_import_kwh / 1000,
    energy.total_power_export_kwh / 1000,
    energy.activePowerKW
  ];
  energyBarChart.data.datasets[0].backgroundColor = ['#ff4d3d', '#24d17f', activeColor];

  tariffChart.data.datasets[0].data = [
    energy.total_power_import_t1_kwh,
    energy.total_power_import_t2_kwh,
    energy.total_power_export_t1_kwh,
    energy.total_power_export_t2_kwh
  ];

  document.getElementById('import-total').textContent = `${fmt(energy.total_power_import_kwh, 2)} kWh`;
  document.getElementById('export-total').textContent = `${fmt(energy.total_power_export_kwh, 2)} kWh`;
  document.getElementById('import-tariff').textContent = `${fmt(energy.total_power_import_t1_kwh, 2)} / ${fmt(energy.total_power_import_t2_kwh, 2)} kWh`;
  document.getElementById('export-tariff').textContent = `${fmt(energy.total_power_export_t1_kwh, 2)} / ${fmt(energy.total_power_export_t2_kwh, 2)} kWh`;

  document.getElementById('l1-pf').textContent = fmt(energy.powerFactorL1, 2);
  document.getElementById('l2-pf').textContent = fmt(energy.powerFactorL2, 2);
  document.getElementById('l3-pf').textContent = fmt(energy.powerFactorL3, 2);

  document.getElementById('sag-count').textContent = fmt(energy.totalSags);
  document.getElementById('swell-count').textContent = fmt(energy.totalSwells);
  document.getElementById('fail-count').textContent = fmt(energy.any_power_fail_count);
  document.getElementById('long-fail-count').textContent = fmt(energy.long_power_fail_count);

  document.getElementById('gas-total').innerHTML = `${fmt(energy.total_gas_m3, 3)} <small>m3</small>`;
  document.getElementById('gas-time').textContent = formatGasTimestamp(energy.gas_timestamp);

  if (energy.gas_timestamp != null && energy.gas_timestamp !== lastGasTimestamp) {
    lastGasTimestamp = energy.gas_timestamp;
    if (lastGasValue < 0) {
      lastGasValue = energy.total_gas_m3;
    }
    const gasDelta = energy.total_gas_m3 - lastGasValue;
    energy.gasDelta = gasDelta; // Attach for potential use
    
    if (currentTimeframe === 'now') {
      const gasLabel = Date.now();
      gasChart.data.labels.push(gasLabel);
      gasChart.data.datasets[0].data.push(gasDelta);
      if (gasChart.data.labels.length > MAX_POINTS) {
        gasChart.data.labels.shift();
        gasChart.data.datasets[0].data.shift();
      }
      gasChart.update('none');
    }
    lastGasValue = energy.total_gas_m3;
  }

  if (currentTimeframe === 'now') {
    const timestamp = Date.now();
    powerChart.data.labels.push(timestamp);
    powerChart.data.datasets[0].data.push(energy.active_power_w >= 0 ? energy.activePowerKW : null);
    powerChart.data.datasets[1].data.push(energy.active_power_w < 0 ? energy.activePowerKW : null);

    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();
    powerChart.options.scales.x.min = startOfHour;
    powerChart.options.scales.x.max = Date.now();
    powerChart.options.scales.x.time.unit = 'minute';
    
    gasChart.options.scales.x.min = startOfHour;
    gasChart.options.scales.x.max = Date.now();
    gasChart.options.scales.x.time.unit = 'minute';

    // Prune data older than the start of the current hour to keep charts clean
    while (powerChart.data.labels.length > 0 && powerChart.data.labels[0] < startOfHour) {
      powerChart.data.labels.shift();
      powerChart.data.datasets[0].data.shift();
      powerChart.data.datasets[1].data.shift();
    }
    while (gasChart.data.labels.length > 0 && gasChart.data.labels[0] < startOfHour) {
      gasChart.data.labels.shift();
      gasChart.data.datasets[0].data.shift();
    }
  }

  powerChart.update('none');
  phasePowerChart.update('none');
  voltageChart.update('none');
  currentChart.update('none');
  pfChart.update('none');
  energyBarChart.update('none');
  energySplitChart.update('none');
  tariffChart.update('none');
}

async function poll() {
  try {
    const resp = await fetch(P1_URL);
    const data = await resp.json();
    
    if (isCachingEnabled) {
      // Calculate gas delta before saving
      let gasDelta = 0;
      if (data.total_gas_m3 != null) {
        if (lastGasValue >= 0) {
          gasDelta = data.total_gas_m3 - lastGasValue;
        }
        // update lastGasValue for next poll
        // NOTE: we update lastGasValue inside updateDashboard too, 
        // but here we need it for caching if not calling updateDashboard
      }

      // Add timestamp and gas delta if not present
      const dataWithTs = { ...data, timestamp: Date.now(), gasDelta: gasDelta };
      saveToIndexedDB(dataWithTs);
      
      if (currentTimeframe === 'now') {
        updateDashboard(data);
      }
    } else {
      updateDashboard(data);
    }
  } catch (err) {
    console.error('Poll error', err);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.errorCode);
      reject(event.target.errorCode);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

async function saveToIndexedDB(data) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.add(data);
    
    transaction.oncomplete = () => db.close();
  } catch (err) {
    console.warn('IndexedDB save error:', err);
  }
}

async function fetchCachedData() {
  console.log("Fetching cached data from IndexedDB...");
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => {
      allData = event.target.result;
      console.log(`Loaded ${allData.length} data points from IndexedDB.`);
      filterAndRenderData();
      db.close();
    };

    request.onerror = (event) => {
      console.error('IndexedDB fetch error:', event.target.errorCode);
      db.close();
    };
  } catch (err) {
    console.error('Fetch cached data error:', err);
  }
}

function filterAndRenderData() {
  const now = new Date();
  let startTime, endTime;
  
  // Clear charts
  [powerChart, gasChart].forEach(chart => {
    chart.data.labels = [];
    chart.data.datasets.forEach(ds => ds.data = []);
  });

  if (currentTimeframe === 'now') {
    // Fill charts with data starting from the beginning of the current hour
    startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();
    const recentData = allData.filter(d => d.timestamp >= startTime);
    
    recentData.forEach(payload => {
      const energy = new EnergyData(payload);
      const ts = payload.timestamp;
      powerChart.data.labels.push(ts);
      powerChart.data.datasets[0].data.push(energy.active_power_w >= 0 ? energy.activePowerKW : null);
      powerChart.data.datasets[1].data.push(energy.active_power_w < 0 ? energy.activePowerKW : null);
      
      if (payload.gasDelta !== undefined) {
          gasChart.data.labels.push(ts);
          gasChart.data.datasets[0].data.push(payload.gasDelta);
      }
    });
    
    if (recentData.length > 0) {
      updateDashboard(recentData[recentData.length - 1]);
    }
    
    // Scale for Now
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()).getTime();
    [powerChart, gasChart].forEach(chart => {
        chart.options.scales.x.min = startOfHour;
        chart.options.scales.x.max = Date.now();
        chart.options.scales.x.time.unit = 'minute';
        chart.options.scales.x.time.displayFormats = { minute: 'HH:mm' };
        // stepSize 5 might be too much if we just started, let Chart.js decide or set a sensible default
        chart.options.scales.x.time.stepSize = undefined; 
        chart.update();
    });
    return;
  }

  let dataToRender = [];
  switch (currentTimeframe) {
    case 'yesterday':
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      dataToRender = allData.filter(d => d.timestamp >= startTime && d.timestamp < endTime);
      
      [powerChart, gasChart].forEach(chart => {
          chart.options.scales.x.min = startTime;
          chart.options.scales.x.max = endTime;
          chart.options.scales.x.time.unit = 'hour';
          chart.options.scales.x.time.stepSize = 2;
      });
      break;
    case 'week':
      const weekSelector = document.getElementById('week-selector');
      const weekVal = weekSelector.value; // e.g. "2024-W10"
      if (!weekVal) {
          // Default to current week
          startTime = now.getTime() - (now.getDay() || 7 - 1) * 24 * 60 * 60 * 1000;
          startTime = new Date(startTime).setHours(0,0,0,0);
          
          // Set selector value for consistency
          const d = new Date(startTime);
          const year = d.getFullYear();
          const week = getWeekNumber(d);
          weekSelector.value = `${year}-W${String(week).padStart(2, '0')}`;
      } else {
          // Parse weekVal
          const [y, w] = weekVal.split('-W');
          startTime = getStartDateOfWeek(parseInt(w), parseInt(y)).getTime();
      }
      endTime = startTime + 7 * 24 * 60 * 60 * 1000;
      dataToRender = allData.filter(d => d.timestamp >= startTime && d.timestamp < endTime);
      
      [powerChart, gasChart].forEach(chart => {
          chart.options.scales.x.min = startTime;
          chart.options.scales.x.max = endTime;
          chart.options.scales.x.time.unit = 'day';
          chart.options.scales.x.time.displayFormats = { day: 'EEE' };
          chart.options.scales.x.time.stepSize = 1;
      });
      break;
    case 'month':
      const monthSelector = document.getElementById('month-selector');
      const monthVal = monthSelector.value; // e.g. "2024-03"
      if (!monthVal) {
          startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          monthSelector.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      } else {
          const [y, m] = monthVal.split('-');
          startTime = new Date(parseInt(y), parseInt(m) - 1, 1).getTime();
      }
      endTime = new Date(new Date(startTime).getFullYear(), new Date(startTime).getMonth() + 1, 1).getTime();
      dataToRender = allData.filter(d => d.timestamp >= startTime && d.timestamp < endTime);
      
      [powerChart, gasChart].forEach(chart => {
          chart.options.scales.x.min = startTime;
          chart.options.scales.x.max = endTime;
          chart.options.scales.x.time.unit = 'day';
          chart.options.scales.x.time.displayFormats = { day: 'd' };
          chart.options.scales.x.time.stepSize = 1;
      });
      break;
    case 'year':
      const yearSelector = document.getElementById('year-selector');
      const yearVal = yearSelector.value;
      if (!yearVal) {
          startTime = new Date(now.getFullYear(), 0, 1).getTime();
          yearSelector.value = now.getFullYear();
      } else {
          startTime = new Date(parseInt(yearVal), 0, 1).getTime();
      }
      endTime = new Date(new Date(startTime).getFullYear() + 1, 0, 1).getTime();
      dataToRender = allData.filter(d => d.timestamp >= startTime && d.timestamp < endTime);
      
      [powerChart, gasChart].forEach(chart => {
          chart.options.scales.x.min = startTime;
          chart.options.scales.x.max = endTime;
          chart.options.scales.x.time.unit = 'month';
          chart.options.scales.x.time.displayFormats = { month: 'MMM' };
          chart.options.scales.x.time.stepSize = 1;
      });
      break;
  }
  renderAggregateData(dataToRender);
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

function getStartDateOfWeek(w, y) {
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

function renderAggregateData(dataPoints) {
  if (dataPoints.length === 0) {
      powerChart.update();
      gasChart.update();
      return;
  }
  
  dataPoints.forEach(payload => {
    const energy = new EnergyData(payload);
    const ts = payload.timestamp;
    
    powerChart.data.labels.push(ts);
    powerChart.data.datasets[0].data.push(energy.active_power_w >= 0 ? energy.activePowerKW : null);
    powerChart.data.datasets[1].data.push(energy.active_power_w < 0 ? energy.activePowerKW : null);

    if (payload.gasDelta !== undefined) {
        gasChart.data.labels.push(ts);
        gasChart.data.datasets[0].data.push(payload.gasDelta);
    }
  });

  // Update with latest point in range for single metrics
  updateDashboard(dataPoints[dataPoints.length - 1]);
  
  powerChart.update();
  gasChart.update();
}

let pollTimer;
let pollInterval = 1000;
let isPolling = false;

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(poll, pollInterval);
  isPolling = true;
  updateConnectButton();
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  isPolling = false;
  updateConnectButton();
}

function updateConnectButton() {
  const setIpBtn = document.getElementById('set-ip');
  if (!setIpBtn) return;
  
  const pulses = document.querySelectorAll('.pulse');
  
  if (isPolling) {
    setIpBtn.textContent = 'Disconnect';
    setIpBtn.style.background = '#444'; // Muted color for disconnect
    pulses.forEach(p => {
      p.style.animation = 'pulse 1.8s infinite';
      p.style.background = 'var(--accent-2)';
      p.style.boxShadow = '0 0 0 6px rgba(36, 209, 127, 0.2)';
    });
  } else {
    setIpBtn.textContent = 'Connect';
    setIpBtn.style.background = 'var(--accent)';
    pulses.forEach(p => {
      p.style.animation = 'none';
      p.style.background = '#666';
      p.style.boxShadow = 'none';
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const savedIp = localStorage.getItem('p1_ip') || "192.168.68.10";
  const savedInterval = localStorage.getItem('poll_interval') || "1.0";
  const savedCaching = localStorage.getItem('enable_caching') === 'true';
  
  const ipInput = document.getElementById('ip-address');
  const setIpBtn = document.getElementById('set-ip');
  const intervalSlider = document.getElementById('poll-interval');
  const intervalVal = document.getElementById('interval-val');
  const cachingCheckbox = document.getElementById('enable-caching');
  const timeframeSelect = document.getElementById('timeframe');

  if (cachingCheckbox) {
    cachingCheckbox.checked = savedCaching;
    isCachingEnabled = savedCaching;
    cachingCheckbox.addEventListener('change', (e) => {
      isCachingEnabled = e.target.checked;
      localStorage.setItem('enable_caching', isCachingEnabled);
      if (isCachingEnabled) {
        fetchCachedData();
      }
    });
  }

  if (timeframeSelect) {
    const weekSelector = document.getElementById('week-selector');
    const monthSelector = document.getElementById('month-selector');
    const yearSelector = document.getElementById('year-selector');

    const updateSelectorsVisibility = () => {
      weekSelector.style.display = currentTimeframe === 'week' ? 'inline-block' : 'none';
      monthSelector.style.display = currentTimeframe === 'month' ? 'inline-block' : 'none';
      yearSelector.style.display = currentTimeframe === 'year' ? 'inline-block' : 'none';
    };

    // Populate year selector
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      const opt = document.createElement('option');
      opt.value = currentYear - i;
      opt.textContent = currentYear - i;
      yearSelector.appendChild(opt);
    }

    timeframeSelect.addEventListener('change', (e) => {
      currentTimeframe = e.target.value;
      updateSelectorsVisibility();
      if (currentTimeframe === 'now') {
        if (!isPolling) startPolling();
        fetchCachedData(); // Refresh historical context for Now
      } else {
        if (isCachingEnabled) {
          fetchCachedData();
        } else {
          alert('Enable Local Caching to view historical data.');
          timeframeSelect.value = 'now';
          currentTimeframe = 'now';
          updateSelectorsVisibility();
        }
      }
    });

    [weekSelector, monthSelector, yearSelector].forEach(sel => {
      sel.addEventListener('change', () => {
        if (isCachingEnabled) fetchCachedData();
      });
    });
  }

  if (ipInput) {
    ipInput.value = savedIp;
    updateP1Url(savedIp);

    setIpBtn.addEventListener('click', () => {
      if (isPolling) {
        stopPolling();
      } else {
        updateP1Url(ipInput.value);
        poll(); // Immediate poll when connecting
        startPolling();
      }
    });

    ipInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        updateP1Url(ipInput.value);
        poll();
        startPolling();
      }
    });
  }

  if (intervalSlider) {
    intervalSlider.value = savedInterval;
    intervalVal.textContent = savedInterval;
    pollInterval = parseFloat(savedInterval) * 1000;

    intervalSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      intervalVal.textContent = val;
      pollInterval = parseFloat(val) * 1000;
      localStorage.setItem('poll_interval', val);
      if (isPolling) startPolling();
    });
  }

  initCharts();
  
  // Always fetch cached data on load to fill charts with historical context
  fetchCachedData();

  poll();
  startPolling();
});
