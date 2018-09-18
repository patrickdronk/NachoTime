'use strict';

const Schema = use('Schema');

class MovieSchema extends Schema {
  up () {
    this.create('movies', (table) => {
      table.string('imdb_id', 255).notNullable().unique().index().primary();
      table.string('location', 1024).notNullable();
      table.string('subtitle_location', 1024);
      table.timestamps()
    })
  }

  down () {
    this.drop('movies')
  }
}

module.exports = MovieSchema;
