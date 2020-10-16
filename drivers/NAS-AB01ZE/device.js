'use strict';

const Homey = require('homey');
const {
  ZwaveDevice
} = require('homey-zwavedriver');

class Siren_AB01Z extends ZwaveDevice {

  async onNodeInit() {

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
  }
  
  ////////// Flow Triggers
  
   async alarm_modeRunListener(args, state) {
    if (args.hasOwnProperty('alarm_mode')) {
      return this.configurationSet({
        index: 7,
        size: 1,
        id: 'alarm_mode',
      }, new Buffer([args.alarm_mode]));
    }
  }

   async alarm_tuneRunListener(args, state) {
    if (args.hasOwnProperty('alarm_tune')) {
      return this.configurationSet({
        index: 5,
        size: 1,
        id: 'alarm_tune',
      }, new Buffer([args.alarm_tune]));
    }
  }

   async siren_volumeRunListener(args, state) {
    if (args.hasOwnProperty('siren_volume')) {
      return this.configurationSet({
        index: 4,
        size: 1,
        id: 'siren_volume',
      }, new Buffer([args.siren_volume]));
    }
  }

   async doorbell_tuneRunListener(args, state) {
    if (args.hasOwnProperty('doorbell_tune')) {
      return this.configurationSet({
        index: 6,
        size: 1,
        id: 'doorbell_tune',
      }, new Buffer([args.doorbell_tune]));
    }
  }

   async doorbell_volumeRunListener(args, state) {
    if (args.hasOwnProperty('doorbell_volume')) {
      return this.configurationSet({
        index: 1,
        size: 1,
        id: 'doorbell_volume',
      }, new Buffer([args.doorbell_volume]));
    }
  } 
  
  
  
  //////////////////
  
  
  
  
  
  

}

module.exports = Siren_AB01Z;
