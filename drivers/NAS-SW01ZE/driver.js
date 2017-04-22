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
      'command_set_parser': value => ({
        'Switch Value': (value) ? 'on/enable' : 'off/disable'
      }),
      command_report: 'SWITCH_BINARY_REPORT',
      command_report_parser: report => report.Value === 'on/enable'
    },
  },
  settings: {
    backlight: {
      index: 1,
      size: 1,
    },
    status_indicate: {
      index: 2,
      size: 1,
    },
    laststate_return: {
      index: 3,
      size: 1,
    },
  },
});

Homey.manager('flow').on('action.SW01ZE_switch_LED', (callback, args) => {
  const node = module.exports.nodes[args.device.token];

  // Check provided input
  if (!args.hasOwnProperty('switch_LED_onoff')) return callback('switch_LED_onoff_property_missing');
  // Check if action is triggered on multinode
  if (args.device.hasOwnProperty('multiChannelNodeId')) return callback('switch_LED_not_on_multiChannelNode');

  if (node.instance.CommandClass.COMMAND_CLASS_CONFIGURATION) {
    node.instance.CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_SET({
      'Parameter Number': 1,
      Level: {
        Size: 1,
        Default: false,
      },
      'Configuration Value': new Buffer([args.switch_LED_onoff]),
    }, (err, result) => {
      if (err) return callback(err);

      if (result === 'TRANSMIT_COMPLETE_OK') {
        module.exports.setSettings(node.device_data, {
          switch_LED: (args.switch_LED_onoff > 0) ? true : false,
        });
        return callback(null, true);
      }
      return callback('unknown_response');
    });
  } else return callback('unknown_error');
});
