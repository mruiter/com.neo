'use strict';

const events = require('events');
const fs = require('fs');
const async = require('async');

const nodeEvents = ['online', 'applicationUpdate'];

const SAVED_STATE_TIMEOUT = 30 * 60 * 1000; // 30 min. Duration window within stored capability values are considered valid

/**
 * Generic driver for Z-Wave devices.
 */
class ZwaveDriver extends events.EventEmitter {

	/**
	 * Create new ZwaveDriver, provide
	 * driver id, and options object.
	 * @param driverId
	 * @param options
	 */
	constructor(driverId, options) {
		super();

		// Get driver specification as defined in app.json
		this.driverId = driverId;
		this.driver = findWhere(Homey.manifest.drivers, { id: driverId });
		// set debug to true when debug is found in driver directory
		if (fs.existsSync('/drivers/' + driverId + '/debug')) {
			options.debug = true;
		}

		// Override default options with provided options object
		this.options = Object.assign({
			debug: false,
			beforeInit: false,
			capabilities: {},
		}, options);

		this.nodes = {};

		// Exports default driver functions
		this.init = this.init.bind(this);
		this.added = this.added.bind(this);
		this.deleted = this.deleted.bind(this);
		this.settings = this.settings.bind(this);

		this.capabilities = {};
		this.pollIntervals = {};

		// register unload cb
		if (Homey && Homey.on) {
			Homey.on('unload', this._onUnload.bind(this));
		}

		// bind set and get functions

		// Loop over all capabilities specified in app.json
		this.driver.capabilities.forEach(capabilityId => {
			if (typeof this.options.capabilities[capabilityId] === 'undefined') {
				throw new Error(`missing_options_capability: ${capabilityId}`);
			}

			// Create capability object
			this.capabilities[capabilityId] = {};

			// Define get function for capability
			this.capabilities[capabilityId].get = (deviceData, callback) => {
				this._debug('get', capabilityId);

				// Get node from stored nodes array
				const node = this.getNode(deviceData);
				if (node instanceof Error) return callback(node);

				// Get value from node state object
				let value = node.state[capabilityId];
				if (value instanceof Error) return callback(value);
				if (typeof value === 'undefined') value = null;
				return callback(null, value);
			};

			// Define set function for capability
			this.capabilities[capabilityId].set = (deviceData, value, callback) => {
				this._debug('set', capabilityId, value);

				// Get capability spec from driver.js and check if it is provided
				let optionsCapability = this.options.capabilities[capabilityId];
				if (typeof optionsCapability === 'undefined') {
					return callback(new Error(`missing_options_capability: ${capabilityId}`));
				}

				// Force into array
				if (!Array.isArray(optionsCapability)) optionsCapability = [optionsCapability];

				// Get node from stored nodes array
				const node = this.getNode(deviceData);
				if (node instanceof Error) return callback(node);

				// Loop over nested capability definition
				optionsCapability.forEach(optionsCapabilityItem => {
					let instance = undefined;

					// Check if it is defined as a multi channel node
					if (typeof optionsCapabilityItem.multiChannelNodeId === 'number') {

						// Get multi channel node instance
						instance = node.instance.MultiChannelNodes[optionsCapabilityItem.multiChannelNodeId];
						if (typeof node === 'undefined') return callback(new Error('invalid_multiChannelNodeId'));
					} else {
						// Get regular node instance
						instance = node.instance;
					}

					// Abort if no command set parser is provided
					if (typeof optionsCapabilityItem.command_set_parser !== 'function') return;

					// Use the command set parser to parse the value into the correct format
					const args = optionsCapabilityItem.command_set_parser(value, node);

					this._debug(optionsCapabilityItem.multiChannelNodeId || '', `${optionsCapabilityItem.command_class}
					->${optionsCapabilityItem.command_set}`, 'args:', args);

					// Perform the command set on the node
					instance.CommandClass[optionsCapabilityItem.command_class][optionsCapabilityItem.command_set](args,
						(err, result) => {
							if (err) {
								this._debug(err);
								return callback(err);
							}

							// Update value in state object
							node.state[capabilityId] = value;

							// Emit realtime event
							this.realtime(deviceData, capabilityId, value);

							return callback(null, node.state[capabilityId]);
						});
				});
			};
		});
	}

