'use strict'

const srt2vtt = require('srt-to-vtt');
const OS = require('opensubtitles-api');
const axios = require('axios');
const fs = require('fs-extra');


class SubtitleService {
  constructor() {
    this.OpenSubtitles = new OS('TemporaryUserAgent');
  }

  async downloadSubtitle(pathToFile, folderLocation, fileName) {
    const temp = await this.OpenSubtitles.hash(pathToFile);
    const hash = temp.moviehash;

    let searchResult = await this.OpenSubtitles.search({hash});

    const subtitleUrl = searchResult.en;
    const dutchSubtitleUrl = searchResult.nl;

    let englishSubtitle;
    let dutchSubtitle;
    try {
      englishSubtitle = await axios.get(subtitleUrl.url);
      await this.writeSubtitleToLocation(folderLocation, `${fileName}-en`, englishSubtitle);

      // dutch is not always there so only get it if it is
      if (dutchSubtitleUrl) {
        dutchSubtitle = await axios.get(dutchSubtitleUrl.url);
        await this.writeSubtitleToLocation(folderLocation, `${fileName}-nl`, dutchSubtitle);
      }
    } catch (e) {
      console.log(e)
    }
  }

  writeSubtitleToLocation(path, lang, data) {
    fs.writeFileSync(`${path}/${lang}.srt`, data.data);
    fs.createReadStream(`${path}/${lang}.srt`)
      .pipe(srt2vtt())
      .pipe(fs.createWriteStream(`${path}/${lang}.vtt`));
  }
}

module.exports = SubtitleService
