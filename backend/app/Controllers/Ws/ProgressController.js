'use strict';
const Event = use('Event');

class ProgressController {
  constructor({socket}) {
    this.socket = socket;
    Event.on('torrent.progress', (info) => {
      try {
        this.socket.broadcastToAll('torrent.progress', info);
      } catch(e) {}
    });

    Event.on('torrent.added', (info) => {
      console.log('progressController torrent.added');
      try {
        this.socket.broadcastToAll('torrent.added', info)
      } catch(e) {}
    });
  }
}

module.exports = ProgressController;
