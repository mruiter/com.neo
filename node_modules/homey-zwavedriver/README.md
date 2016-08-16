# ZwaveDriver
Generic class to map Z-Wave CommandClasses to Homey capabilities, for faster Z-Wave App development.

## Installation

```
cd /path/to/com.your.homeyapp/
npm install --save https://github.com/athombv/node-homey-zwavedriver
```

## Example

File: `/drivers/mydriver/driver.js`

```javascript
"use strict";

const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver('mydriver', {
	debug: false, // set to true to view all incoming events
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
	settings: {
		"always_on": {
			"index": 1,
			"size": 1,
			"parser": function( input ) {
				return new Buffer([ ( input === true ) ? 0 : 1 ]);
			}
		},
		"led_ring_color_on": {
			"index": 61,
			"size": 1,
			"parser": function( input ) {
				return new Buffer([ parseInt(input) ]);
			}
		},
		"led_ring_color_off": {
			"index": 62,
			"size": 1,
			"parser": function( input ) {
				return new Buffer([ parseInt(input) ]);
			}
		}
	}
});
```