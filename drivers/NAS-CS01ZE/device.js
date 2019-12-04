'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class CurtainController_CS01ZE extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
    this.registerCapability('onoff', 'SWITCH_BINARY');

    //===== Led On/Off
    let CS01ZE_LED_mode_run_listener = async (args) => {
      this.log('FlowCardAction Set Led Mode to: ', args.switch_LED_onoff);
      this.configurationSet({
        id: 'backlight'
      }, args.switch_LED_onoff);
    };
    let actionCS01ZE_led_mode = new Homey.FlowCardAction('CS01ZE_switch_LED');
    actionCS01ZE_led_mode
      .register()
      .registerRunListener(CS01ZE_LED_mode_run_listener);
  }
}
module.exports = CurtainController_CS01ZE;
