'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class WallSwitchDual_SC03ZE extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
    this.registerCapability('onoff', 'SWITCH_BINARY');

    //===== Led On/Off
    let SC03ZE_LED_mode_run_listener = async (args) => {
      this.log('FlowCardAction Set Led Mode to: ', args.switch_LED_onoff);
      this.configurationSet({
        id: 'backlight'
      }, args.switch_LED_onoff);
    };
    let actionSC03ZE_led_mode = new Homey.FlowCardAction('SC03ZE_switch_LED');
    actionSC03ZE_led_mode
      .register()
      .registerRunListener(SC03ZE_LED_mode_run_listener);
  }
}
module.exports = WallSwitchDual_SC03ZE;
