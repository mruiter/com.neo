'use strict';

const Homey = require('homey');
const LoggingZwaveDevice = require('../../lib/LoggingZwaveDevice');

class Siren_AB01Z extends LoggingZwaveDevice {

  async onNodeInit() {
    // enable debugging
    // this.enableDebug();

    // print the node's info to the console
    // this.printNode();

    // register capabilities for this device
    this.registerCapability('onoff', 'SWITCH_BINARY');
    this.registerCapability('measure_battery', 'BATTERY', {
      getOpts: {
        getOnOnline: true,
      }
    });
    this.registerCapability('alarm_siren', 'NOTIFICATION', {
      get: 'NOTIFICATION_GET',
      getOpts: {
        getOnOnline: true,
      },
      getParser: () => ({
        'V1 Alarm Type': 0,
        'Notification Type': 'Siren',
      }),
      report: 'NOTIFICATION_REPORT',
      reportParser: report => {
        if (report && report['Notification Type'] === 'Siren') {
          if (report['Event'] === 1) {
            this.emit('SirenTrigger');
            return true;
          }
          if (report['Event'] === 0) return false;
        }
        return null;
      }
    });

    //===== CONTROL Binary Switch
    // define FlowCardAction to set the Switch
    let AB01ZE_alarm_state_run_listener = async (args) => {
      try {
        //this.log('FlowCardAction Set LED level for: ', args.alarm_state);
        const result = await args.device.node.CommandClass.COMMAND_CLASS_SWITCH_BINARY.SWITCH_BINARY_SET({
          'Switch Value': args.alarm_state
        });
        //this.log("outcome: ", result)
        if (result !== 'TRANSMIT_COMPLETE_OK') throw new Error(result);
        return true;
      } catch (err) {
        this.error('failed_to_set_alarm_state', err);
        throw new Error('Z-Wave device did not respond');
      }
    };

    this.homey.flow.getActionCard('AB01ZE_alarm_state')
      .registerRunListener(AB01ZE_alarm_state_run_listener);

    // Cards that responde to the siren activating / blink icon alarm
    // Register Flow card trigger
    const SirenFlowTrigger = this.homey.flow.getDeviceTriggerCard('alarm_siren');

    // Check if Flow card is registered in app manifest
    if (!(SirenFlowTrigger instanceof Error)) {

      // Handle Emergency notification
      this.on('SirenTrigger', async () => {
        //this.log('SirenTrigger');
        try {
          await SirenFlowTrigger.trigger(this, {}, {});
        } catch (err) {
          this.error('failed_to_trigger_alarm_siren_flow', err);
        }
      });
    } else this.error('missing_alarm_siren_card_in_manifest');

    const setConfig = async (id, value, label) => {
      try {
        await this.configurationSet({ id }, value);
        return true;
      } catch (err) {
        this.error(`failed_to_set_${label}`, err);
        throw new Error('Z-Wave device did not respond');
      }
    };

    // Cards that change device settings
    //===== CONTROL Siren Alarm/Doorbell mode
    let AB01ZE_alarm_mode_run_listener = async (args) => setConfig('alarmordoorbell', args.alarm_mode, 'alarm_mode');
    this.homey.flow.getActionCard('AB01ZE_alarm_mode')
      .registerRunListener(AB01ZE_alarm_mode_run_listener);

    //===== CONTROL Siren Alarm Tune
    let AB01ZE_alarm_tune_run_listener = async (args) => setConfig('alarmtune', args.alarm_tune, 'alarm_tune');
    this.homey.flow.getActionCard('AB01ZE_alarm_tune')
      .registerRunListener(AB01ZE_alarm_tune_run_listener);


    //===== CONTROL Siren Doorbell Tune
    let AB01ZE_doorbell_tune_run_listener = async (args) => setConfig('doorbelltune', args.doorbell_tune, 'doorbell_tune');
    this.homey.flow.getActionCard('AB01ZE_doorbell_tune')
      .registerRunListener(AB01ZE_doorbell_tune_run_listener);

    //===== CONTROL Siren Volume
    let AB01ZE_siren_volume_run_listener = async (args) => setConfig('alarmvolume', args.siren_volume, 'siren_volume');
    this.homey.flow.getActionCard('AB01ZE_siren_volume')
      .registerRunListener(AB01ZE_siren_volume_run_listener);

    //===== CONTROL Doorbell Volume
    let AB01ZE_doorbell_volume_run_listener = async (args) => setConfig('doorbellvolume', args.doorbell_volume, 'doorbell_volume');
    this.homey.flow.getActionCard('AB01ZE_doorbell_volume')
      .registerRunListener(AB01ZE_doorbell_volume_run_listener);

    //===== CONTROL Alarm Duration Time
    let AB01ZE_alarm_time_run_listener = async (args) => setConfig('alarmsoundtime', args.alarm_time, 'alarm_time');
    this.homey.flow.getActionCard('AB01ZE_alarm_time')
      .registerRunListener(AB01ZE_alarm_time_run_listener);

    //===== CONTROL Doorbell Duration Time
    let AB01ZE_doorbell_time_run_listener = async (args) => setConfig('doorbellsoundtime', args.doorbell_time, 'doorbell_time');
    this.homey.flow.getActionCard('AB01ZE_doorbell_time')
      .registerRunListener(AB01ZE_doorbell_time_run_listener);

    //===== CONTROL Alarm LED
    let AB01ZE_alarm_led_run_listener = async (args) => setConfig('alarmled', args.alarm_led_onoff, 'alarm_led');
    this.homey.flow.getActionCard('AB01ZE_alarm_led')
      .registerRunListener(AB01ZE_alarm_led_run_listener);

    //===== CONTROL Doorbell LED
    let AB01ZE_doorbell_led_run_listener = async (args) => setConfig('doorbellled', args.doorbell_led_onoff, 'doorbell_led');
    this.homey.flow.getActionCard('AB01ZE_doorbell_led')
      .registerRunListener(AB01ZE_doorbell_led_run_listener);

  }
}
module.exports = Siren_AB01Z;