	/**
	 * Method that will be called on driver
	 * initialisation.
	 * @param devicesData
	 * @param callback
	 * @returns {*}
	 */
	init(devicesData, callback) {
		if (devicesData.length < 1) return callback(null, true);

		// Init nodes synchronously to prevent z-wave network overload
		async.each(devicesData, (deviceData, next) => {
			this.initNode(deviceData, err => {
				next(err);
			});
		}, err => {
			return callback(err, true);
		});
	}

	/**
	 * Method that will be called when a user
	 * adds a device/node.
	 * @param deviceData
	 * @param callback
	 * @returns {*}
	 */
	added(deviceData, callback) {
		callback = callback || function () {
			};

		this.initNode(deviceData);
		return callback(null, true);
	}

	/**
	 * Method that will be called when a user
	 * deletes a device/node.
	 * @param deviceData
	 * @param callback
	 */
	deleted(deviceData, callback) {
		callback = callback || function () {
			};

		this.deleteNode(deviceData);
		return callback(null, true);
	}

	/**
	 * Method that will be called when a user
	 * edits the device settings of a node.
	 * @param deviceData
	 * @param newSettingsObj
	 * @param oldSettingsObj
	 * @param changedKeysArr
	 * @param callback
	 * @returns {*}
	 */
	settings(deviceData, newSettingsObj, oldSettingsObj, changedKeysArr, callback) {
		this._debug('settings()', 'newSettingsObj', newSettingsObj, 'oldSettingsObj', oldSettingsObj,
			'changedKeysArr', changedKeysArr);

		// Get node from stored nodes array
		const node = this.getNode(deviceData);
		if (node instanceof Error) return callback(node);

		// Loop over all changed values
		changedKeysArr.forEach((changedKey) => {

			// Store changed setting in node object
			node.settings[changedKey] = newSettingsObj[changedKey];

			if (changedKey === 'poll_interval') {

				// Loop over all setPollIntervals and call them with the newly saved value
				Object.keys(this.nodes[deviceData.token].setPollIntervals).forEach(capabilityId => {
					this.nodes[deviceData.token].setPollIntervals[capabilityId](newSettingsObj[changedKey] * 1000);
				});
			} else {

				// Get settings object from driver.js
				const settingsObj = this.options.settings[changedKey];
				if (typeof settingsObj === 'undefined') throw new Error(`missing_settings_key: ${changedKey}`);

				let newValue = undefined;

				// If settings object is a function return value in the driver
				if (typeof settingsObj === 'function') {

					settingsObj(newSettingsObj[changedKey], oldSettingsObj[changedKey], deviceData);

					// Magically try to convert the value to a buffer
				} else {
					if (typeof settingsObj.parser === 'function') {

						// Use the parser defined in driver.js and feed it the newly saved setting
						newValue = settingsObj.parser(newSettingsObj[changedKey], newSettingsObj, deviceData);

						// Check if valid buffer is provided
						if (!Buffer.isBuffer(newValue)) throw new Error(`invalid_setting_value_type_for_${changedKey}`);

					} else if (typeof newSettingsObj[changedKey] === 'number'
						|| parseInt(newSettingsObj[changedKey], 10).toString() === newSettingsObj[changedKey]) {

						// Try to write new value  to a buffer
						if (settingsObj.signed === false) {

							try {
								newValue = new Buffer(settingsObj.size);
								newValue.writeUIntBE(newSettingsObj[changedKey], 0, settingsObj.size);
							} catch (e) {
								return this._debug(e);
							}

						} else {

							try {
								newValue = new Buffer(settingsObj.size);
								newValue.writeIntBE(newSettingsObj[changedKey], 0, settingsObj.size);
							} catch (e) {
								return this._debug(e);
							}

						}
					} else if (typeof newSettingsObj[changedKey] === 'boolean') {
						newValue = new Buffer([(newSettingsObj[changedKey] === true) ? 1 : 0]);
					}

					if (Buffer.isBuffer(newValue)) {
						this._debug('CONFIGURATION_SET', 'index:', settingsObj.index, 'size:', settingsObj.size,
							'newValue', newValue);

						// Call configuration set on node with new value
						node.instance.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_SET({
							'Parameter Number': settingsObj.index,
							Level: {
								Size: settingsObj.size,
								Default: false,
							},
							'Configuration Value': newValue,
						}, (err, result) => {
							if (err) return this._debug('CONFIGURATION_SET', err);
						});
					} else {
						this._debug('invalid new value for setting', changedKey);
					}
				}
			}
		});

		// Provide user with proper feedback after clicking save
		if (node.instance.battery === true && node.instance.online === false) {
			callback(null, {
				en: 'Settings will be saved during the next wakeup of this battery device.',
				nl: 'Instelling zullen worden opgeslagen bij volgende wakeup van dit apparaat'
			});
		} else {
			return callback(null, true);
		}
	}

