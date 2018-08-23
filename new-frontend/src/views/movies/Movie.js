import React, {Component} from 'react';
import axios from "axios/index";
import ReactPlayer from 'react-player'
import {Button, Card, Col, Row, Spin} from "antd";

const url = process.env.REACT_APP_API_SERVER;

class Movie extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: true, downloading: false, token: sessionStorage.getItem('token')}
    }

    async componentWillMount() {
        const {id} = this.props.match.params;
        const {data} = await axios.get(`https://tv-v2.api-fetch.website/movie/${id}?sort=trending&order=-1`);
        let movieDownloaded;
        try {
            await axios.get(`${url}/movie/${this.props.match.params.id}`, {
                headers: { Authorization: "Bearer " + this.state.token }
            });
            movieDownloaded = true;
        } catch (e) {
            movieDownloaded = false;
        }
        this.setState({movie: data, loading: false, movieDownloaded})
    }

    download = async () => {
        this.setState({downloading: true});
        await axios.get(`${url}/download/${this.props.match.params.id}`, {
            headers: { Authorization: "Bearer " + this.state.token }
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
        if(movie === '') {
            return(
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
                                ? <ReactPlayer url={`${url}/movie/stream/${id}?token=${this.state.token}`}
                                               playing
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
                                : <Button onClick={this.download} color={'primary'} loading={downloading}>Download</Button>
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
