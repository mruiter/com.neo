'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class WaterSensor_WS01 extends ZwaveDevice {
  async onMeshInit() {
    this.enableDebug();
    this.printNode();
    this.registerCapability('alarm_water', 'NOTIFICATION', {
      get: 'NOTIFICATION_GET',
      getOpts: {
        getOnOnline: true,
      },
      getParser: () => ({
        'V1 Alarm Type': 0,
        'Notification Type': 'Water',
      }),
      report: 'NOTIFICATION_REPORT',
      reportParser: report => {
        if (report && report['Notification Type'] === 'Water') {
          if (report['Event'] === 1) return true;
          if (report['Event'] === 0) return false;
        }
        return null;
      }
    });
	
    this.registerCapability('alarm_battery', 'BATTERY');
    this.registerCapability('measure_battery', 'BATTERY', {
      getOpts: {
        getOnOnline: true,
      }
    });
  }

}
module.exports = WaterSensor_WS01;
