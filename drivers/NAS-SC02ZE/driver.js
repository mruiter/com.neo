'use strict';

const Homey = require('homey');

class WallSwitchSingle_SC02Z extends Homey.Driver {

  onInit() {
    super.onInit();

    this.ledOnAction = this.homey.flow.getActionCard('NAS-SC02Z_backlight_mode');
    this.ledOnAction.registerRunListener((args, state) => {
      return args.device.ledOnRunListener(args, state);
    });

    this.outputToggleAction = this.homey.flow.getActionCard('NAS-SC02Z_Toggle')
      this.outputToggleAction.registerRunListener((args, state) => {
        this.log('Changing state to:', !args.device.getCapabilityValue(`onoff`));
        return args.device.setOutputRunListener(args, state,
          !args.device.getCapabilityValue(`onoff`));
      });
  }

}

module.exports = WallSwitchSingle_SC02Z;
