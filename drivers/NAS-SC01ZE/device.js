'use strict';

const {ZwaveDevice} = require('homey-zwavedriver');

class WallSwitchSingle_SC01Z extends ZwaveDevice {

  onNodeInit() {
    this.registerCapability('onoff', 'SWITCH_BINARY');
  }
}

module.exports = WallSwitchSingle_SC01Z;
