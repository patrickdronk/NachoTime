'use strict'
const tmdb = use('TMDB')
const Episode = use('App/Models/Episode');
const torrentService = use('TorrentService');
const SubtitleService = use('SubtitleService')
const Helpers = use('Helpers')

const axios = require('axios')
const movieDB = tmdb.MovieDB;

class ShowController {
  async getShowDetails({params}) {
    const {tv_results} = await movieDB.find({id: params.imdb_id, external_source: 'imdb_id'});
    const  {id, seasons, backdrop_path, name, overview, poster_path} = await movieDB.tvInfo(tv_results[0].id)

    let downloadedEpisodes = await Episode
      .query()
      .where('show_id', '=', id)
      .fetch()

    downloadedEpisodes = downloadedEpisodes.toJSON() // array of items


    const promises = seasons.map(async (season) => {
      const {season_number} = season
      const episodes = await movieDB.tvSeasonInfo({id, season_number});
      return {...season, episodes: episodes.episodes}
    })

    let enrichedSeasons = await Promise.all(promises)

    const popcorntimeResult = await axios.get(`https://tv-v2.api-fetch.website/show/${params.imdb_id}`)
    const filteredEmptyTorrents = popcorntimeResult.data.episodes.filter(this.episodeWithoutActiveTorrents)

    // go over all seasons
    enrichedSeasons = enrichedSeasons.map((season) => {
      const {season_number} = season
      season.episodes = season.episodes.map(episode => {
        const {episode_number} = episode
        // search through filteredEmptyTorrents and add it to episode
        let torrents = filteredEmptyTorrents.find(episodeObj => {
          const {episode, season} = episodeObj
          return season_number === season && episode_number === episode
        })
        if (torrents) {
          torrents = torrents.torrents[0]
        } else {torrents = {}}

        const downloaded = downloadedEpisodes.find(downloadedEpisode => {
          return (Number(downloadedEpisode.id) === Number(episode.id))
        });
        episode.torrent = torrents;
        episode.downloaded = downloaded ? true: false
        return episode
      })
      return season;
    })
    return {id, name, overview, poster_path: `https://image.tmdb.org/t/p/w370_and_h556_bestv2${poster_path}`, backdrop_path: `https://image.tmdb.org/t/p/w1400_and_h450_face${backdrop_path}`, seasons: enrichedSeasons}
  }

  async downloadEpisode({request}) {
    const {magnetUrl, episodeId, showId, showName, season, episodeNumber, episodeName} = request.all()
    const show = {
      name: showName,
      season,
      episodeNumber,
      episodeName
    }
    const torrent = await torrentService.addTorrentByMagnetUri(magnetUrl)
    await torrentService.torrentDone(torrent, {title: `${episodeName}`})
    const location = await torrentService.moveFilesToShowsDirectory(torrent, show)

    const folderLocation = `${Helpers.appRoot()}/shows/${show.name}/Season ${show.season}`
    const fileName = `${show.episodeNumber}: ${show.episodeName}`
    SubtitleService.downloadSubtitle(location, folderLocation, fileName)

    const episode = new Episode();
    episode.id = episodeId
    episode.show_id = showId;
    episode.location = location;
    episode.subtitle_location = `${folderLocation}/${fileName}`;

    try {
      await episode.save()
    } catch(e) {
      console.log(e)
    }
  }

  async streamEpisode({response, params}) {
    const {id} = params;
    const episode = await Episode.findBy('id', id);
    response.download(episode.location);
  }

  async streamSubtitle({request, response, params}) {
    const {id, language} = params;
    const episode = await Episode.findBy('id', id);
    response.download(`${episode.subtitle_location}-${language}.vtt`);
  }


  episodeWithoutActiveTorrents(episode) {
    const torrents = Object.values(episode.torrents).filter((torrent) => {
      if (torrent) {
        return true
      }
    })
    return torrents.length > 0
  }
}

module.exports = ShowController
