'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class DoorWindowSensor_DS01Z extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
    this.registerCapability('alarm_contact', 'NOTIFICATION');
    this.registerCapability('alarm_battery', 'BATTERY');
    this.registerCapability('measure_battery', 'BATTERY', {
      getOpts: {
        getOnOnline: true,
      }
    });
  }
}
module.exports = DoorWindowSensor_DS01Z;
