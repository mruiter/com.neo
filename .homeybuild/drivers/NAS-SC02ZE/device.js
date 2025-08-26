'use strict';

const Homey = require('homey');
const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class WallSwitchDual_SC02ZE extends LoggingZwaveDevice {

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register device capabilities
    this.registerCapability('onoff', 'SWITCH_BINARY');
    this.registerReportListener('BASIC', 'BASIC_SET', report => {
      if (report && report.hasOwnProperty('Value')) {
        this.setCapabilityValue('onoff', report.Value === 255).catch(this.error);
      }
    });

    //===== Led On/Off
    let SC02ZE_LED_mode_run_listener = async (args) => {
      this.log('FlowCardAction Set Led Mode to: ', args.backlight);
      this.configurationSet({
        id: 'backlight'
      }, args.backlight);
    };
    this.homey.flow.getActionCard('SC02ZE_switch_LED')
      .registerRunListener(SC02ZE_LED_mode_run_listener);
  }
}
module.exports = WallSwitchDual_SC02ZE;
