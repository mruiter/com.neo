'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class CurtainController_CS01ZE extends ZwaveDevice {
  async onMeshInit() {
    this.enableDebug();
    this.printNode();
	this.registerCapability('dim', 'SWITCH_MULTILEVEL');
	this.registerCapability('windowcoverings_state', 'SWITCH_BINARY');

  }
}
module.exports = CurtainController_CS01ZE;
