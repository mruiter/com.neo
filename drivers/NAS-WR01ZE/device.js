'use strict';

const Homey = require('homey');
const { ZwaveDevice } = require('homey-zwavedriver');

class Wallplug_WR01Z extends ZwaveDevice {

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register capabilities for this device
		this.registerCapability('onoff', 'SWITCH_BINARY');

		this.registerCapability('measure_power', 'METER', {
            getParserV4: () => ({
                'Sensor Type': 'Electric meter',
                'Properties1': {
                    'Scale': 2,
                }
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
                'Sensor Type': 'Electric meter',
                'Properties1': {
                    'Scale': 0,
                }
            }),
            reportParserV4: report => {
                if (report.hasOwnProperty('Properties2') &&
                    report.Properties2.hasOwnProperty('Scale bits 10') &&
                    report.Properties2['Scale bits 10'] === 0 &&
                    report.Properties1.hasOwnProperty('Scale bit 2') &&
                    report.Properties1['Scale bit 2'] === false) {
                    return report['Meter Value (Parsed)'];
                }
                return null;
            }
        });

        this.registerCapability('measure_voltage', 'METER', {
            getParserV4: () => ({
                'Sensor Type': 'Electric meter',
                'Properties1': {
                    'Scale': 4,
                }
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
                'Sensor Type': 'Electric meter',
                'Properties1': {
                    'Scale': 5,
                }
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
    const WR01Z_reset_meter_run_listener = async args => {
      const result = await args.device.node.CommandClass.COMMAND_CLASS_METER.METER_RESET({});
      if (result !== 'TRANSMIT_COMPLETE_OK') throw new Error(result);
    };

    const actionWR01Z_reset_meter = this.homey.flow
      .getActionCard('WR01Z_reset_meter')
      .registerRunListener(WR01Z_reset_meter_run_listener);	

  }
}
module.exports = Wallplug_WR01Z;
