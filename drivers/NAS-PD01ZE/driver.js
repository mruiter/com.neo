'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: false,
	capabilities: {
		'alarm_motion': {
				'command_class': 'COMMAND_CLASS_SENSOR_BINARY',
				'command_get': 'SENSOR_BINARY_GET',
				'command_report': 'SENSOR_BINARY_REPORT',
				'command_report_parser': report => report['Sensor Value'] === 'detected an event'
				},

		'measure_luminance': {
			'command_class': 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			'command_get': 'SENSOR_MULTILEVEL_GET',
			'command_get_parser': () => {
				return {
					'Sensor Type': 'Luminance (version 1)',
					'Properties1': {
						'Scale': 0
					}
				};
			},
			'command_report': 'SENSOR_MULTILEVEL_REPORT',
			'command_report_parser': report => {
				if (report['Sensor Type'] === 'Luminance (version 1)')
					return report['Sensor Value (Parsed)'];

				return null;
			}
		},

		'measure_battery': {
			getOnWakeUp: true,
			'command_class': 'COMMAND_CLASS_BATTERY',
			'command_get': 'BATTERY_GET',
			'command_report': 'BATTERY_REPORT',
			'command_report_parser': function (report) {
				if(report['Battery Level'] === "battery low warning") {
					 return 1;
					} else {
					 return report['Battery Level (Raw)'][0];
				}
 			}
		}
	},
	settings: {
		"motion_sensor_sensitivity": {
			"index": 1,
			"size": 1,
		},
		"motion_blink": {
			"index": 10,
			"size": 1,
		},
		"motion_off_delay": {
			"index": 2,
			"size": 2,
		},
		"day_night_treshold": {
			"index": 5,
			"size": 2,
		},		
		"illumination_polling_interval": {
			"index": 7,
			"size": 2,
		},
		"illumination_report_threshold": {
			"index": 9,
			"size": 2,
		},
	}
});
