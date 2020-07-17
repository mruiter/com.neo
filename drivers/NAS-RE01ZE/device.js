'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class Repeater_RE01Z extends ZwaveDevice {
  async onMeshInit() {
    //*this.enableDebug();
    //*this.printNode();
	//*this.registerSetting('82', value => Buffer.from([Number(!value)]));
  }
}
module.exports = Repeater_RE01Z;
