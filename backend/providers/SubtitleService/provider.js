const { ServiceProvider } = require('@adonisjs/fold')

class SubtitleProvider extends ServiceProvider {
  register () {
    this.app.singleton('SubtitleService', () => {
      const Config = this.app.use('Adonis/Src/Config')
      return new (require('.'))(Config)
    })
  }
}

module.exports = SubtitleProvider
