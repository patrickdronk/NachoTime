'use strict';
const Event = use('Event');

class ProgressController {
  constructor({socket}) {
    this.socket = socket;
    Event.on('torrent.progress', (info) => {
      this.socket.broadcastToAll('torrent.progress', info);
    });

    Event.on('torrent.added', (info) => {
      this.socket.broadcastToAll('torrent.added', info)
    });
  }
}

module.exports = ProgressController;
