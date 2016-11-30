'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		'alarm_motion': {
			'command_class': 'COMMAND_CLASS_NOTIFICATION',
			'command_get': 'NOTIFICATION_GET',
			'command_get_parser': () => {
				return {
					'V1 Alarm Type': 0,
					'Notification Type': 'Home Security',
					'Event': 7
				};
			},
			'command_report': 'NOTIFICATION_REPORT',
			'command_report_parser': report => {
				if (report['Notification Type'] === 'Home Security' &&
					report.hasOwnProperty("Event")) {

					if (report['Event (Parsed)'] === 'Motion Detection' ||
						report['Event (Parsed)'] === 'Motion Detection, Unknown Location')
						return true;

					if (report['Event (Parsed)'] === 'Event inactive' &&
						report.hasOwnProperty("Event Parameter") &&
						(report['Event Parameter'][0] === 7 ||
						report['Event Parameter'][0] === 8))
						return false;

					return null;
				}
			}
		},

		'alarm_battery': {
			'command_class': 'COMMAND_CLASS_BATTERY',
			'command_get': 'BATTERY_GET',
			'command_report': 'BATTERY_REPORT',
			'command_report_parser': report => {
				if (report['Battery Level'] === "battery low warning") return 1;

				return report['Battery Level (Raw)'][0];
			}
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
			'command_class': 'COMMAND_CLASS_BATTERY',
			'command_get': 'BATTERY_GET',
			'command_report': 'BATTERY_REPORT',
			'command_report_parser': report => {
				if (report['Battery Level'] === "battery low warning")
					return 1;

				return report['Battery Level (Raw)'][0];
			}
		}
	},
	settings: {
		"motion_sensor_sensitivity": {
			"index": 1,
			"size": 1,
		},
	}
});
