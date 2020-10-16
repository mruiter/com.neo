'use strict';

const Homey = require('homey');
const {
  ZwaveDevice
} = require('homey-zwavedriver');

class Siren_AB01Z extends ZwaveDevice {

  async onNodeInit() {

    //this.enableDebug();
    //this.printNode();
    this.registerCapability('onoff', 'SWITCH_BINARY');
    this.registerCapability('measure_battery', 'BATTERY', {
      getOpts: {
        getOnOnline: true,
      }
    });
    this.registerCapability('alarm_siren', 'NOTIFICATION', {
      get: 'NOTIFICATION_GET',
      getOpts: {
        getOnOnline: true,
      },
      getParser: () => ({
        'V1 Alarm Type': 0,
        'Notification Type': 'Siren',
      }),
      report: 'NOTIFICATION_REPORT',
      reportParser: report => {
        if (report && report['Notification Type'] === 'Siren') {
          if (report['Event'] === 1) {
            this.emit('SirenTrigger');
            return true;
          }
          if (report['Event'] === 0) return false;
        }
        return null;
      }
    });
  }

}

module.exports = Siren_AB01Z;
