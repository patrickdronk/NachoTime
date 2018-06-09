'use strict';
const Event = use('Event');

class ProgressController {
  constructor ({ socket }) {
    this.socket = socket;
    console.log(`connected with ${socket}`);
    Event.on('progress', (info) => {
      try{
        this.socket.broadcastToAll('message', info);
      } catch(e) {
        console.log(e)
      }
    });
  }
}

module.exports = ProgressController;
