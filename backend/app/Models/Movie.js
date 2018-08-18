'use strict';

const Model = use('Model');

class Movie extends Model {
  static get primaryKey () {
    return 'imdb_id'
  }
}

module.exports = Movie;
