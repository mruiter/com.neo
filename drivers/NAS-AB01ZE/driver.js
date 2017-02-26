'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

module.exports = new ZwaveDriver(path.basename(__dirname), {
	debug: false,
	capabilities: {
		onoff: {
			command_class: 'COMMAND_CLASS_SWITCH_BINARY',
			command_get: 'SWITCH_BINARY_GET',
			command_set: 'SWITCH_BINARY_SET',
			command_set_parser: (value) => ({
				'Switch Value': value,
			}),
			command_report: 'SWITCH_BINARY_REPORT',
			command_report_parser: report => report.Value === 'on/enable',
		},
		measure_battery: {
			getOnWakeUp: true,
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: (report, node) => {
				if (report['Battery Level'] === 'battery low warning') {
					if (node && (!node.state.hasOwnProperty('alarm_battery') || node.state.alarm_battery !== true)) {
						node.state.alarm_battery = true;
						module.exports.realtime(node.device_data, 'alarm_battery', true);
					}
					return 1;
				}
				if (report.hasOwnProperty('Battery Level (Raw)')) {
					if (node && (!node.state.hasOwnProperty('alarm_battery') || node.state.alarm_battery !== false)) {
						node.state.alarm_battery = false;
						module.exports.realtime(node.device_data, 'alarm_battery', false);
					}
					return report['Battery Level (Raw)'][0];
				}
				return null;
			},
		},
		alarm_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
		},
	},
	settings: {
		alarmvolume: {
			index: 1,
			size: 1,
		},
		alarmsoundtime: {
			index: 2,
			size: 1,
		},
		doorbellsoundtime: {
			index: 3,
			size: 1,
		},
		doorbellvolume: {
			index: 4,
			size: 1,
		},
		alarmtune: {
			index: 5,
			size: 1,
		},
		doorbelltune: {
			index: 6,
			size: 1,
		},
		alarmordoorbell: {
			index: 7,
			size: 1,
		},
		alarmled: {
			index: 8,
			size: 1,
		},
		doorbellled: {
			index: 9,
			size: 1,
		},
	},
});

Homey.manager('flow').on('action.sound_alarm', (callback, args) => {
	Homey.log('');
	Homey.log('on flow action.action.sound_alarm');
	Homey.log('args', args);
	Homey.manager('drivers').getDriver('NAS-AB01ZE').capabilities.onoff.set(args.device, true, (err, data) => {
		Homey.log('');
		Homey.log('Homey.manager(drivers).getDriver(NAS-AB01ZE).capabilities.onoff.set');
		Homey.log('err', err);
		Homey.log('data', data);
		if (err) return callback(err, false);
	});
	return callback(null, true);
});

Homey.manager('flow').on('action.silence_alarm', (callback, args) => {
	Homey.log('');
	Homey.log('on flow action.action.silence_alarm');
	Homey.log('args', args);
	Homey.manager('drivers').getDriver('NAS-AB01ZE').capabilities.onoff.set(args.device, false, (err, data) => {
		Homey.log('');
		Homey.log('Homey.manager(drivers).getDriver(NAS-AB01ZE).capabilities.onoff.set');
		Homey.log('err', err);
		Homey.log('data', data);
		if (err) return callback(err, false);
	});
	return callback(null, true);
});
