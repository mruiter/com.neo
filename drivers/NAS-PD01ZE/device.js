'use strict';

const Homey = require('homey');
const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class MultiSensor_PD01Z extends LoggingZwaveDevice {
  async addCapabilityIfNotExists(capabilityId) {
    if (!this.hasCapability(capabilityId)) {
      await this.addCapability(capabilityId);
      this.log('Added capability', capabilityId);
    } else {
      this.log('Capability already exists', capabilityId);
    }
  }

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // always available capability
    this.registerCapability('measure_battery', 'BATTERY');

    const commandClasses = this.node.CommandClass || {};
    this.log('Node command classes', Object.keys(commandClasses));

    // motion alarm capability
    if (
      commandClasses.COMMAND_CLASS_NOTIFICATION
      || commandClasses.COMMAND_CLASS_SENSOR_BINARY
    ) {
      await this.addCapabilityIfNotExists('alarm_motion');
      const cc = commandClasses.COMMAND_CLASS_NOTIFICATION
        ? 'NOTIFICATION'
        : 'SENSOR_BINARY';
      this.registerCapability('alarm_motion', cc);

      if (commandClasses.COMMAND_CLASS_NOTIFICATION) {
        await this.addCapabilityIfNotExists('alarm_tamper');
        this.registerCapability('alarm_tamper', 'NOTIFICATION');
      }
    }

    // multilevel sensor capabilities
    const multilevel = commandClasses.COMMAND_CLASS_SENSOR_MULTILEVEL;
    if (multilevel) {
      let supported = [];

      if (typeof multilevel.SUPPORTED_GET === 'function') {
        try {
          const result = await multilevel.SUPPORTED_GET();
          if (Array.isArray(result?.['Sensor Type'])) {
            supported = result['Sensor Type'];
          } else if (Array.isArray(result?.['Sensor Type Bit Mask'])) {
            supported = result['Sensor Type Bit Mask'];
          } else if (Array.isArray(result?.supportedSensorTypes)) {
            supported = result.supportedSensorTypes;
          }
        } catch (err) {
          this.error('Failed to read supported sensor types', err);
        }
      } else if (Array.isArray(multilevel.supportedSensorTypes)) {
        supported = multilevel.supportedSensorTypes;
      }

      this.log('Supported multilevel sensor types', supported);

      const hasTemperature = supported.includes('Temperature') || supported.includes(1);
      if (hasTemperature) {
        await this.addCapabilityIfNotExists('measure_temperature');
        this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
      }

      const hasLuminance = supported.includes('Luminance') || supported.includes(3);
      if (hasLuminance) {
        await this.addCapabilityIfNotExists('measure_luminance');
        this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
      }

      const hasHumidity =
        supported.includes('Relative humidity')
        || supported.includes('Humidity')
        || supported.includes(5);
      if (hasHumidity) {
        await this.addCapabilityIfNotExists('measure_humidity');
        this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL');
      }
    }

    this.log('Device capabilities after init', this.getCapabilities());
  }
}
module.exports = MultiSensor_PD01Z;
