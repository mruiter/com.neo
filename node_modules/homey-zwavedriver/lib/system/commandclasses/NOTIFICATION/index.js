'use strict';

const events = require('./events.json');

module.exports = payload => {
  if (Buffer.isBuffer(payload['Notification Type (Raw)'])) {
    const notificationType = payload['Notification Type (Raw)'].readUInt8();
    const eventCode = payload['Event'];

    const notificationDefinition = events[notificationType];
    const eventDefinition = notificationDefinition && notificationDefinition[eventCode];

    if (eventDefinition) {
      const { name, push, pull } = eventDefinition;
      payload['Event (Parsed)'] = name || push || pull || false;
      // Not sure why this exists, we use "Event (Parsed)" and they are the same
      payload['Event (Parsed 2)'] = payload['Event (Parsed)'];
    }
  }

  return payload;
};
