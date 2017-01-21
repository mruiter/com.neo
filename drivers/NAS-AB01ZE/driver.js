"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: false,
	capabilities: {
		'onoff': {
			'command_class'				: 'COMMAND_CLASS_SWITCH_BINARY',
			'command_get'				: 'SWITCH_BINARY_GET',
			'command_set'				: 'SWITCH_BINARY_SET',
			'command_set_parser'		: function( value ){
				return {
					'Switch Value': value
				}
			},
			'command_report'			: 'SWITCH_BINARY_REPORT',
			'command_report_parser'		: function( report ){
				return report['Value'] === 'on/enable';
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
    			//getOnWakeUp: true,
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
				"alarmvolume": {
					"index": 1,
					"size": 1,
					},
				"alarmsoundtime": {
					"index": 2,
					"size": 1,
					},
				"doorbellsoundtime": {
					"index": 3,
					"size": 1,
					},
				"doorbellvolume": {
					"index": 4,
					"size": 1,
					},
				"alarmtune": {
					"index": 5,
					"size": 1,
					},
				"doorbelltune": {
					"index": 6,
					"size": 1,
					},
				"alarmordoorbell": {
					"index": 7,
					"size": 1,
					},
                "alarmled": {
					"index": 8,
					"size": 1,
					},
				"doorbellled": {
					"index": 9,
					"size": 1,
					}
                }
})

Homey.manager('flow').on('action.sound_alarm', function( callback, args ){
	Homey.log('');
	Homey.log('on flow action.action.sound_alarm');
	Homey.log('args', args);
	Homey.manager('drivers').getDriver('NAS-AB01ZE').capabilities.onoff.set(args.device, true, function (err, data) {
		Homey.log('');
		Homey.log('Homey.manager(drivers).getDriver(NAS-AB01ZE).capabilities.onoff.set');
		Homey.log('err', err);
		Homey.log('data', data);
		if (err) callback (err, false);
	});
	callback( null, true );
});

Homey.manager('flow').on('action.silence_alarm', function( callback, args ){
	Homey.log('');
	Homey.log('on flow action.action.silence_alarm');
	Homey.log('args', args);
	Homey.manager('drivers').getDriver('NAS-AB01ZE').capabilities.onoff.set(args.device, false, function (err, data) {
		Homey.log('');
		Homey.log('Homey.manager(drivers).getDriver(NAS-AB01ZE).capabilities.onoff.set');
		Homey.log('err', err);
		Homey.log('data', data);
		if (err) callback (err, false);
	});
	callback( null, true );
});

module.exports.on('initNode', token => {
    const node = module.exports.nodes[token];
    if (node) {
        if (node.instance.CommandClass.COMMAND_CLASS_WAKE_UP) {
            node.instance.CommandClass.COMMAND_CLASS_WAKE_UP.on('report', (command, report) => {
                if (command.name === 'WAKE_UP_NOTIFICATION') {
                    // Retrieve 'Battery Level' upon wake-up; temp replacement of getOnWakeUp function (triggering on online event instead of Wake-up)
                    	node.instance.CommandClass['COMMAND_CLASS_BATTERY'].BATTERY_GET({});
                    // Option to retrieve the WAKE_UP_INTERVAL upon wake-up; for debugging only
                    	//node.instance.CommandClass['COMMAND_CLASS_WAKE_UP'].WAKE_UP_INTERVAL_GET({});
                    // Option to retrieve configuration of a certain parameter upon wake-up; for debugging only
                    	//node.instance.CommandClass['COMMAND_CLASS_CONFIGURATION'].CONFIGURATION_GET( {'Parameter Number': new Buffer([10])}, null );
                }
            });
        }
    }
});
