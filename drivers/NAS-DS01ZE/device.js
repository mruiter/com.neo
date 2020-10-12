'use strict';

const {ZwaveDevice} = require('homey-zwavedriver');

class DoorWindowSensor_DS01Z extends ZwaveDevice {

  async onNodeInit() {
    this.registerCapability('alarm_contact', 'NOTIFICATION', {
      getOpts: {
        getOnOnline: true,
      },
    });
    this.registerCapability('measure_battery', 'BATTERY');
  }

}

module.exports = DoorWindowSensor_DS01Z;
