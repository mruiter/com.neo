'use strict';

const Homey = require('homey');
const {ZwaveDevice} = require('homey-zwavedriver');

class Wallplug_WR02Z extends ZwaveDevice {

  onNodeInit() {
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
  }
	// define FlowCardAction to reset meter_power
	resetMeterRunListener(args, state) {
    if (this.node
            && this.node.CommandClass
            && this.node.CommandClass.COMMAND_CLASS_METER) {
      this.node.CommandClass.COMMAND_CLASS_METER.METER_RESET({}, (err, result) => {
        if (err) return callback(err);

        // If properly transmitted, change the setting and finish flow card
        return result === 'TRANSMIT_COMPLETE_OK';
      });
    } else return false;
  }
}

module.exports = Wallplug_WR02Z;