	/**
	 * Initializes a device/node, asks z-wave chip
	 * to find a node, and if found to provide
	 * the necessary information to (re-) initialize
	 * it.
	 * @param deviceData
	 * @param callback
	 */
	initNode(deviceData, callback) {
		callback = callback || function () {
			};

		if (!(deviceData && deviceData.token)) return new Error('invalid_device_data');

		// Find z-wave node on network
		Homey.wireless('zwave').getNode(deviceData, (err, zwaveNode) => {
			if (err) {
				this.setUnavailable(deviceData, err);
				return callback(err);
			}

			this.setAvailable(deviceData);

			// Create new object in nodes array
			this.nodes[deviceData.token] = {
				instance: zwaveNode,
				device_data: deviceData,
				randomId: Math.random().toString(),
				state: {},
				settings: {},
				pollIntervals: {},
				setPollIntervals: {},
			};

			// get older state
			let state = Homey.manager('settings').get(`zwavedriver_${this.driverId}_${deviceData.token}_state`)
			if (state) {
				let when = new Date(state.when);
				if (((new Date) - when) < SAVED_STATE_TIMEOUT) {
					this._debug(deviceData.token, 'Found saved state', state);
					this.nodes[deviceData.token].state = state.state;
				}

				Homey.manager('settings').unset(`zwavedriver_${this.driverId}_${deviceData.token}_state`);

			}

			nodeEvents.forEach((nodeEvent) => {
				zwaveNode.on(nodeEvent, function () {
					const args = Array.prototype.slice.call(arguments);
					args.unshift(deviceData);
					args.unshift(nodeEvent);
					this.emit.apply(this, args);
				}.bind(this))
			});

			// Register eventListeners if debug
			if (this.options.debug === true) {

				this._debug('------------------------------------------');

				// log the entire Node
				this._debug('Node:', zwaveNode.token);
				this._debug('- Battery:', zwaveNode.battery);

				Object.keys(zwaveNode.CommandClass).forEach(commandClassId => {
					this._debug('- CommandClass:', commandClassId);
					this._debug('-- Version:', zwaveNode.CommandClass[commandClassId].version);
					this._debug('-- Commands:');

					Object.keys(zwaveNode.CommandClass[commandClassId]).forEach(key => {
						if (typeof zwaveNode.CommandClass[commandClassId][key] === 'function' && key === key.toUpperCase()) {
							this._debug('---', key);
						}
					});
				});

				if (zwaveNode.MultiChannelNodes) {
					Object.keys(zwaveNode.MultiChannelNodes).forEach(multiChannelNodeId => {
						this._debug('- MultiChannelNode:', multiChannelNodeId);

						Object.keys(zwaveNode.MultiChannelNodes[multiChannelNodeId].CommandClass).forEach(commandClassId => {
							this._debug('-- CommandClass:', commandClassId);
							this._debug('--- Version:',
								zwaveNode.MultiChannelNodes[multiChannelNodeId].CommandClass[commandClassId].version);
							this._debug('--- Commands:');

							Object
								.keys(zwaveNode.MultiChannelNodes[multiChannelNodeId].CommandClass[commandClassId])
								.forEach(key => {
									if (typeof zwaveNode.MultiChannelNodes[multiChannelNodeId].CommandClass[commandClassId][key]
										=== 'function' && key === key.toUpperCase()) {
										this._debug('----', key);
									}
								});
						});
					});
				}

				this._debug('------------------------------------------');
				this._debug('');

				// attach event listeners
				nodeEvents.forEach((nodeEvent) => {
					zwaveNode.on(nodeEvent, function () {
						this._debug(`node.on('${nodeEvent}')`, 'arguments:', arguments);
					}.bind(this));
				});

				Object.keys(zwaveNode.CommandClass).forEach(commandClassId => {
					zwaveNode.CommandClass[commandClassId].on('report', function () {
						this._debug(`node.CommandClass['${commandClassId}'].on('report')`, 'arguments:', arguments);
					}.bind(this));
				});

				if (zwaveNode.MultiChannelNodes) {
					Object.keys(zwaveNode.MultiChannelNodes).forEach(multiChannelNodeId => {
						Object.keys(zwaveNode.MultiChannelNodes[multiChannelNodeId].CommandClass).forEach(commandClassId => {
							zwaveNode.MultiChannelNodes[multiChannelNodeId].CommandClass[commandClassId].on('report', function () {
								this._debug(`node.MultiChannelNodes['${multiChannelNodeId}'].
								CommandClass['${commandClassId}'].on('report')`, 'arguments:', arguments);
							}.bind(this));
						});
					});
				}
			}

			// Check if configuration command class is present
			if (zwaveNode.CommandClass.COMMAND_CLASS_CONFIGURATION) {

				// Bind listener on configuration reports
				zwaveNode.CommandClass.COMMAND_CLASS_CONFIGURATION.on('report', (command, report) => {

					if (!Array.isArray(this.driver.settings)) return false;

					// Loop over settings in driver
					this.driver.settings.forEach(settingsId => {
						if (typeof this.options.settings[settingsId.id] !== 'undefined') {

							// Check for matching setting parameters
							if (typeof this.options.settings[settingsId.id].index !== 'undefined'
								&& this.options.settings[settingsId.id].index === report['Parameter Number']) {
								const newSetting = {};

								// Try to parse the data
								try {
									newSetting[settingsId.id] = JSON.parse(JSON.stringify(report['Configuration Value'])).data[0];
								} catch (err) {
									console.error(err);
								}

								this._debug('Option found:', settingsId.id, 'Parameter id:', report['Parameter Number'],
									'Value:', newSetting[settingsId.id]);

								// Update settings
								this.setSettings(deviceData, newSetting, (err, settings) => {
									if (err) return console.error(err);
								});
							}
						}
					});
				});
			}

			// Register capabilities
			this.driver.capabilities.forEach(capabilityId => {

				// Get capability from options object (driver.js)
				let optionsCapability = this.options.capabilities[capabilityId];
				if (typeof optionsCapability === 'undefined') throw new Error(`missing_options_capability: ${capabilityId}`);

				// Force into array
				if (!Array.isArray(optionsCapability)) optionsCapability = [optionsCapability];

				// Get node from stored nodes array
				let node = this.getNode(deviceData);
				if (node instanceof Error) throw node;

				// Loop over potentially nested capability options object
				optionsCapability.forEach((optionsCapabilityItem) => {
					let instance = undefined;

					// Check if it is defined as a multi channel node
					if (typeof optionsCapabilityItem.multiChannelNodeId === 'number') {

						// Get multi channel node instance
						instance = node.instance.MultiChannelNodes[optionsCapabilityItem.multiChannelNodeId];
						if (typeof instance === 'undefined') return callback(new Error('invalid_multiChannelNodeId'));
					} else {
						// Get regular node instance
						instance = node.instance;
					}

					// Check if capability specified in driver.js is also supported by node
					if (typeof optionsCapabilityItem.multiChannelNodeId === 'number') {
						if (typeof instance.CommandClass[optionsCapabilityItem.command_class] === 'undefined') {

							// If capability was not defined as optional abort
							if (!optionsCapabilityItem.optional) {
								return this.setUnavailable(deviceData, `invalid_commandClass_${optionsCapabilityItem.command_class}
							_for_multiChannelNodeId_${optionsCapabilityItem.multiChannelNodeId}`);
							} else {

								// Capability was defined as optional and is therefore ignored
								return this._debug(`optional_commandClass_${optionsCapabilityItem.command_class} is currently not supported by node`);
							}
						}
					} else {
						if (typeof instance.CommandClass[optionsCapabilityItem.command_class] === 'undefined') {

							// If capability was not defined as optional abort
							if (!optionsCapabilityItem.optional) {
								return this.setUnavailable(deviceData, `invalid_commandClass_${optionsCapabilityItem.command_class}`);
							} else {

								// Capability was defined as optional and is therefore ignored
								return this._debug(`optional_commandClass_${optionsCapabilityItem.command_class} is currently not supported by node`);
							}
						}
					}

					// Check if command class exists on node, necessary because of variable command classes
					if (instance.CommandClass[optionsCapabilityItem.command_class]) {

						// Bind listener on report event
						instance.CommandClass[optionsCapabilityItem.command_class].on('report', (command, report) => {

							// Check if capability is listening for this report
							if (command.name === optionsCapabilityItem.command_report) {

								// Parse value
								const value = optionsCapabilityItem.command_report_parser(report, node);

								// Abort
								if (value === null) return;

								// Update value in node state object
								this.nodes[deviceData.token].state[capabilityId] = value;

								if (value instanceof Error) return value;

								// Emit realtime event
								this.realtime(deviceData, capabilityId, value);
							}
						});
					}

					// If command get is specified and cc is supported by node, perform it
					if (optionsCapabilityItem.command_get && instance.CommandClass[optionsCapabilityItem.command_class]) {

						function get() {

							let args = {};

							// Use parser if provided
							if (optionsCapabilityItem.command_get_parser) {
								args = optionsCapabilityItem.command_get_parser();
							}

							// Check if node supports this command class
							if (!instance.CommandClass[optionsCapabilityItem.command_class]) {
								return console.error(`invalid_commandClass_${optionsCapabilityItem.command_class}`);
							}

							// Check if node supports command get for this command class
							if (!instance.CommandClass[optionsCapabilityItem.command_class][optionsCapabilityItem.command_get]) {
								return console.error(`invalid_commandClass_${optionsCapabilityItem.command_class}
								_command_${optionsCapabilityItem.command_get}`);
							}

							let cb = false;

							// Check if callback is not disabled
							if (optionsCapabilityItem.command_get_cb !== false) {
								cb = (err, result) => {
									this._debug(optionsCapabilityItem.multiChannelNodeId || '', optionsCapabilityItem.command_class,
										optionsCapabilityItem.command_get, 'args:', args, 'err:', err, 'result:', result);

									if (err) return; // this.setUnavailable( device_data, err.message || err.toString() );

									if (typeof optionsCapabilityItem.command_report_parser !== 'function') return;

									// Parse value using command report parser
									const value = optionsCapabilityItem.command_report_parser(result, node);
									if (value instanceof Error) return value;
									if (value === null) return;

									// Check if new value is different from old value
									const oldValue = this.nodes[deviceData.token].state[capabilityId];
									if (oldValue !== value) {
										this.nodes[deviceData.token].state[capabilityId] = value;
										this.realtime(deviceData, capabilityId, value);
									}
								};
							}

							this._debug(optionsCapabilityItem.multiChannelNodeId || '', `${optionsCapabilityItem.command_class}->${optionsCapabilityItem.command_get}`, 'args:', args, 'cb:', cb !== false);

							// Call command get on node instance (with or without cb)
							instance.CommandClass[optionsCapabilityItem.command_class][optionsCapabilityItem.command_get](args, cb);
						}

						// Define a setPollIntervals function for this capability
						this.nodes[deviceData.token].setPollIntervals[capabilityId] = pollInterval => {

							// If it is already set, clear it first
							if (this.nodes[deviceData.token].pollIntervals[capabilityId]) {
								clearInterval(this.nodes[deviceData.token].pollIntervals[capabilityId]);
							}

							// Do not poll if value is set to zero
							if (pollInterval === 0) return;

							// Create a new (poll) interval
							this.nodes[deviceData.token].pollIntervals[capabilityId] = setInterval(() => {
								this._debug('polling:', capabilityId);
								get.call(this);
							}, pollInterval);
						};

						// Call the get defined above
						get.call(this);

						// If getOnWakeUp is set in driver.js
						if (optionsCapabilityItem.getOnWakeUp) {
							zwaveNode.on('online', online => {
								if (online) get.call(this);
							});
						}

						// If pollInterval is set in driver.js
						if (optionsCapabilityItem.pollInterval) {

							// And it is a number
							if (typeof optionsCapabilityItem.pollInterval === 'number') {

								// Initiate poll interval
								this.nodes[deviceData.token].setPollIntervals[capabilityId].call(this,
									optionsCapabilityItem.pollInterval);

							} else if (optionsCapabilityItem.pollInterval === 'poll_interval') {

								// Get poll interval value from settings
								this.getSettings(deviceData, (err, settings) => {
									if (err) return console.error(err);

									// Initiate poll interval
									if (typeof settings[optionsCapabilityItem.pollInterval] === 'number') {
										this.nodes[deviceData.token].setPollIntervals[capabilityId].call(this,
											settings[optionsCapabilityItem.pollInterval] * 1000);
									}
								});
							} else {
								this._debug('invalid pollInterval type, expected number or string');
							}
						}
					}
				});
			});

			// Store settings in node object
			this.getSettings(deviceData, (err, settings) => {
				if (err) return console.error(err);
				if (settings) {
					for( let i in settings) {
						this.nodes[deviceData.token].settings[i] = settings[i];
					}
				}
			});

			// Check if beforeInit is specified and a function
			if (this.options.hasOwnProperty('beforeInit') && typeof this.options.beforeInit === 'function') {
				this.options.beforeInit(deviceData.token, () => {

					// Emit initialisation of node is done
					this.emit('initNode', deviceData.token);

					return callback(null, zwaveNode);
				});
			} else {

				// Emit initialisation of node is done
				this.emit('initNode', deviceData.token);

				return callback(null, zwaveNode);
			}
		});
	}

