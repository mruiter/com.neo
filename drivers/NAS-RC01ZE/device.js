'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class KeyFob_RC01Z extends ZwaveDevice {
  async onMeshInit() {
    let PreviousSequenceNo = 'empty';

    //this.enableDebug();
    //this.printNode();
    this.registerCapability('measure_battery', 'BATTERY');
    this.registerCapability('alarm_emergency', 'NOTIFICATION', {
      get: 'NOTIFICATION_GET',
      getOpts: {
        getOnOnline: true,
      },
      getParser: () => ({
        'V1 Alarm Type': 0,
        'Notification Type': 'Emergency',
      }),
      report: 'NOTIFICATION_REPORT',
      reportParser: report => {
        if (report && report['Notification Type'] === 'Emergency') {
          if (report['Event'] === 1) {
            this.emit('EmergencyTrigger');
            return true;
          }
          if (report['Event'] === 0) return false;
        }
        return null;
      }
    });


    // Register Flow card trigger
    const EmergencyFlowTrigger = new Homey.FlowCardTriggerDevice('alarm_emergency');
    EmergencyFlowTrigger.register();

    // Check if Flow card is registered in app manifest
    if (!(EmergencyFlowTrigger instanceof Error)) {

      // Handle Emergency notification
      this.on('EmergencyTrigger', async () => {
        this.log('EmergencyTrigger');
        try {
          await EmergencyFlowTrigger.trigger(this, {}, {});
        } catch (err) {
          this.error('failed_to_trigger_alarm_emergency_flow', err);
        }
      });
    } else this.error('missing_alarm_emergency_card_in_manifest');

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
