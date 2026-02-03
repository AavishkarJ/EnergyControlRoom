import { EnergyData } from './models.js';

let powerChart, energyBarChart, gasChart, phasePowerChart, voltageChart, currentChart, energySplitChart, tariffChart, pfChart;

const P1_URL = "http://192.168.68.10/api/v1/data";
const MAX_POINTS = 3600; // keep 1 hour @ 1 point/sec

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
          borderWidth: 2,
          pointRadius: 0,
          fill: { target: 'origin' }
        },
        {
          label: 'Power -',
          data: [],
          borderColor: '#24d17f',
          backgroundColor: 'rgba(36, 209, 127, 0.25)',
          borderWidth: 2,
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
        x: { ticks: { maxRotation: 0, autoSkip: true }, grid: { color: 'rgba(255,255,255,0.04)' } },
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
          borderWidth: 2,
          pointRadius: 2,
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
        x: { ticks: { maxRotation: 0, autoSkip: true }, grid: { color: 'rgba(255,255,255,0.04)' } },
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
    const gasLabel = new Date().toLocaleTimeString();
    gasChart.data.labels.push(gasLabel);
    gasChart.data.datasets[0].data.push(energy.total_gas_m3 - lastGasValue);
    if (gasChart.data.labels.length > MAX_POINTS) {
      gasChart.data.labels.shift();
      gasChart.data.datasets[0].data.shift();
    }
    lastGasValue = energy.total_gas_m3;
    gasChart.update('none');
  }

  const timestamp = new Date().toLocaleTimeString();
  powerChart.data.labels.push(timestamp);
  powerChart.data.datasets[0].data.push(energy.active_power_w >= 0 ? energy.activePowerKW : null);
  powerChart.data.datasets[1].data.push(energy.active_power_w < 0 ? energy.activePowerKW : null);

  if (powerChart.data.labels.length > MAX_POINTS) {
    powerChart.data.labels.shift();
    powerChart.data.datasets[0].data.shift();
    powerChart.data.datasets[1].data.shift();
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
    updateDashboard(data);
  } catch (err) {
    console.error('Poll error', err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initCharts();
  poll();
  setInterval(poll, 1000);
});
