"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

// http://www.szneo.com/en/products/show.php?id=189  / http://products.z-wavealliance.org/products/1670 / http://www.pepper1.net/zwavedb/device/897/897-0258-0003-0087-03-04-05-03-46.xml

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
			'command_class'				: 'COMMAND_CLASS_METER',
			'command_get'					: 'METER_GET',
			'command_get_cb'			: true,
			'command_get_parser'	: function(power) {
				return {
					'Properties1': {
						'Scale': 0
					}
				}
			},
			'command_report'				: 'METER_REPORT',
			'command_report_parser'	: function(report) {
				return report['Meter Value (Parsed)'];
			},
			
		}
	},
	    settings: {
                "meter_report": {
                "index": 1,
                "size": 1,
                "parser": function( input ) {
                return new Buffer([ parseInt(input) ]);
                  }
                },
				"meter_report_interval": {
                "index": 2,
                "size": 2,
                "parser": function( input ) {
                return new Buffer([ parseInt(input) ]);
                  }
                },
                "led_display": {
                "index": 5,
                "size": 1,
                "parser": function( input ) {
                return new Buffer([ parseInt(input) ]);
                  }
                },
				"remember_state": {
                "index": 7,
                "size": 1,
                "parser": function( input ) {
                return new Buffer([ parseInt(input) ]);
                  }
                }
              }
})