	/**
	 * Method called when a user
	 * deletes a device/node from Homey.
	 * @param deviceData
	 * @returns {Error}
	 */
	deleteNode(deviceData) {
		if (!(deviceData && deviceData.token)) return new Error('invalid_device_data');

		const node = this.getNode(deviceData);
		if (node instanceof Error) return node;

		// Remove all listeners on reports
		Object.keys(this.nodes[deviceData.token].instance.CommandClass).forEach(commandClassId => {
			this.nodes[deviceData.token].instance.CommandClass[commandClassId].removeAllListeners('report');
		});

		// Remove all report listeners of (child) multichannel nodes as well
		if (this.nodes[deviceData.token].instance.MultiChannelNodes && Object.keys(this.nodes[deviceData.token].instance.MultiChannelNodes).length > 0) {
			Object.keys(this.nodes[deviceData.token].instance.MultiChannelNodes).forEach(multiChannelNodeId => {
				Object.keys(this.nodes[deviceData.token].instance.MultiChannelNodes[multiChannelNodeId].CommandClass).forEach(commandClassId => {
					this.nodes[deviceData.token].instance.MultiChannelNodes[multiChannelNodeId].CommandClass[commandClassId].removeAllListeners('report');
				});
			});
		}

		// Emit that devices has been deleted
		this.emit('deleteNode', deviceData.token);

		// Remove it from the nodes list
		delete this.nodes[deviceData.token];
	}

