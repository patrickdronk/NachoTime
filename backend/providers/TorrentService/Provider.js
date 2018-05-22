const { ServiceProvider } = require('@adonisjs/fold');

class TorrentService extends ServiceProvider {
  register () {
    this.app.singleton('TorrentService', () => {
      return new (require('.'))()
    })
  }
}

module.exports = TorrentService;
