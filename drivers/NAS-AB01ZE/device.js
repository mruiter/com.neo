'use strict';

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
        if (report?.['Notification Type'] === 'Siren') {
          if (report['Event'] === 1) {
            this.emit('SirenTrigger');
            return true;
          }
          if (report['Event'] === 0) return false;
        }
        return null;
      }
    });

    const registerActionCard = (cardId, runListener, manifestLabel = cardId) => {
      const card = this.homey.flow.getActionCard(cardId);
      if (card instanceof Error) {
        this.error(`missing_${manifestLabel}_card_in_manifest`);
        return null;
      }
      card.registerRunListener(runListener);
      return card;
    };

    registerActionCard('AB01ZE_alarm_state', async args => {
      try {
        const result = await args.device.node.CommandClass
          .COMMAND_CLASS_SWITCH_BINARY.SWITCH_BINARY_SET({
            'Switch Value': args.alarm_state,
          });
        if (result !== 'TRANSMIT_COMPLETE_OK') throw new Error(result);
        return true;
      } catch (err) {
        this.error('failed_to_set_alarm_state', err);
        throw new Error('Z-Wave device did not respond');
      }
    }, 'AB01ZE_alarm_state');

    const sirenFlowTrigger = this.homey.flow.getDeviceTriggerCard('alarm_siren');
    if (sirenFlowTrigger instanceof Error) {
      this.error('missing_alarm_siren_card_in_manifest');
    } else {
      this.on('SirenTrigger', async () => {
        try {
          await sirenFlowTrigger.trigger(this, {}, {});
        } catch (err) {
          this.error('failed_to_trigger_alarm_siren_flow', err);
        }
      });
    }

    const setConfig = async (id, value, label) => {
      try {
        await this.configurationSet({ id }, value);
        return true;
      } catch (err) {
        this.error(`failed_to_set_${label}`, err);
        throw new Error('Z-Wave device did not respond');
      }
    };

    const registerConfigAction = (cardId, configId, argKey, label) =>
      registerActionCard(
        cardId,
        args => setConfig(configId, args[argKey], label),
        cardId,
      );

    registerConfigAction('AB01ZE_alarm_mode', 'alarmordoorbell', 'alarm_mode', 'alarm_mode');
    registerConfigAction('AB01ZE_alarm_tune', 'alarmtune', 'alarm_tune', 'alarm_tune');
    registerConfigAction('AB01ZE_doorbell_tune', 'doorbelltune', 'doorbell_tune', 'doorbell_tune');
    registerConfigAction('AB01ZE_siren_volume', 'alarmvolume', 'siren_volume', 'siren_volume');
    registerConfigAction('AB01ZE_doorbell_volume', 'doorbellvolume', 'doorbell_volume', 'doorbell_volume');
    registerConfigAction('AB01ZE_alarm_time', 'alarmsoundtime', 'alarm_time', 'alarm_time');
    registerConfigAction('AB01ZE_doorbell_time', 'doorbellsoundtime', 'doorbell_time', 'doorbell_time');
    registerConfigAction('AB01ZE_alarm_led', 'alarmled', 'alarm_led_onoff', 'alarm_led');
    registerConfigAction('AB01ZE_doorbell_led', 'doorbellled', 'doorbell_led_onoff', 'doorbell_led');

  }
}
module.exports = Siren_AB01Z;
