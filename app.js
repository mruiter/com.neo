'use strict';

const Homey = require('homey');

class NeoZwave extends Homey.App {

  async onInit() {

    this.log('Neo Z-wave app is running...');

  }

}

module.exports = NeoZwave;
