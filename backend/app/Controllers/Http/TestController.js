'use strict';
const Helpers = use('Helpers');
const fs = require('fs-extra');
const axios = require('axios');
const OS = require('opensubtitles-api');
const srt2vtt = require('srt-to-vtt');
const torrentService = use('TorrentService');
const Movie = use('App/Models/Movie');

class TestController {

  async index({request, response}) {
    const {url} = request.get();
    response.download(url)
  }

  async subtitle({request, response}) {
    const {url} = request.get();
    response.download(url)
  }

  async index2({response}) {
    const imdb_id = 'tt1825683';
    let movieInfo = await axios.get(`https://tv-v2.api-fetch.website/movie/${imdb_id}`);
    movieInfo = movieInfo.data;
    let torrent;
    try {
      torrent = await torrentService.addTorrentByMagnetUri(movieInfo.torrents.en['720p'].url);
    } catch (error) {
      return response.status(409).send({message: "torrent already added, please wait"})
    }

    await torrentService.torrentDone(torrent);
    const location = await torrentService.moveFilesToMovieDirectory(torrent, movieInfo);
    const extension = torrentService.getFileExtension(torrent);

    const movie = new Movie();
    movie.imdb_id = imdb_id;
    movie.location = location;
    movie.subtitle_location = await this.downloadSubtitle(movieInfo.title, movieInfo.year, extension);
    movie.save();
  }

  async downloadSubtitle(movieName, year, extension) {
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

module.exports = TestController;
