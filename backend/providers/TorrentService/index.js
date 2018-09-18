const WebTorrent = require('webtorrent');
const Helpers = use('Helpers');
const fs = require('fs-extra');
const Event = use('Event');

class TorrentClient {
  constructor() {
    this._client = new WebTorrent();
  }

  async addTorrentByMagnetUri(magnetURI) {
    return new Promise((resolve, reject) => {
      try {
        if (this._client.get(magnetURI) === null) {
          console.log('adding magnet');
          this._client.add(magnetURI, {path: Helpers.tmpPath() + '/movies'}, function (torrent) {
            Event.emit('torrent.added', torrent);
            console.log('added torrent');
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

  async torrentDone(torrent, movieInfo) {
    let currentPercentage = 0;
    torrent.on('download', function (bytes) {
      let newPercentage = Math.round(torrent.progress * 100);
      if (newPercentage > currentPercentage) {
        currentPercentage = newPercentage;
        Event.emit('torrent.progress', {movieTitle: movieInfo.title, newPercentage});
        console.log(`progress: ${newPercentage} movie: ${movieInfo.title}`)
      }
    });

    return new Promise((resolve, reject) => {
      torrent.on('done', function () {
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
    // there is a problem here; in certain scenarios only the movie is being downloaded.
    let fileLocation;
    if(torrent.name.endsWith('mp4') || torrent.name.endsWith('mkv')) {
      fileLocation = `/${torrentName}`;
    } else {
      fileLocation = `/${torrent.name}/${torrentName}`;
    }

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

  async moveFilesToShowsDirectory(torrent, show) {
    const torrentName = await this.getFileNameOfMovie(torrent);

    // there is a problem here; in certain scenarios only the movie/show is being downloaded.
    let fileLocation;
    if(torrent.name.endsWith('mp4') || torrent.name.endsWith('mkv')) {
      fileLocation = `/${torrentName}`;
    } else {
      fileLocation = `/${torrent.name}/${torrentName}`;
    }

    const extension = torrentName.substring(torrentName.lastIndexOf('.'));
    let oldPath = torrent.path + fileLocation;
    oldPath = oldPath.escape();
    const newPath = `${Helpers.appRoot()}/shows/${show.name}/Season ${show.season}/${show.episodeNumber}: ${show.episodeName}${extension}`;
    console.log('old: ' + oldPath)
    console.log('new: ' + newPath)

    try {
      await fs.mkdirSync(`${Helpers.appRoot()}/shows/${show.name}`);
      await fs.mkdirSync(`${Helpers.appRoot()}/shows/${show.name}/Season ${show.season}`);
    } catch (e) {}

    try {
      await fs.rename(oldPath, newPath);
      await fs.remove(Helpers.tmpPath() + `/movies/${torrent.name}`);
    } catch(e) {
      console.log('failed on rename');
      console.log(e)
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
