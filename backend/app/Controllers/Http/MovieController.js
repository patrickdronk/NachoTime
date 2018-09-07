'use strict';
const Helpers = use('Helpers');
const fs = require('fs-extra');
const axios = require('axios');
const OS = require('opensubtitles-api');
const srt2vtt = require('srt-to-vtt');
const OpenSubtitles = new OS('TemporaryUserAgent');
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
    let {data: movieInfo} = await axios.get(`https://tv-v2.api-fetch.website/movie/${params.id}`);

    let torrent;
    try {
      torrent = await torrentService.addTorrentByMagnetUri(movieInfo.torrents.en['720p'].url);
    } catch (error) {
      return response.status(409).send({message: "torrent already added, please wait"})
    }
    await torrentService.torrentDone(torrent, movieInfo);
    const location = await torrentService.moveFilesToMovieDirectory(torrent, movieInfo);
    const extension = await torrentService.getFileExtension(torrent);
    await this.downloadSubtitle(movieInfo.title, movieInfo.year, extension);

    const movie = new Movie();
    movie.imdb_id = id;
    movie.location = location;
    movie.subtitle_location = `${Helpers.appRoot()}/movies/${movieInfo.title} (${movieInfo.year})/`;
    try {
      await movie.save();
    } catch (e) {
      console.log(e)
    }
  }

  async downloadSubtitle(movieName, year, extension) {
    let moviehash;
    try {
      const temp = await OpenSubtitles.hash(`${Helpers.appRoot()}/movies/${movieName} (${year})/${movieName}${extension}`);
      moviehash = temp.moviehash;
    } catch (e) {
      console.log
    }

    let result = await OpenSubtitles.search({hash: moviehash});

    const subtitleUrl = result.en;
    const dutchSubtitleUrl = result.nl;

    let englishSubtitle;
    let dutchSubtitle;
    try {
      englishSubtitle = await axios.get(subtitleUrl.url);
      await this.writeSubtitleToLocation(movieName, year, 'en', englishSubtitle);

      // dutch is not always there so only get it if it is
      if (dutchSubtitleUrl) {
        dutchSubtitle = await axios.get(dutchSubtitleUrl.url);
        await this.writeSubtitleToLocation(movieName, year, 'nl', dutchSubtitle);
      }
    } catch (e) {
      console.log(e)
    }
  }

  async writeSubtitleToLocation(movieName, year, lang, data) {
    console.log(3);
    fs.writeFileSync(`${Helpers.appRoot()}/movies/${movieName} (${year})/${lang}.srt`, data.data);

    fs.createReadStream(`${Helpers.appRoot()}/movies/${movieName} (${year})/${lang}.srt`)
      .pipe(srt2vtt())
      .pipe(fs.createWriteStream(`${Helpers.appRoot()}/movies/${movieName} (${year})/${lang}.vtt`));
    await fs.remove(Helpers.tmpPath() + `/movies/${movieName} (${year})/${lang}.srt`);

    return `${Helpers.appRoot()}/movies/${movieName} (${year})/${movieName}.vtt`;
  }
}

module.exports = MovieController;
