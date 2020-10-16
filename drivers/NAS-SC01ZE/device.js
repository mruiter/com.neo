'use strict';

const {ZwaveDevice} = require('homey-zwavedriver');

class WallSwitchSingle_SC01Z extends ZwaveDevice {

  onNodeInit() {
    this.registerCapability('onoff', 'SWITCH_BINARY');
  }
   async ledOnRunListener(args, state) {
    if (args.hasOwnProperty('backlight_state')) {
      return this.configurationSet({
        index: 1,
        size: 1,
        id: 'backlight_mode',
      }, new Buffer([args.backlight_state]));
    }
  }
}

module.exports = WallSwitchSingle_SC01Z;
