'use strict';

const Homey = require('homey');
const { ZwaveDevice } = require('homey-zwavedriver');

class CurtainController_CS01ZE extends ZwaveDevice {

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register device capabilities
	this.registerCapability('windowcoverings_set', 'SWITCH_MULTILEVEL');
	this.registerCapability('onoff', 'SWITCH_BINARY');

  }
}
module.exports = CurtainController_CS01ZE;
