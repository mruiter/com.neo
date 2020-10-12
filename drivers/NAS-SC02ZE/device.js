'use strict';

const {ZwaveDevice} = require('homey-zwavedriver');

class WallSwitchDual_SC02Z extends ZwaveDevice {

  onNodeInit() {
    this.registerCapability('onoff', 'SWITCH_BINARY');
  }
}

module.exports = WallSwitchDual_SC02Z;
