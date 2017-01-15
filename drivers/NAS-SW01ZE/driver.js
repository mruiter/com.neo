'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: true,
	capabilities: {
		'onoff': {
			'command_class': 'COMMAND_CLASS_SWITCH_BINARY',
			'command_get': 'SWITCH_BINARY_GET',
			'command_set': 'SWITCH_BINARY_SET',
			'command_set_parser': value => ({
				'Switch Value': (value > 0) ? 'on/enable' : 'off/disable'
			}),
			'command_report': 'SWITCH_BINARY_REPORT',
			'command_report_parser': report => report['Value'] === 'on/enable'
		}
	},
	settings: {
		"backlight": {
			"index": 1,
			"size": 1,
		},
		"status_indicate": {
			"index": 2,
			"size": 1,
		},
		"laststate_return": {
			"index": 3,
			"size": 1,
		}
	}
})
