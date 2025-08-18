'use strict';

module.exports = payload => {
  if (Buffer.isBuffer(payload['Sensor Value'])) {
    payload['Sensor Value (Parsed)'] = payload['Sensor Value'].readIntBE(0, payload.Level.Size);
    payload['Sensor Value (Parsed)'] /= 10 ** payload.Level.Precision;
  }

  return payload;
};
