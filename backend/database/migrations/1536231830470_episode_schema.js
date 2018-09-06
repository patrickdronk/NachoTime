'use strict'

const Schema = use('Schema')

class EpisodeSchema extends Schema {
  up () {
    this.create('episodes', (table) => {
      table.string('id', 255).notNullable().unique().index().primary();
      table.string('show_id', 255).notNullable
      table.string('location', 1024).notNullable();
      table.string('subtitle_location', 1024)
      table.timestamps()
    })
  }

  down () {
    this.drop('episodes')
  }
}

module.exports = EpisodeSchema