	/**
	 * Returns node from internal nodes list.
	 * @param deviceData
	 * @returns {*}
	 */
	getNode(deviceData) {

		if (!(deviceData && deviceData.token)) return new Error('invalid_device_data');

		return this.nodes[deviceData.token] || new Error('invalid_node');
	}

	/**
	 * Debug method that will enable logging when
	 * debug: true is provided in the main options
	 * object.
	 * @private
	 */
	_debug() {
		if (this.options.debug) {
			const args = Array.prototype.slice.call(arguments);
			args.unshift('[debug]');
			console.log.apply(null, args);
		}
	}

	/**
	 * Fired when the app unloads
	 * to save all battery data
	 * @private
	 */
	_onUnload() {

		for (let nodeId in this.nodes) {
			let node = this.nodes[nodeId];
			if (node.instance.battery !== true) continue;

			Homey.manager('settings').set(`zwavedriver_${this.driverId}_${nodeId}_state`, {
				state: node.state,
				when: new Date()
			});

		}

	}
}

/**
 * Plain js implementation of underscore's findWhere.
 * @param array
 * @param criteria
 * @returns {*}
 */
function findWhere(array, criteria) {
	return array.find(item => Object.keys(criteria).every(key => item[key] === criteria[key]));
}

module.exports = ZwaveDriver;
