'use strict';

function getBitBE(value, position) {
  return !!((1 << position) & value);
}

const ALARM_TYPES = {
  0: 'General Purpose Alarm',
  1: 'Smoke Alarm',
  2: 'CO Alarm',
  3: 'CO2 Alarm',
  4: 'Heat Alarm',
  5: 'Water Leak Alarm',
};

module.exports = payload => {
  if (Buffer.isBuffer(payload['Bit Mask'])) {
    const byte = payload['Bit Mask'].readUInt8();
    const result = {};

    for (const alarmValue of Object.keys(ALARM_TYPES)) {
      const position = parseInt(alarmValue, 10);
      const type = ALARM_TYPES[alarmValue];
      result[type] = getBitBE(byte, position);
    }

    payload['Bit Mask (Parsed)'] = result;
  }

  return payload;
};
