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
                "alarmled": {
                "index": 8,
                "size": 1,
                "parser": function( input ) {
                return new Buffer([ parseInt(input) ]);
                  }
                },
	          }
});

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
})