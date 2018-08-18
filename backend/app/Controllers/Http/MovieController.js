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

  async getAllMovies() {
    return Movie.all();
  }

  async streamMovie({request, response, params}) {
    const {id} = params;
    const movie = await Movie.findBy('imdb_id', id);
    response.download(movie.location);
  }

  async streamSubtitle({request, response, params}) {
    const {id, language} = params;
    const movie = await Movie.findBy('imdb_id', id);
    response.download(movie.subtitle_location + `${language}.vtt`);
  }

  async downloadMovie({request, response, params}) {
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
    this.downloadSubtitle(movieInfo.title, movieInfo.year, extension);

    console.log('comming here');
    const movie = new Movie();
    movie.imdb_id = id;
    movie.location = location;
    movie.subtitle_location = `${Helpers.appRoot()}/movies/${movieInfo.title} (${movieInfo.year})/`;
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

    console.log(result);
    const subtitleUrl = result.en.url;
    const dutchSubtitleUrl = result.nl;

    let englishSubtitle;
    let dutchSubtitle;
    try {
      englishSubtitle = await axios.get(subtitleUrl);
      // dutch is not always optional so only get it if it's there
      if (dutchSubtitleUrl) {
        dutchSubtitle = await axios.get(dutchSubtitleUrl.url);
      }
    } catch (e) {
      console.log(e)
    }
    this.writeSubtitleToLocation(movieName, year, 'en', englishSubtitle);
    if (dutchSubtitleUrl) {
      this.writeSubtitleToLocation(movieName, year, 'nl', dutchSubtitle);
    }
  }

  async writeSubtitleToLocation(movieName, year, lang, data) {
    //
    fs.writeFileSync(`${Helpers.appRoot()}/movies/${movieName} (${year})/${lang}.srt`, data.data);

    fs.createReadStream(`${Helpers.appRoot()}/movies/${movieName} (${year})/${lang}.srt`)
      .pipe(srt2vtt())
      .pipe(fs.createWriteStream(`${Helpers.appRoot()}/movies/${movieName} (${year})/${lang}.vtt`));
    await fs.remove(Helpers.tmpPath() + `/movies/${movieName} (${year})/${lang}.srt`);

    return `${Helpers.appRoot()}/movies/${movieName} (${year})/${movieName}.vtt`;
  }
}

module.exports = MovieController;
