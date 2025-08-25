'use strict';

const Homey = require('homey');
const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class KeyFob_RS01Z extends LoggingZwaveDevice {
  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register device capabilities
    this.registerCapability('measure_battery', 'BATTERY');

    this.registerCapability('alarm_sos', 'NOTIFICATION', {
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
    const EmergencyFlowTrigger = this.homey.flow.getDeviceTriggerCard('alarm_sos');

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
  }
}
module.exports = KeyFob_RS01Z;
