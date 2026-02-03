export class EnergyData {
    constructor(data) {
        this.wifi_ssid = data.wifi_ssid || '--';
        this.wifi_strength = Number(data.wifi_strength || 0);
        this.smr_version = data.smr_version || '--';
        this.meter_model = data.meter_model || '--';
        this.unique_id = data.unique_id || '--';
        this.active_tariff = data.active_tariff || null;
        
        // Power Import/Export (kWh)
        this.total_power_import_kwh = Number(data.total_power_import_kwh || 0);
        this.total_power_import_t1_kwh = Number(data.total_power_import_t1_kwh || 0);
        this.total_power_import_t2_kwh = Number(data.total_power_import_t2_kwh || 0);
        this.total_power_export_kwh = Number(data.total_power_export_kwh || 0);
        this.total_power_export_t1_kwh = Number(data.total_power_export_t1_kwh || 0);
        this.total_power_export_t2_kwh = Number(data.total_power_export_t2_kwh || 0);
        
        // Active Power (W)
        this.active_power_w = Number(data.active_power_w || 0);
        this.active_power_l1_w = Number(data.active_power_l1_w || 0);
        this.active_power_l2_w = Number(data.active_power_l2_w || 0);
        this.active_power_l3_w = Number(data.active_power_l3_w || 0);
        
        // Voltage (V)
        this.active_voltage_l1_v = Number(data.active_voltage_l1_v || 0);
        this.active_voltage_l2_v = Number(data.active_voltage_l2_v || 0);
        this.active_voltage_l3_v = Number(data.active_voltage_l3_v || 0);
        
        // Current (A)
        this.active_current_a = Number(data.active_current_a || 0);
        this.active_current_l1_a = Number(data.active_current_l1_a || 0);
        this.active_current_l2_a = Number(data.active_current_l2_a || 0);
        this.active_current_l3_a = Number(data.active_current_l3_a || 0);
        
        // Reliability Counters
        this.voltage_sag_l1_count = Number(data.voltage_sag_l1_count || 0);
        this.voltage_sag_l2_count = Number(data.voltage_sag_l2_count || 0);
        this.voltage_sag_l3_count = Number(data.voltage_sag_l3_count || 0);
        this.voltage_swell_l1_count = Number(data.voltage_swell_l1_count || 0);
        this.voltage_swell_l2_count = Number(data.voltage_swell_l2_count || 0);
        this.voltage_swell_l3_count = Number(data.voltage_swell_l3_count || 0);
        this.any_power_fail_count = Number(data.any_power_fail_count || 0);
        this.long_power_fail_count = Number(data.long_power_fail_count || 0);
        
        // Gas
        this.total_gas_m3 = Number(data.total_gas_m3 || 0);
        this.gas_timestamp = data.gas_timestamp || null;
        this.gas_unique_id = data.gas_unique_id || '--';
        
        this.external = (data.external || []).map(ext => ({
            unique_id: ext.unique_id,
            type: ext.type,
            timestamp: ext.timestamp,
            value: Number(ext.value || 0),
            unit: ext.unit
        }));
    }

    get averageVoltage() {
        return (this.active_voltage_l1_v + this.active_voltage_l2_v + this.active_voltage_l3_v) / 3;
    }

    get totalSags() {
        return this.voltage_sag_l1_count + this.voltage_sag_l2_count + this.voltage_sag_l3_count;
    }

    get totalSwells() {
        return this.voltage_swell_l1_count + this.voltage_swell_l2_count + this.voltage_swell_l3_count;
    }

    get activePowerKW() {
        return this.active_power_w / 1000;
    }

    get phaseImbalance() {
        const voltages = [this.active_voltage_l1_v, this.active_voltage_l2_v, this.active_voltage_l3_v];
        const avg = this.averageVoltage;
        if (avg === 0) return 0;
        const maxDev = Math.max(...voltages.map(v => Math.abs(v - avg)));
        return (maxDev / avg) * 100;
    }

    get powerFactorL1() {
        if (this.active_voltage_l1_v === 0 || this.active_current_l1_a === 0) return 1;
        const pf = Math.abs(this.active_power_l1_w) / (this.active_voltage_l1_v * this.active_current_l1_a);
        return Math.min(pf, 1);
    }

    get powerFactorL2() {
        if (this.active_voltage_l2_v === 0 || this.active_current_l2_a === 0) return 1;
        const pf = Math.abs(this.active_power_l2_w) / (this.active_voltage_l2_v * this.active_current_l2_a);
        return Math.min(pf, 1);
    }

    get powerFactorL3() {
        if (this.active_voltage_l3_v === 0 || this.active_current_l3_a === 0) return 1;
        const pf = Math.abs(this.active_power_l3_w) / (this.active_voltage_l3_v * this.active_current_l3_a);
        return Math.min(pf, 1);
    }
}
