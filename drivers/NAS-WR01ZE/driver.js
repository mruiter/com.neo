"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

// http://www.szneo.com/en/products/show.php?id=189

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: true,
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
		'measure_power': {
			'command_class'				: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			'command_get'				: 'SENSOR_MULTILEVEL_GET',
			'command_report'			: 'SENSOR_MULTILEVEL_REPORT',
			'command_report_parser'		: function( report ){
				return report['Sensor Value (Parsed)'];
			}
		}
	},
})

module.exports.on('applicationUpdate', function( device_data, buf ){
	Homey.manager('flow').triggerDevice( 'fgwpe-101_nif', null, null, device_data )
});