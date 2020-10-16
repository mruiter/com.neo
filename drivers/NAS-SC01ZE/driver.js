'use strict';

const Homey = require('homey');

class WallSwitchSingle_SC01Z extends Homey.Driver {

  onInit() {
    super.onInit();

    this.ledOnAction = this.homey.flow.getActionCard('backlight_mode');
    this.ledOnAction.registerRunListener((args, state) => {
      return args.device.ledOnRunListener(args, state);
    });
  }

}

module.exports = WallSwitchSingle_SC01Z;
