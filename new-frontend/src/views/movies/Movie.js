import React, {Component} from 'react';
import axios from "axios/index";
import ReactPlayer from 'react-player'
import {Button, Card, Col, Row, Spin, notification} from "antd";


const url = process.env.REACT_APP_API_SERVER;
const {chrome} = window;

class Movie extends Component {

    constructor(props) {
        super(props);
        const canCast = window['__onGCastApiAvailable'] = (isAvailable) => isAvailable;

        window['__onGCastApiAvailable'] = (isAvailable) => {
            if (isAvailable) {
                console.log('available');
                window.cast.framework.CastContext.getInstance().setOptions({
                    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
                });
            }
            else {
                console.log('unavailable');
                notification["error"]({message: `Chromecast werkt niet vanaf dit device`});
            }
        };

        this.state = {loading: true, downloading: false, token: sessionStorage.getItem('token'), canCast}
    }

    async componentWillMount() {
        const {id} = this.props.match.params;
        const {data} = await axios.get(`https://tv-v2.api-fetch.website/movie/${id}?sort=trending&order=-1`);
        let movieDownloaded;
        try {
            await axios.get(`${url}/movie/${this.props.match.params.id}`, {
                headers: {Authorization: "Bearer " + this.state.token}
            });
            movieDownloaded = true;
        } catch (e) {
            movieDownloaded = false;
        }
        this.setState({movie: data, loading: false, movieDownloaded})
    }

    cast = async () => {
        const {id} = this.props.match.params;


        try {
            await window.cast.framework.CastContext.getInstance().requestSession();
        } catch (e) {
            console.log('do noting no session retrieved from chromecast!');
            notification["error"]({message: `Chromecast werkt niet vanaf dit device, probeer het via een computer met chrome`});
            return;
        }

        const castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();

        // create subtitles
        let englishSubtitle = new chrome.cast.media.Track(1, chrome.cast.media.TrackType.TEXT);
        englishSubtitle.trackContentId = `${url}/movie/stream/subtitle/${id}/en?token=${this.state.token}`;
        englishSubtitle.trackContentType = 'text/vtt';

        let dutchSubtitle = new chrome.cast.media.Track(2, chrome.cast.media.TrackType.TEXT);
        dutchSubtitle.trackContentId = `${url}/movie/stream/subtitle/${id}/nl?token=${this.state.token}`;
        dutchSubtitle.trackContentType = 'text/vtt';

        // create a media instance
        let mediaInfo = new chrome.cast.media.MediaInfo(`${url}/movie/stream/${id}?token=${this.state.token}`, 'video/mp4');

        // add subtitles to media
        mediaInfo.tracks = [englishSubtitle, dutchSubtitle];

        // create a loadRequest and set the active subtitle to english.
        // todo this should be null and when playing a subtitle should be selected this is possible look at docs
        const request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.activeTrackIds = [1];

        // this promise is actually not returning anything when succeed, so we can just proceed after loadMedia.
        try {
            await castSession.loadMedia(request);
            console.log('playing on your chromecast now :)');
            this.setState({casting: true})
        } catch (e) {
            console.log(e);
        }
    };

    download = async () => {
        this.setState({downloading: true});
        await axios.get(`${url}/download/${this.props.match.params.id}`, {
            headers: {Authorization: "Bearer " + this.state.token}
        })
    };

    render() {
        const {id} = this.props.match.params;
        const {movie, downloading} = this.state;
        if (this.state.loading) {
            return (
              <div className={'d-flex justify-content-center'} style={{marginTop: 20}}>
                  <Spin/>
              </div>
            )
        }
        if (movie === '') {
            return (
              <div className={'d-flex justify-content-center'} style={{marginTop: 20}}>
                  This movie is not available for download. Check again soon.
              </div>
            )
        }

        return (
          <Row>
              <Col>
                  <Card style={{
                      backgroundImage: `url(${movie.images.fanart.replace('w500', 'original')})`,
                      backgroundColor: `rgba(0, 0, 0, 0.7)`,
                      backgroundBlendMode: 'darken',
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                  }}>
                      <Row gutter={16}>
                          <Col span={4}>
                              <img src={movie.images.banner} alt={'poster'} style={{maxWidth: '100%'}}/>
                          </Col>
                          <Col span={18}>
                              <h1 className="title" style={{color: 'white'}}>{movie.title}</h1>
                              <p style={{color: 'white'}}>{movie.synopsis}</p>
                              {this.state.movieDownloaded
                                ? <div>
                                    {this.state.canCast &&
                                    <Row gutter={16} type="flex" justify="end">
                                        <Col>
                                            <Button onClick={this.cast}> Play on chromecast!</Button>
                                            {this.state.casting && <div>todo change subtitle here</div>}
                                        </Col>
                                    </Row>
                                    }
                                    {!this.state.casting &&
                                    <ReactPlayer url={`${url}/movie/stream/${id}?token=${this.state.token}`}
                                                 playing={true}
                                                 controls
                                                 width={''}
                                                 height={''}
                                                 config={{
                                                     file: {
                                                         tracks: [
                                                             {
                                                                 kind: 'subtitles',
                                                                 src: `${url}/movie/stream/subtitle/${id}/en?token=${this.state.token}`,
                                                                 srcLang: 'en',
                                                                 default: true
                                                             },
                                                             {
                                                                 kind: 'subtitles',
                                                                 src: `${url}/movie/stream/subtitle/${id}/nl?token=${this.state.token}`,
                                                                 srcLang: 'nl',
                                                                 default: true
                                                             },
                                                         ],
                                                         attributes: {crossOrigin: 'anonymous'}
                                                     },
                                                 }}
                                    />
                                    }
                                </div>
                                : <Button onClick={this.download} color={'primary'}
                                          loading={downloading}>Download</Button>
                              }
                          </Col>
                      </Row>
                  </Card>
              </Col>
          </Row>
        );
    }
}

export default Movie;
