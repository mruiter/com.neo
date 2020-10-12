'use strict';

const {ZwaveDevice} = require('homey-zwavedriver');

class CurtainController_CS01ZE extends ZwaveDevice {

  async onNodeInit() {
    //this.enableDebug();
    //this.printNode();
	this.registerCapability('windowcoverings_set', 'SWITCH_MULTILEVEL');
	this.registerCapability('onoff', 'SWITCH_BINARY');

  }

}

module.exports = CurtainController_CS01ZE;
