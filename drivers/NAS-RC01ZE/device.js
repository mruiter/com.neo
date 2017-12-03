'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class KeyFob_RC01Z extends ZwaveDevice {
	async onMeshInit() {
		let PreviousSequenceNo = 'empty';
		
		this.enableDebug();
		this.printNode();
		this.registerCapability('alarm_battery', 'BATTERY');
		this.registerCapability('alarm_emergency', 'NOTIFICATION');
		this.registerCapability('measure_battery', 'BATTERY');

		
		
		// define and register FlowCardTriggers
		let triggerRC_scene = new Homey.FlowCardTriggerDevice('RC_scene');
		triggerRC_scene
			.register()
			.registerRunListener((args, state) => {
				//this.log(args, state);
				return Promise.resolve(args.button === state.button && args.scene === state.scene);
			});

		
		// register a report listener (SDK2 style not yet operational)
		this.registerReportListener('CENTRAL_SCENE', 'CENTRAL_SCENE_NOTIFICATION', (rawReport, parsedReport) => {
			if (rawReport.hasOwnProperty('Properties1') &&
				rawReport.Properties1.hasOwnProperty('Key Attributes') &&
				rawReport.hasOwnProperty('Scene Number') &&
				rawReport.hasOwnProperty('Sequence Number')) {
				if (rawReport['Sequence Number'] !== PreviousSequenceNo) {
					const remoteValue = {
						button: rawReport['Scene Number'].toString(),
						scene: rawReport.Properties1['Key Attributes'],
					};
					PreviousSequenceNo = rawReport['Sequence Number'];
					this.log('Triggering sequence:', PreviousSequenceNo, 'remoteValue', remoteValue);
					// Trigger the trigger card with 2 dropdown options
					triggerRC_scene.trigger(this, triggerRC_scene.getArgumentValues, remoteValue);
				}
			}
		});		

		
		
	}
}
module.exports = KeyFob_RC01Z;
