'use strict';

const Homey = require('homey');

class Siren_AB01Z extends Homey.Driver {

  onInit() {
    super.onInit();

    this.alarm_modeAction = this.homey.flow.getActionCard('AB01ZE_alarm_mode');
    this.alarm_modeAction.registerRunListener((args, state) => {
      return args.device.alarm_modeRunListener(args, state);
    });
	
    this.alarm_tuneAction = this.homey.flow.getActionCard('AB01ZE_alarm_tune');
    this.alarm_tuneAction.registerRunListener((args, state) => {
      return args.device.alarm_tuneRunListener(args, state);
    });

    this.siren_volumeAction = this.homey.flow.getActionCard('AB01ZE_siren_volume');
    this.siren_volumeAction.registerRunListener((args, state) => {
      return args.device.siren_volumeRunListener(args, state);
    });

    this.doorbell_tuneAction = this.homey.flow.getActionCard('AB01ZE_doorbell_tune');
    this.doorbell_tuneAction.registerRunListener((args, state) => {
      return args.device.doorbell_tuneRunListener(args, state);
    });
	
	this.doorbell_volumeAction = this.homey.flow.getActionCard('AB01ZE_doorbell_volume');
    this.doorbell_volumeAction.registerRunListener((args, state) => {
      return args.device.doorbell_volumeRunListener(args, state);
    });
	
  }

}

module.exports = Siren_AB01Z;
