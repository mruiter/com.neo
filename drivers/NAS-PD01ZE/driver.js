'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');
// http://products.z-wavealliance.org/products/1920

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
						'Scale': 1
						}
					};
			},
			'command_report': 'SENSOR_MULTILEVEL_REPORT',
			'command_report_parser': report => {
			if (report['Sensor Type'] === 'Luminance (version 1)' &&
			report.hasOwnProperty("Level") &&
			report.Level.hasOwnProperty("Scale") &&
			report.Level.Scale === 1)
			return report['Sensor Value (Parsed)'];
			return null;
			}
		},
		'alarm_battery': { 
    			'command_class': 'COMMAND_CLASS_BATTERY',
	    		'command_get': 'BATTERY_GET',
    			'command_report': 'BATTERY_REPORT',
    			'command_report_parser': (report, node) => { 
    				if(report.hasOwnProperty('Battery Level (Raw)')) {
    					if (report['Battery Level (Raw)'][0] == 255) {
    						return true
    						}
    					return false
   	        			}
   					}		
    	},
		'measure_battery': { 
    			getOnWakeUp: true,
    			'command_class': 'COMMAND_CLASS_BATTERY',
	    		'command_get': 'BATTERY_GET',
    			'command_report': 'BATTERY_REPORT',
    			'command_report_parser': (report, node) => { 
    				if(report.hasOwnProperty('Battery Level (Raw)')) {
    					if(report['Battery Level (Raw)'][0] == 255) return 1;
        				return report['Battery Level (Raw)'][0];
						}
					return null;
    			}
    	}
    },
	settings: {
		"motion_sensor_sensitivity": {
			"index": 1,
			"size": 1,
			"signed": false,
		},
		"motion_off_delay": {
			"index": 2,
			"size": 2,
		},
		"basic_set_level": {
			"index": 3,
			"size": 1,
			"signed": false,
		},
		"enable_PIR_function": {
			"index": 4,
			"size": 1,
			"signed": false,
			"parser": value => new Buffer([ ( value === true ) ? 255 : 0 ])
		},
		"day_night_treshold": {
			"index": 5,
			"size": 2,
		},	
		"re-trigger_interval": {
			"index": 6,
			"size": 1,
		},		
		"illumination_polling_interval": {
			"index": 7,
			"size": 2,
		},
		"enable_illumination_trigger": {
			"index": 8,
			"size": 1,
			"parser": value => new Buffer([ ( value === true ) ? 1 : 0 ])
		},
		"illumination_report_threshold": {
			"index": 9,
			"size": 1,
			"signed": false,
		},
		"motion_blink": {
			"index": 10,
			"size": 1,
			"parser": value => new Buffer([ ( value === true ) ? 1 : 0 ])
		}
	}
});