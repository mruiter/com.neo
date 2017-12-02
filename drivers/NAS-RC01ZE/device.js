'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class KeyFob_RC01Z extends ZwaveDevice {
	async onMeshInit() {
		let PreviousSequenceNo = 'empty';
		
		this.enableDebug();
		this.printNode();
		this.registerCapability('alarm_battery', 'BATTERY');
		this.registerCapability('measure_battery', 'BATTERY');
		
		
		// define and register FlowCardTriggers
		let triggerRC_scene = new Homey.FlowCardTriggerDevice('RC_scene');
		triggerRC_scene
			.register()
			.registerRunListener((args, state) => {
				this.log(args, state);
				return Promise.resolve(args.button === state.button && args.scene === state.scene);
			});

		let triggerRC_button = new Homey.FlowCardTriggerDevice('RC_button');
		triggerRC_button
			.register();
		
		// register a report listener (SDK2 style not yet operational)
		this.registerReportListener('CENTRAL_SCENE', 'CENTRAL_SCENE_NOTIFICATION', (rawReport, parsedReport) => {
			this.log('registerReportListener', rawReport, parsedReport);
		});		
		
		// OLD API reportListener used since new registerReportListener is not active without capability
		this.node.CommandClass['COMMAND_CLASS_CENTRAL_SCENE'].on('report', (command, report) => {
			if (command.name === 'CENTRAL_SCENE_NOTIFICATION' &&
				report &&
				report.hasOwnProperty('Properties1') &&
				report.Properties1.hasOwnProperty('Key Attributes') &&
				report.hasOwnProperty('Scene Number') &&
				report.hasOwnProperty('Sequence Number')) {
				if (report['Sequence Number'] !== PreviousSequenceNo) {
					const remoteValue = {
						button: report['Scene Number'].toString(),
						scene: report.Properties1['Key Attributes'],
					};
					PreviousSequenceNo = report['Sequence Number'];
					// Trigger the trigger card with 2 dropdown options
					triggerRC_scene.trigger(this, triggerRC_scene.getArgumentValues, remoteValue);
					// Trigger the trigger card with tokens
					triggerRC_button.trigger(this, remoteValue, null);
				}
			}
		});	
		
		
	}
}
module.exports = KeyFob_RC01Z;
