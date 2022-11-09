'use strict';

const Homey = require('homey');

class NeoZwave extends Homey.App {

  onInit() {

    this.log('Neo Z-wave app is running...');

  }

}

module.exports = NeoZwave;
