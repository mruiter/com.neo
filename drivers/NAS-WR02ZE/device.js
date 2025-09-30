'use strict';

const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class Wallplug_WR02Z extends LoggingZwaveDevice {

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register capabilities for this device
    this.registerCapability('onoff', 'SWITCH_BINARY');

    const createMeterOptions = ({ scale, scaleBits10, scaleBit2, correctNegative = false }) => ({
      getParserV4: () => ({
        Properties1: {
          'Rate Type': 'Import',
          'Scale': scale,
        },
        'Scale 2': 0,
      }),
      reportParserV4: report => {
        const properties1 = report?.Properties1;
        const properties2 = report?.Properties2;
        if (
          properties2?.['Scale bits 10'] === scaleBits10 &&
          properties1?.['Scale bit 2'] === scaleBit2
        ) {
          let value = report['Meter Value (Parsed)'];
          if (correctNegative && value < 0) {
            value += 21474836.48;
            this.log('Corrected negative meter_power');
          }
          return value;
        }
        return null;
      }
    });

    this.registerCapability('measure_power', 'METER', createMeterOptions({
      scale: 2,
      scaleBits10: 2,
      scaleBit2: false,
    }));

    this.registerCapability('meter_power', 'METER', createMeterOptions({
      scale: 0,
      scaleBits10: 0,
      scaleBit2: false,
      correctNegative: true,
    }));

    this.registerCapability('measure_voltage', 'METER', createMeterOptions({
      scale: 4,
      scaleBits10: 0,
      scaleBit2: true,
    }));

    this.registerCapability('measure_current', 'METER', createMeterOptions({
      scale: 5,
      scaleBits10: 1,
      scaleBit2: true,
    }));

    const registerActionCard = (cardId, runListener) => {
      const card = this.homey.flow.getActionCard(cardId);
      if (card instanceof Error) {
        this.error(`missing_${cardId}_card_in_manifest`);
        return;
      }
      card.registerRunListener(runListener);
    };

    registerActionCard('WR02Z_reset_meter', async args => {
      try {
        const result = await args.device.node.CommandClass.COMMAND_CLASS_METER.METER_RESET({});
        if (result !== 'TRANSMIT_COMPLETE_OK') throw new Error(result);
        return true;
      } catch (err) {
        this.error('failed_to_reset_meter', err);
        throw new Error('Z-Wave device did not respond');
      }
    });
  }
}
module.exports = Wallplug_WR02Z;
