'use strict';

const Homey = require('homey');

class Wallplug_WR02Z extends Homey.Driver {

  onInit() {
    super.onInit();
    this.resetMeter = this.homey.flow.getActionCard('WR02Z_reset_meter')
    this.resetMeter.registerRunListener((args, state) => {
      return args.device.resetMeterRunListener(args, state);
    });
  }

}

module.exports = Wallplug_WR02Z;