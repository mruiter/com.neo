# ZwaveDriver
Generic class to map Z-Wave CommandClasses to Homey capabilities, for faster Z-Wave App development.

## Z-Wave docs

Please also read the Homey Z-Wave docs here: [https://developers.athom.com/library/zwave/](https://developers.athom.com/library/zwave/)

## Installation

```
cd /path/to/com.your.homeyapp/
git submodule add https://github.com/athombv/node-homey-zwavedriver.git node_modules/homey-zwavedriver
cd node_modules/homey-zwavedriver
npm install
```

## Example

File: `/drivers/mydriver/driver.js`

```javascript
'use strict';

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
			},
			'getOnWakeUp': true, // if set to true and device is battery powered this capability will perform a GET everytime the device wakes up
		},
		'measure_power': {
			'command_class'				: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			'command_get'				: 'SENSOR_MULTILEVEL_GET',
			'command_report'			: 'SENSOR_MULTILEVEL_REPORT',
			'command_report_parser'		: function( report ){
				return report['Sensor Value (Parsed)'];
			},
			'pollInterval': "poll_interval", // The amount of seconds between asking the device for a status update (poll_interval should be defined in app.json settings)
			'optional': true // if device variably advertises a command class (e.g. cc battery when dc-powered) set this variable to true to prevent crashes
		}
	},
	beforeInit: (token, callback) => {
	    // this method is called right before the initialization of a device (before it gets marked as available)
	},
	settings: {
		'always_on': {
			'index': 1,
			'size': 1
		},
		'led_ring_color_on': {
			'index': 61,
			'size': 1,
			
			// define a custom parser method (optional)
			'parser': function( newValue, newSettings, deviceData ) {
				return new Buffer([ parseInt(newValue) ]);
			}
		},
		'led_ring_color_off': {
			'index': 62,
			'size': 1
		},
		'sensitivity': {
			'index': 63,
			'size': 1,
			
			// set signed to false to let (0, 255) scale to (0x00, 0xFF)
			// otherwise the domain is (-128, 127) for size=1
			'signed': false
		},
		'custom_setting': function( newValue, oldValue, deviceData ) {

			// For using a custom setting in the driver
		}
	}
});
```
