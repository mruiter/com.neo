'use strict';

const Homey = require('homey');

class Wallplug_WR01Z extends Homey.Driver {

  onInit() {
    super.onInit();
    this.resetMeter = this.homey.flow.getActionCard('WR01Z_reset_meter')
    this.resetMeter.registerRunListener((args, state) => {
      return args.device.resetMeterRunListener(args, state);
    });
  }

}

module.exports = Wallplug_WR01Z;