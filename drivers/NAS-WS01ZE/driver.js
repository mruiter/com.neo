'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: true,
	capabilities: {
		'alarm_water': {
            'command_class'             : 'COMMAND_CLASS_SENSOR_BINARY',
            'command_get'               : 'SENSOR_BINARY_GET',
            'command_report'            : 'SENSOR_BINARY_REPORT',
            'command_report_parser'     : function( report ){
                //console.log((report));
                return report['Sensor Value'] === 'detected an event';
            }
        },   


		'measure_battery': {
			'command_class': 'COMMAND_CLASS_BATTERY',
			'command_get': 'BATTERY_GET',
			'command_report': 'BATTERY_REPORT',
			'command_report_parser': report => {
				if (report['Battery Level'] === "battery low warning") return 1;

				return report['Battery Level (Raw)'][0];
			},
			'optional': true
		}


	},
	settings: {
		"alarm_sound_enable_disable": {
			"index": 5,
			"size": 1,
		},
	}
});
