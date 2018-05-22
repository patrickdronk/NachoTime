const WebTorrent = require('webtorrent');
const Helpers = use('Helpers');
const fs = require('fs-extra');

class TorrentClient {
  constructor() {
    this._client = new WebTorrent();
  }

  async addTorrentByMagnetUri(magnetURI) {
    return new Promise((resolve, reject) => {
      try {
        if (this._client.get(magnetURI) === null) {
          this._client.add(magnetURI, {path: Helpers.tmpPath() + '/movies'}, function (torrent) {
            resolve(torrent);
          })
        } else {
          reject("torrent already added")
        }
      }
      catch (e) {
        reject(new Error(e));
      }
    });
  }

  async torrentDone(torrent) {

    let currentPercentage = 0;
    torrent.on('download', function (bytes) {
      let newPercentage = Math.round(torrent.progress * 100);
      if (newPercentage > currentPercentage) {
        currentPercentage = newPercentage;
        console.log('progress: ' + newPercentage)
      }
    });

    return new Promise((resolve, reject) => {
      torrent.on('done', function () {
        console.log('done?');
        resolve(true);
      });
    });
  }

  async getFileNameOfMovie(torrent) {
    let biggestSize = 0;
    let torrentName = '';
    for (const key in torrent.files) {
      if (biggestSize < torrent.files[key].length) {
        biggestSize = torrent.files[key].length;
        torrentName = torrent.files[key].name;
      }
    }
    return torrentName;
  }

  async moveFilesToMovieDirectory(torrent, movieInfo) {
    const torrentName = await this.getFileNameOfMovie(torrent);
    const fileLocation = `/${torrent.name}/${torrentName}`;
    const extension = torrentName.substring(torrentName.lastIndexOf('.'));
    const oldPath = torrent.path + fileLocation;
    const newPath = `${Helpers.appRoot()}/movies/${movieInfo.title} (${movieInfo.year})/${movieInfo.title}${extension}`;

    //make directory
    await fs.mkdirSync(`${Helpers.appRoot()}/movies/${movieInfo.title} (${movieInfo.year})`);

    try {
      await fs.rename(oldPath, newPath);
    } catch (error) {
      console.log(error);
    }

    try {
      await fs.remove(Helpers.tmpPath() + `/movies/${torrent.name}`);
    } catch (error) {
      console.log(error)
    }
    return new Promise((resolve, reject) => {
      resolve(newPath);
    });
  }

  async getFileExtension(torrent) {
    const fileName = await this.getFileNameOfMovie(torrent);
    return fileName.substring(fileName.lastIndexOf('.'));
  }
}

module.exports = TorrentClient;
