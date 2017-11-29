'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class Siren_AB01Z extends ZwaveDevice {
	async onMeshInit() {
		//this.enableDebug();
		//this.printNode();
		this.registerCapability('onoff', 'SWITCH_BINARY');
		this.registerCapability('alarm_siren', 'NOTIFICATION');
		this.registerCapability('alarm_battery', 'BATTERY');
		this.registerCapability('measure_battery', 'BATTERY');
			
		//===== Sound Alarm
		let AB01ZE_alarm_state_run_listener = async(args) => {
			this.log('Status Alarm: ', args.alarm_state);
			
		};
		let actionAB01ZE_alarm_state = new Homey.FlowCardAction('AB01ZE_alarm_state');
		actionAB01ZE_alarm_state
			.register()
			.registerRunListener(AB01ZE_alarm_state_run_listener);
			
			
		//===== CONTROL Siren Alarm/Doorbell mode
		let AB01ZE_alarm_mode_run_listener = async(args) => {
			this.log('FlowCardAction Set Alarm Mode to: ', args.alarm_mode);
			this.configurationSet({id: 'alarmordoorbell'}, args.alarm_mode);
		};
		let actionAB01ZE_alarm_mode = new Homey.FlowCardAction('AB01ZE_alarm_mode');
		actionAB01ZE_alarm_mode
			.register()
			.registerRunListener(AB01ZE_alarm_mode_run_listener);
			
		//===== CONTROL Siren Alarm Tune
		let AB01ZE_alarm_tune_run_listener = async(args) => {
			this.log('FlowCardAction Set Alarm Tune to: ', args.alarm_tune);
			this.configurationSet({id: 'alarmtune'}, args.alarm_tune);
		};
		let actionAB01ZE_alarm_tune = new Homey.FlowCardAction('AB01ZE_alarm_tune');
		actionAB01ZE_alarm_tune
			.register()
			.registerRunListener(AB01ZE_alarm_tune_run_listener);

		//===== CONTROL Siren Doorbell Tune
		let AB01ZE_doorbell_tune_run_listener = async(args) => {
			this.log('FlowCardAction Set Doorbell Tune to: ', args.doorbell_tune);
			this.configurationSet({id: 'doorbelltune'}, args.doorbell_tune);
		};
		let actionAB01ZE_doorbell_tune = new Homey.FlowCardAction('AB01ZE_doorbell_tune');
		actionAB01ZE_doorbell_tune
			.register()
			.registerRunListener(AB01ZE_doorbell_tune_run_listener);				

	}
	
}
module.exports = Siren_AB01Z;
