'use strict'

const MovieDb = require('moviedb-promise')

class MovieDB {
  constructor (Config) {
    this.MovieDB = new MovieDb(Config.get('app.tmdb_api_key'))
  }
}

module.exports = MovieDB
