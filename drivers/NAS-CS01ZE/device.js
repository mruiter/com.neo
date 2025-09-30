'use strict';

const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class CurtainController_CS01ZE extends LoggingZwaveDevice {

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register device capabilities
    this.registerCapability('windowcoverings_set', 'SWITCH_MULTILEVEL');
    this.registerCapability('onoff', 'SWITCH_BINARY');

    // update onoff to reflect the reported curtain state
    this.registerReportListener('SWITCH_MULTILEVEL', 'SWITCH_MULTILEVEL_REPORT', report => {
      if (report && report.hasOwnProperty('Current Value (Raw)')) {
        this.setCapabilityValue('onoff', report['Current Value (Raw)'][0] > 0).catch(this.error);
      } else if (report && report.hasOwnProperty('Value (Raw)')) {
        this.setCapabilityValue('onoff', report['Value (Raw)'][0] > 0).catch(this.error);
      }
    });
  }
}
module.exports = CurtainController_CS01ZE;
