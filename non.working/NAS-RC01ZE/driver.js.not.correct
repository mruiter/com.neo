'use strict';

const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');

// Documentation: http://products.z-wavealliance.org/ProductManual/File?folder=&filename=Manuals/2064/FGKF-601-EN-T-v1.0_30.11.2016.pdf

module.exports = new ZwaveDriver(path.basename(__dirname), {
	capabilities: {
		measure_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: report => {
				if (report['Battery Level'] === 'battery low warning') return 1;
				if (report.hasOwnProperty('Battery Level (Raw)')) return report['Battery Level (Raw)'][0];
				return null;
			},
		},
	},
	settings: {
		sequence_1: {
			index: 3,
			size: 2,
			parser: newValue => parseSequence(newValue),
			signed: false,
		},
		sequence_2: {
			index: 4,
			size: 2,
			parser: newValue => parseSequence(newValue),
			signed: false,
		},
		sequence_3: {
			index: 5,
			size: 2,
			parser: newValue => parseSequence(newValue),
			signed: false,
		},
		sequence_4: {
			index: 6,
			size: 2,
			parser: newValue => parseSequence(newValue),
			signed: false,
		},
		sequence_5: {
			index: 7,
			size: 2,
			parser: newValue => parseSequence(newValue),
			signed: false,
		},
		sequence_6: {
			index: 8,
			size: 2,
			parser: newValue => parseSequence(newValue),
			signed: false,
		},
		sequence_timeout: {
			index: 9,
			size: 1,
			parser: newValue => new Buffer([newValue * 10]),
		},
		group_operating_mode: {
			index: 10,
			size: 1,
		},
		value_group_square: {
			index: 11,
			size: 2,
			signed: false,
		},
		value_group_circle: {
			index: 12,
			size: 2,
			signed: false,
		},
		value_group_cross: {
			index: 13,
			size: 2,
			signed: false,
		},
		value_group_triangle: {
			index: 14,
			size: 2,
			signed: false,
		},
		value_group_minus: {
			index: 15,
			size: 2,
			signed: false,
		},
		value_group_plus: {
			index: 16,
			size: 2,
			signed: false,
		},
		square_scenes: {
			index: 21,
			size: 1,
		},
		circle_scenes: {
			index: 22,
			size: 1,
		},
		cross_scenes: {
			index: 23,
			size: 1,
		},
		triangle_scenes: {
			index: 24,
			size: 1,
		},
		minus_scenes: {
			index: 25,
			size: 1,
		},
		plus_scenes: {
			index: 26,
			size: 1,
		},
	},
	customSaveMessage: {
		en: 'To save the settings you need to wake up the KeyFob:\n1: press O and -,\n2: press the Δ until the LED is green;\n3: press + to wake up.',
		nl: 'Om de instellingen op te slaan moet je de KeyFob wakker maken:\n1: druk op O en -;\n2: druk op de Δ tot de LED groen is;\n3: druk vervolgens op + om de KeyFob wakker te maken.'
	},
});

module.exports.on('initNode', token => {
	const node = module.exports.nodes[token];

	if (node && typeof node.instance.CommandClass.COMMAND_CLASS_CENTRAL_SCENE !== 'undefined') {

		node.instance.CommandClass.COMMAND_CLASS_CENTRAL_SCENE.on('report', (command, report) => {
			if (command.name === 'CENTRAL_SCENE_NOTIFICATION') {

				if (report &&
					report.hasOwnProperty('Scene Number') &&
					report.hasOwnProperty('Properties1') &&
					report.Properties1.hasOwnProperty('Key Attributes')) {

					if (report['Scene Number'] <= 6) {
						Homey.manager('flow').triggerDevice('FGKF-601-scene', null, {
							button: report['Scene Number'].toString(),
							scene: report.Properties1['Key Attributes'],
						}, node.device_data);
					} else {
						Homey.manager('flow').triggerDevice('FGKF-601-sequence', null, {
							sequence: report['Scene Number'].toString(),
						}, node.device_data);
					}
				}
			}
		});
	}
});

Homey.manager('flow').on('trigger.FGKF-601-scene', (callback, args, state) => {
	if (state &&
		state.hasOwnProperty('button') &&
		state.hasOwnProperty('scene') &&
		args.hasOwnProperty('button') &&
		args.hasOwnProperty('scene') &&
		state.button === args.button &&
		state.scene === args.scene) {
		return callback(null, true);
	}
	return callback(null, false);
});

Homey.manager('flow').on('trigger.FGKF-601-sequence', (callback, args, state) => {
	if (state &&
		state.hasOwnProperty('sequence') &&
		args.hasOwnProperty('sequence') &&
		state.sequence === args.sequence) {
		return callback(null, true);
	}
	return callback(null, false);
});

function parseSequence(sequence) {
	// if gesture is disabled return 0 as value
	if (sequence === 0) return new Buffer([0, 0]);

	// split sequence into individual buttons
	const buttons = sequence.split(';').map(Number);

	// Parse the buttons to their corresponding value
	let parsing = buttons[0] + 8 * buttons[1];
	if (buttons[2]) parsing += 64 * buttons[2];
	if (buttons[3]) parsing += 512 * buttons[3];
	if (buttons[4]) parsing += 4096 * buttons[4];

	// return parsed buffer value
	const parsedSequence = new Buffer(2);
	parsedSequence.writeUIntBE(parsing, 0, 2);
	return parsedSequence;
}
