'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class Siren_AB01Z extends ZwaveDevice {
	onMeshInit() {
		this.enableDebug();
		this.printNode();
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
			return new Promise((resolve, reject) => {
				args.device.node.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_SET({
					'Parameter Number': 7,
					Level: {
						Size: 1,
						Default: false,
					},
					'Configuration Value': args.alarm_mode,
				}, (err, result) => {
					if (err) {
						reject(err);
						return this._debug('CONFIGURATION_SET', err);
					}
					resolve();
				});
			})

		};
		let actionAB01ZE_alarm_mode = new Homey.FlowCardAction('AB01ZE_alarm_mode');
		actionAB01ZE_alarm_mode
			.register()
			.registerRunListener(AB01ZE_alarm_mode_run_listener);
			
		//===== CONTROL Siren Alarm Tune
		let AB01ZE_alarm_tune_run_listener = async(args) => {
			this.log('FlowCardAction Set Alarm Tune to: ', args.alarm_tune);
			return new Promise((resolve, reject) => {
				args.node.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_SET({
					'Parameter Number': 5,
					Level: {
						Size: 1,
						Default: false,
					},
					'Configuration Value': args.alarm_mode,
				}, (err, result) => {
					if (err) {
						reject(err);
						return this._debug('CONFIGURATION_SET', err);
					}
					resolve();
				});
			})

		};
		let actionAB01ZE_alarm_tune = new Homey.FlowCardAction('AB01ZE_alarm_tune');
		actionAB01ZE_alarm_tune
			.register()
			.registerRunListener(AB01ZE_alarm_tune_run_listener);

		//===== CONTROL Siren Doorbell Tune
		let AB01ZE_doorbell_tune_run_listener = async(args) => {
			this.log('FlowCardAction Set Doorbell Tune to: ', args.doorbell_tune);
			return new Promise((resolve, reject) => {
				args.node.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_SET({
					'Parameter Number': 6,
					Level: {
						Size: 1,
						Default: false,
					},
					'Configuration Value': args.alarm_mode,
				}, (err, result) => {
					if (err) {
						reject(err);
						return this._debug('CONFIGURATION_SET', err);
					}
					resolve();
				});
			})

		};
		let actionAB01ZE_doorbell_tune = new Homey.FlowCardAction('AB01ZE_doorbell_tune');
		actionAB01ZE_doorbell_tune
			.register()
			.registerRunListener(AB01ZE_doorbell_tune_run_listener);				

	}

	
	// update Z-wave configuration parameters - Teds Example
		AB_configuration_run_listener(args, changedKey) {
			this._debug('Setting configuration parameter:', changedKey);
			return new Promise((resolve, reject) => {
				args.node.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_SET({
					'Parameter Number': changedKey.id,
					Level: {
						Size: changedKey.size,
						Default: false,
					},
					'Configuration Value': changedKey.parsedValue, // in .size byte Buffer
				}, (err, result) => {
					if (err) {
						reject(err);
						return this._debug('CONFIGURATION_SET', err);
					}
					resolve();
				});
			})
		}
	
}
module.exports = Siren_AB01Z;
