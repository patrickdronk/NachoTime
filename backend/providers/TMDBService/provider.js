const { ServiceProvider } = require('@adonisjs/fold')

class TMDBProvider extends ServiceProvider {
  register () {
    this.app.singleton('TMDB', () => {
      const Config = this.app.use('Adonis/Src/Config')
      return new (require('.'))(Config)
    })
  }
}

module.exports = TMDBProvider
