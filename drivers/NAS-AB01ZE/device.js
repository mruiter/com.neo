'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class Siren_AB01Z extends ZwaveDevice {
  async onMeshInit() {
    //this.enableDebug();
    //this.printNode();
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
      //this.log('FlowCardAction Set LED level for: ', args.alarm_state);
      let result = await args.device.node.CommandClass.COMMAND_CLASS_SWITCH_BINARY.SWITCH_BINARY_SET({
        'Switch Value': args.alarm_state
      });
      //this.log("outcome: ", result)
      if (result !== 'TRANSMIT_COMPLETE_OK') throw new Error(result);
    };

    let actionAB01ZE_alarm_state = new Homey.FlowCardAction('AB01ZE_alarm_state');
    actionAB01ZE_alarm_state
      .register()
      .registerRunListener(AB01ZE_alarm_state_run_listener);

    // Cards that responde to the siren activating / blink icon alarm
    // Register Flow card trigger
    const SirenFlowTrigger = new Homey.FlowCardTriggerDevice('alarm_siren');
    SirenFlowTrigger.register();

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

    // Cards that change device settings
    //===== CONTROL Siren Alarm/Doorbell mode
    let AB01ZE_alarm_mode_run_listener = async (args) => {
      //this.log('FlowCardAction Set Alarm Mode to: ', args.alarm_mode);
      this.configurationSet({
        id: 'alarmordoorbell'
      }, args.alarm_mode);
    };
    let actionAB01ZE_alarm_mode = new Homey.FlowCardAction('AB01ZE_alarm_mode');
    actionAB01ZE_alarm_mode
      .register()
      .registerRunListener(AB01ZE_alarm_mode_run_listener);

    //===== CONTROL Siren Alarm Tune
    let AB01ZE_alarm_tune_run_listener = async (args) => {
      //this.log('FlowCardAction Set Alarm Tune to: ', args.alarm_tune);
      this.configurationSet({
        id: 'alarmtune'
      }, args.alarm_tune);
    };
    let actionAB01ZE_alarm_tune = new Homey.FlowCardAction('AB01ZE_alarm_tune');
    actionAB01ZE_alarm_tune
      .register()
      .registerRunListener(AB01ZE_alarm_tune_run_listener);

    //===== CONTROL Siren Doorbell Tune
    let AB01ZE_doorbell_tune_run_listener = async (args) => {
      //this.log('FlowCardAction Set Doorbell Tune to: ', args.doorbell_tune);
      this.configurationSet({
        id: 'doorbelltune'
      }, args.doorbell_tune);
    };
    let actionAB01ZE_doorbell_tune = new Homey.FlowCardAction('AB01ZE_doorbell_tune');
    actionAB01ZE_doorbell_tune
      .register()
      .registerRunListener(AB01ZE_doorbell_tune_run_listener);

    //===== CONTROL Siren Volume
    let AB01ZE_siren_volume_run_listener = async (args) => {
      //this.log('FlowCardAction Set Siren volume to: ', args.siren_volume);
      this.configurationSet({
        id: 'alarmvolume'
      }, args.siren_volume);
    };
    let actionAB01ZE_siren_volume = new Homey.FlowCardAction('AB01ZE_siren_volume');
    actionAB01ZE_siren_volume
      .register()
      .registerRunListener(AB01ZE_siren_volume_run_listener);

    //===== CONTROL Doorbell Volume
    let AB01ZE_doorbell_volume_run_listener = async (args) => {
      //this.log('FlowCardAction Set Doorbell volume to: ', args.doorbell_volume);
      this.configurationSet({
        id: 'doorbellvolume'
      }, args.doorbell_volume);
    };
    let actionAB01ZE_doorbell_volume = new Homey.FlowCardAction('AB01ZE_doorbell_volume');
    actionAB01ZE_doorbell_volume
      .register()
      .registerRunListener(AB01ZE_doorbell_volume_run_listener);

  }
}
module.exports = Siren_AB01Z;
