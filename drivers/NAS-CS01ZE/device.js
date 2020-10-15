'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class CurtainController_CS01ZE extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
	this.registerCapability('windowcoverings_set', 'SWITCH_MULTILEVEL');
	this.registerCapability('onoff', 'SWITCH_BINARY');

  }
}
module.exports = CurtainController_CS01ZE;
