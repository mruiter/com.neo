'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

class LoggingZwaveDevice extends ZwaveDevice {
  _onReport(capabilityId, commandClassId, payload) {
    const parsedPayload = super._onReport(capabilityId, commandClassId, payload);
    if (!(parsedPayload instanceof Error) && parsedPayload !== null) {
      this.log(`Capability '${capabilityId}' report:`, parsedPayload);
    }
    return parsedPayload;
  }
}

module.exports = LoggingZwaveDevice;
