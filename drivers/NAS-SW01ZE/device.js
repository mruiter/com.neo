'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class WallSwitchDual_SW01Z extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
    this.registerCapability('onoff', 'SWITCH_BINARY');

    //===== Led On/Off
    let SW01ZE_LED_mode_run_listener = async (args) => {
      this.log('FlowCardAction Set Led Mode to: ', args.switch_LED_onoff);
      this.configurationSet({
        id: 'backlight'
      }, args.switch_LED_onoff);
    };
    let actionSW01ZE_led_mode = new Homey.FlowCardAction('SW01ZE_switch_LED');
    actionSW01ZE_led_mode
      .register()
      .registerRunListener(SW01ZE_LED_mode_run_listener);
  }
}
module.exports = WallSwitchDual_SW01Z;
