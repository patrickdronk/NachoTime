'use strict';
const Helpers = use('Helpers');
const fs = require('fs-extra');
const axios = require('axios');
const OS = require('opensubtitles-api');
const srt2vtt = require('srt-to-vtt');
const torrentService = use('TorrentService');
const Movie = use('App/Models/Movie');

class MovieController {

  async getMovie({request, response, params}) {
    const {id} = params;
    return await Movie.findByOrFail('imdb_id', id);
  }

  async streamMovie({request, response, params}) {
    const {id} = params;
    const movie = await Movie.findBy('imdb_id', id);
    response.download(movie.location);
  }

  async streamSubtitle({request, response, params}) {
    const {id} = params;
    const movie = await Movie.findBy('imdb_id', id);
    response.download(movie.subtitle_location);
  }

  async downloadMovie({request, response, params}) {
    console.log('starting downloading :)');
    const {id} = params;
    let movieInfo = await axios.get(`https://tv-v2.api-fetch.website/movie/${id}`);
    movieInfo = movieInfo.data;
    let torrent;
    try {
      torrent = await torrentService.addTorrentByMagnetUri(movieInfo.torrents.en['720p'].url);
    } catch (error) {
      return response.status(409).send({message: "torrent already added, please wait"})
    }
    const extension = await torrentService.getFileExtension(torrent);

    await torrentService.torrentDone(torrent, movieInfo);
    const location = await torrentService.moveFilesToMovieDirectory(torrent, movieInfo);

    const movie = new Movie();
    movie.imdb_id = id;
    movie.location = location;
    movie.subtitle_location = await this.downloadSubtitle(movieInfo.title, movieInfo.year, extension);
    await movie.save();
  }

  async downloadSubtitle(movieName, year, extension) {
    console.log(movieName, year, extension);
    const OpenSubtitles = new OS('TemporaryUserAgent');
    const {moviehash} = await OpenSubtitles.hash(`${Helpers.appRoot()}/movies/${movieName} (${year})/${movieName}${extension}`);
    let result = "";

    try {
      result = await OpenSubtitles.search({hash: moviehash});
    } catch (e) {
      console.log(e)
    }

    const subtitleUrl = result.en.url;

    try{
      result = await axios.get(subtitleUrl);
    } catch (e) {
      console.log(e)
    }

    fs.writeFileSync(`${Helpers.appRoot()}/movies/${movieName} (${year})/${movieName}.srt`, result.data);

    fs.createReadStream(`${Helpers.appRoot()}/movies/${movieName} (${year})/${movieName}.srt`)
      .pipe(srt2vtt())
      .pipe(fs.createWriteStream(`${Helpers.appRoot()}/movies/${movieName} (${year})/${movieName}.vtt`));
    await fs.remove(Helpers.tmpPath() + `/movies/${movieName} (${year})/${movieName}.srt`);

    return `${Helpers.appRoot()}/movies/${movieName} (${year})/${movieName}.vtt`;
  }
}

module.exports = MovieController;
