'use strict';

const Homey = require('homey');
const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class WallSwitchSingle_SC01ZE extends LoggingZwaveDevice {
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
    let SC01ZE_LED_mode_run_listener = async (args) => {
      try {
        this.log('FlowCardAction Set Led Mode to: ', args.backlight);
        await this.configurationSet({
          id: 'backlight'
        }, args.backlight);
        return true;
      } catch (err) {
        this.error('failed_to_set_led_mode', err);
        throw new Error('Z-Wave device did not respond');
      }
    };
    this.homey.flow.getActionCard('SC01ZE_switch_LED')
      .registerRunListener(SC01ZE_LED_mode_run_listener);
  }
}
module.exports = WallSwitchSingle_SC01ZE;
