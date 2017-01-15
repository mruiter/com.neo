'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: false,
	capabilities: {
		'alarm_water': {
			'command_class': 'COMMAND_CLASS_SENSOR_BINARY',
			'command_get': 'SENSOR_BINARY_GET',
			'command_report': 'SENSOR_BINARY_REPORT',
			'command_report_parser': report => report['Sensor Value'] === 'detected an event'
		},
		'measure_battery': {
			//getOnWakeUp: true,
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
		"alarm_duration_time": {
			"index": 1,
			"size": 1,
		},
		"alarm_interval": {
			"index": 2,
			"size": 1,
		},
		"first_alarm_ontime": {
			"index": 3,
			"size": 1,
		},
		"first_alarm_duration": {
			"index": 4,
			"size": 1,
		},
		"alarm_sound_enable_disable": {
			"index": 5,
			"size": 1,
		},
		"sensor_enable_disable": {
			"index": 6,
			"size": 1,
		}
	}
});
