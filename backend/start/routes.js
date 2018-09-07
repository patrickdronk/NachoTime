'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route');

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
});




Route.post('/login', 'UserController.login');
Route.post('/register', 'UserController.register')

Route
  .group(() => {
    Route.get('/movies', 'MovieController.getAllMovies');
    Route.get('/movie/:id', 'MovieController.getMovie');
    Route.get('/movie/stream/:id', 'MovieController.streamMovie');
    Route.get('/movie/stream/subtitle/:id/:language', 'MovieController.streamSubtitle');
    Route.get('/download/:id', 'MovieController.downloadMovie');

    Route.get('/show/:imdb_id', 'ShowController.getShowDetails')
    Route.post('/show/download', 'ShowController.downloadEpisode')
    Route.get('/show/stream/:id', 'ShowController.streamEpisode');
    Route.get('/show/stream/subtitle/:id/:language', 'ShowController.streamSubtitle');
  })
  .middleware(['auth'])



