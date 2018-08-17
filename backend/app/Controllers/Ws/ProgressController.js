'use strict';
const Event = use('Event');

class ProgressController {
  constructor ({ socket }) {
    this.socket = socket;
    Event.on('progress', (info) => {
      try{
        this.socket.broadcastToAll('message', info);
      } catch(e) {
        //we probably have nobody to notify when we come here xD
      }
    });
  }
}

module.exports = ProgressController;
