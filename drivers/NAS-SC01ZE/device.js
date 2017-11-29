'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class WallSwitchDual_SC01Z extends ZwaveDevice {
	async onMeshInit() {
		//this.enableDebug();
		//this.printNode();
		this.registerCapability('onoff', 'SWITCH_BINARY');
}
module.exports = WallSwitchDual_SC01Z;
