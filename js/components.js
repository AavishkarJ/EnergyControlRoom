class StatusPulse extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('label') || '';
    this.innerHTML = `
      <div class="status">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="pulse"></div>
          <strong>${label}</strong>
        </div>
      </div>
    `;
  }
}

class LivePowerFlow extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="card span-12">
        <status-pulse label="Live power flow"></status-pulse>
        <div class="metrics">
          <div class="metric">
            <label>Active power</label>
            <div class="value" id="active-power">-- <small>kW</small></div>
            <div class="bar"><span id="power-bar"></span></div>
          </div>
          <div class="metric">
            <label>Active current</label>
            <div class="value" id="active-current">-- <small>A</small></div>
          </div>
          <div class="metric">
            <label>Active voltage (avg)</label>
            <div class="value" id="active-voltage">-- <small>V</small></div>
          </div>
          <div class="metric">
            <label>Voltage Imbalance</label>
            <div class="value" id="voltage-imbalance">-- <small>%</small></div>
          </div>
          <div class="metric">
            <label>Tariff</label>
            <div class="value" id="active-tariff">--</div>
          </div>
        </div>
      </div>
    `;
  }
}

class LivePowerStats extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="card span-12">
        <status-pulse label="Live Power Stats"></status-pulse>
        <div class="row-grid">
          <div class="card sub span-4">
            <label>Power over time</label>
            <div class="chart-wrap chart-tall"><canvas id="powerChart"></canvas></div>
          </div>
          <div class="card sub span-4">
            <label>Gas usage over time</label>
            <div class="chart-wrap chart-tall"><canvas id="gasChart"></canvas></div>
            <div class="grid-lines">
              <div class="status"><span>Total Gas</span><strong id="gas-total">-- m3</strong></div>
              <div class="status"><span>Last Reported</span><strong id="gas-time">--</strong></div>
            </div>
          </div>
          <div class="card sub span-4">
            <label>Energy snapshot</label>
            <div class="chart-wrap chart-tall"><canvas id="energyBarChart"></canvas></div>
            <div class="grid-lines">
              <div class="status"><span>Import</span><strong id="import">-- MWh</strong></div>
              <div class="status"><span>Export</span><strong id="export">-- MWh</strong></div>
              <div class="status"><span>Active</span><strong id="active">-- kW</strong></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

class PhaseStats extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="card span-12">
        <status-pulse label="Phase Stats"></status-pulse>
        <div class="row-grid">
          <div class="card sub span-3">
            <label>Voltage per phase</label>
            <div class="chart-wrap"><canvas id="voltageChart"></canvas></div>
          </div>

          <div class="card sub span-3">
            <label>Current per phase</label>
            <div class="chart-wrap"><canvas id="currentChart"></canvas></div>
          </div>

          <div class="card sub span-3">
            <label>Power Factor per phase</label>
            <div class="chart-wrap"><canvas id="pfChart"></canvas></div>
            <div class="grid-lines">
              <div class="status"><span>L1 PF</span><strong id="l1-pf">--</strong></div>
              <div class="status"><span>L2 PF</span><strong id="l2-pf">--</strong></div>
              <div class="status"><span>L3 PF</span><strong id="l3-pf">--</strong></div>
            </div>
          </div>
          
           <div class="card sub span-3">
            <label>Phase power split</label>
            <div class="chart-wrap"><canvas id="phasePowerChart"></canvas></div>
            <div class="grid-lines">
              <div class="status"><span>L1</span><strong id="l1">-- kW</strong></div>
              <div class="status"><span>L2</span><strong id="l2">-- kW</strong></div>
              <div class="status"><span>L3</span><strong id="l3">-- kW</strong></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

class OtherStats extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="card span-12">
        <status-pulse label="Other Stats"></status-pulse>
        <div class="row-grid">
          <div class="card sub span-4">
            <label>Import vs export</label>
            <div class="chart-wrap"><canvas id="energySplitChart"></canvas></div>
            <div class="status">
              <span>Import total</span>
              <strong id="import-total">-- kWh</strong>
            </div>
            <div class="status">
              <span>Export total</span>
              <strong id="export-total">-- kWh</strong>
            </div>
          </div>

          <div class="card sub span-4">
            <label>Tariff breakdown</label>
            <div class="chart-wrap"><canvas id="tariffChart"></canvas></div>
            <div class="status">
              <span>T1 / T2 import</span>
              <strong id="import-tariff">-- kWh</strong>
            </div>
            <div class="status">
              <span>T1 / T2 export</span>
              <strong id="export-tariff">-- kWh</strong>
            </div>
          </div>         

          <div class="card sub span-4">
            <label>Reliability counters</label>
            <div class="metrics">
              <div class="metric">
                <label>Voltage sags</label>
                <div class="value" id="sag-count">--</div>
              </div>
              <div class="metric">
                <label>Voltage swells</label>
                <div class="value" id="swell-count">--</div>
              </div>
              <div class="metric">
                <label>Power fails</label>
                <div class="value" id="fail-count">--</div>
              </div>
              <div class="metric">
                <label>Long fails</label>
                <div class="value" id="long-fail-count">--</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('status-pulse', StatusPulse);
customElements.define('live-power-flow', LivePowerFlow);
customElements.define('live-power-stats', LivePowerStats);
customElements.define('phase-stats', PhaseStats);
customElements.define('other-stats', OtherStats);
