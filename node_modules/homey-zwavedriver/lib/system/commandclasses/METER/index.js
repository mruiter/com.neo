'use strict';

const defines = require('./defines.json');

module.exports = payload => {
  const properties1 = payload['Properties1'] || {};
  const properties2 = payload['Properties2'] || {};

  // Add Meter Type (Parsed)
  const meterTypeValue = payload['Meter Type'] || properties1['Meter Type'];
  if (meterTypeValue !== undefined) {
    payload['Properties1']['Meter Type (Parsed)'] = {
      value: meterTypeValue,
      name: defines['Meter Type'][meterTypeValue],
    };
  }

  // Add Rate Type (Parsed)
  const rateTypeValue = properties1['Rate Type'];
  if (rateTypeValue !== undefined) {
    payload['Properties1']['Rate Type (Parsed)'] = {
      value: rateTypeValue,
      name: defines['Rate Type'][rateTypeValue],
    };
  }

  // Correct Previous Meter Value
  if (
    Buffer.isBuffer(payload['Scale 2 (Raw)'])
    && Buffer.isBuffer(payload['Previous Meter Value'])
  ) {
    const scaleValueBit2 = properties1['Scale bit 2']; // Scale Bit 2
    const scaleValueBit10 = properties2['Scale bits 10']; // Scale Bit 1 and 0

    // Combine the Scale bits (Meter v3+)
    // Scale (2) the most significant bit of Scale
    // Scale (1:0) 2 least significant bits of Scale
    const scaleValueCorrected = (scaleValueBit2 << 2) | scaleValueBit10;

    // "Scale 2" is only present when "Scale" is 7 (0b111)
    if (scaleValueCorrected !== 7) {
      // The parser split these up because it reserved space for "Scale 2".
      // Since "Scale" is not 7 we correct the payload.

      // Append "Scale 2" to "Previous Meter Value"
      payload['Previous Meter Value'] = Buffer.concat([
        payload['Previous Meter Value'],
        payload['Scale 2 (Raw)'],
      ]);

      // Remove "Scale 2" from payload
      delete payload['Scale 2 (Raw)'];
      delete payload['Scale 2'];
    }
  }

  const size = properties2['Size'];
  const precision = properties2['Precision'];

  const meterValue = payload['Meter Value'];
  const previousMeterValue = payload['Previous Meter Value'];

  // Add Meter Value (Parsed)
  if (Buffer.isBuffer(meterValue)) {
    payload['Meter Value (Parsed)'] = meterValue.readIntBE(0, size);
    payload['Meter Value (Parsed)'] /= 10 ** precision;
  }

  // Add Previous Meter Value (Parsed)
  // Due to an internal bug the size of "Previous Meter Value" is not correctly enforced
  if (Buffer.isBuffer(previousMeterValue) && previousMeterValue.length === size) {
    payload['Previous Meter Value (Parsed)'] = previousMeterValue.readIntBE(0, size);
    payload['Previous Meter Value (Parsed)'] /= 10 ** precision;
  }

  return payload;
};
