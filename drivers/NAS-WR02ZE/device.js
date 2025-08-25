'use strict';

const Homey = require('homey');
const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class Wallplug_WR02Z extends LoggingZwaveDevice {

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register capabilities for this device
    this.registerCapability('onoff', 'SWITCH_BINARY');

        this.registerCapability('measure_power', 'METER', {
            getParserV4: () => ({
                Properties1: {
                    'Rate Type': 'Import',
                    Scale: 2,
                },
                'Scale 2': 0,
            }),
            reportParserV4: report => {
                if (report.hasOwnProperty('Properties2') &&
                    report.Properties2.hasOwnProperty('Scale bits 10') &&
                    report.Properties2['Scale bits 10'] === 2 &&
                    report.Properties1.hasOwnProperty('Scale bit 2') &&
                    report.Properties1['Scale bit 2'] === false) {
                    return report['Meter Value (Parsed)'];
                }
                return null;
            }
		});

        this.registerCapability('meter_power', 'METER', {
            getParserV4: () => ({
                Properties1: {
                    'Rate Type': 'Import',
                    Scale: 0,
                },
                'Scale 2': 0,
            }),
            reportParserV4: report => {
                if (report.hasOwnProperty('Properties2') &&
                    report.Properties2.hasOwnProperty('Scale bits 10') &&
                    report.Properties2['Scale bits 10'] === 0 &&
                    report.Properties1.hasOwnProperty('Scale bit 2') &&
                    report.Properties1['Scale bit 2'] === false) {
                      // Correct negative values due to firmware bug
                      if (report['Meter Value (Parsed)'] < 0) {
                        report['Meter Value (Parsed)'] += 21474836.48;
                        this.log('Corrected negative meter_power')
                      }
                    return report['Meter Value (Parsed)'];
                }
                return null;
            }
        });

        this.registerCapability('measure_voltage', 'METER', {
            getParserV4: () => ({
                Properties1: {
                    'Rate Type': 'Import',
                    Scale: 4,
                },
                'Scale 2': 0,
            }),
            reportParserV4: report => {
                if (report.hasOwnProperty('Properties2') &&
                    report.Properties2.hasOwnProperty('Scale bits 10') &&
                    report.Properties2['Scale bits 10'] === 0 &&
                    report.Properties1.hasOwnProperty('Scale bit 2') &&
                    report.Properties1['Scale bit 2'] === true) {
                    return report['Meter Value (Parsed)'];
                }
                return null;
            }
        });

        this.registerCapability('measure_current', 'METER', {
            getParserV4: () => ({
                Properties1: {
                    'Rate Type': 'Import',
                    Scale: 5,
                },
                'Scale 2': 0,
            }),
            reportParserV4: report => {
                if (report.hasOwnProperty('Properties2') &&
                    report.Properties2.hasOwnProperty('Scale bits 10') &&
                    report.Properties2['Scale bits 10'] === 1 &&
                    report.Properties1.hasOwnProperty('Scale bit 2') &&
                    report.Properties1['Scale bit 2'] === true ) {
                    return report['Meter Value (Parsed)'];
                }
                return null;
            }
        });

	// define FlowCardAction to reset meter_power
    const WR02Z_reset_meter_run_listener = async args => {
      const result = await args.device.node.CommandClass.COMMAND_CLASS_METER.METER_RESET({});
      if (result !== 'TRANSMIT_COMPLETE_OK') throw new Error(result);
    };

    const actionWR02Z_reset_meter = this.homey.flow
      .getActionCard('WR02Z_reset_meter')
      .registerRunListener(WR02Z_reset_meter_run_listener);
  }
}
module.exports = Wallplug_WR02Z;
