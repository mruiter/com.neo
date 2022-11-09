'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class WallSwitchSingle_SC01ZE extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
    this.registerCapability('onoff', 'SWITCH_BINARY');

    //===== Led On/Off
    let SC01ZE_LED_mode_run_listener = async (args) => {
      this.log('FlowCardAction Set Led Mode to: ', args.switch_LED_onoff);
      this.configurationSet({
        id: 'backlight'
      }, args.switch_LED_onoff);
    };
    let actionSC01ZE_led_mode = new Homey.FlowCardAction('SC01ZE_switch_LED');
    actionSC01ZE_led_mode
      .register()
      .registerRunListener(SC01ZE_LED_mode_run_listener);
  }
}
module.exports = WallSwitchSingle_SC01ZE;
