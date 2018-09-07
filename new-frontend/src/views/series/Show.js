import React, {Component} from 'react';
import axios from "axios/index";
import * as _ from 'lodash'
import {Card, Col, Row, Spin, List, Button} from "antd";
import ReactPlayer from "react-player";

const url = process.env.REACT_APP_API_SERVER;

class Show extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            downloading: false,
            token: sessionStorage.getItem('token'),
        }
    }

    async componentWillMount() {
        const {id} = this.props.match.params;
        const {data} = await axios.get(`${url}/show/${id}`, {
            headers: {Authorization: "Bearer " + this.state.token}
        });
        this.setState({show: data, loading: false})
    }

    download = async () => {
        console.log(this.state);
        const {selectedEpisode, show} = this.state;
        const body = {
            magnetUrl: selectedEpisode.torrent.url,
            episodeId: selectedEpisode.id,
            showId: show.id,
            showName: show.name,
            season: selectedEpisode.season_number,
            episodeNumber: selectedEpisode.episode_number,
            episodeName: selectedEpisode.name
        };
        await axios.post(`${url}/show/download`, body, {
            headers: {Authorization: "Bearer " + this.state.token}
        });
    };

    render() {
        const {show} = this.state;
        if (this.state.loading) {
            return (
              <div className={'d-flex justify-content-center'} style={{marginTop: 20}}>
                  <Spin/>
              </div>
            )
        }

        return (
          <Row>
              <Col>
                  <Card style={{
                      backgroundImage: `url(${show.backdrop_path})`,
                      backgroundColor: `rgba(0, 0, 0, 0.7)`,
                      backgroundBlendMode: 'darken',
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                  }}>
                      <Row gutter={16}>
                          <Col span={4}>
                              <img src={show.poster_path} alt={'poster'} style={{maxWidth: '100%'}}/>
                          </Col>
                          <Col span={20}>
                              <h1 className="title" style={{color: 'white'}}>{show.name}</h1>
                              <p style={{color: 'white'}}>{show.overview}</p>
                              <Row gutter={16}>
                                  <Col span={3}>
                                      <List size="small" bordered
                                            style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '0px'}}>
                                          {show.seasons.map(season => {
                                              return (
                                                <List.Item key={season.name} style={{color: 'white', border: '0px'}}
                                                           onClick={() => this.setState({
                                                               selectedSeason: season,
                                                               selectedEpisode: undefined
                                                           })}>
                                                    {season.name}
                                                </List.Item>
                                              )
                                          })}
                                      </List>
                                  </Col>
                                  <Col span={8}>
                                      {this.state.selectedSeason &&
                                      <List size="small" bordered
                                            style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '0px'}}>
                                          {
                                              this.state.selectedSeason.episodes.map(episode => {
                                                  return (
                                                    <List.Item key={episode.id} style={{color: 'white', border: '0px'}}
                                                               onClick={() => this.setState({selectedEpisode: episode})}>
                                                        {`Episode ${episode.episode_number}: ${episode.name}`}
                                                    </List.Item>
                                                  )
                                              })
                                          }
                                      </List>
                                      }
                                  </Col>
                                  <Col span={13}>
                                      {this.state.selectedEpisode &&
                                      <List size="small" bordered
                                            style={{backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '0px'}}>
                                          <List.Item style={{color: 'white', border: '0px'}}>
                                              <Row gutter={16}>
                                                  <Col span={6}>
                                                      <img
                                                        src={`https://image.tmdb.org/t/p/w370_and_h556_bestv2${this.state.selectedSeason.poster_path}`}
                                                        alt={'poster'} style={{maxWidth: '100%'}}/>
                                                  </Col>
                                                  <Col span={18}>
                                                      <h3
                                                        style={{color: 'white'}}>{this.state.selectedEpisode.name}</h3>
                                                      <p>{this.state.selectedEpisode.overview}</p>
                                                      {
                                                          this.state.selectedEpisode.downloaded
                                                            ?
                                                            <ReactPlayer
                                                              url={`${url}/show/stream/${this.state.selectedEpisode.id}?token=${this.state.token}`}
                                                              playing={true}
                                                              controls
                                                              width={''}
                                                              height={''}
                                                              config={{
                                                                  file: {
                                                                      tracks: [
                                                                          {
                                                                              kind: 'subtitles',
                                                                              src: `${url}/show/stream/subtitle/${this.state.selectedEpisode.id}/en?token=${this.state.token}`,
                                                                              srcLang: 'en',
                                                                              default: true
                                                                          },
                                                                          {
                                                                              kind: 'subtitles',
                                                                              src: `${url}/show/stream/subtitle/${this.state.selectedEpisode.id}/nl?token=${this.state.token}`,
                                                                              srcLang: 'nl',
                                                                              default: true
                                                                          },
                                                                      ],
                                                                      attributes: {crossOrigin: 'anonymous'}
                                                                  },
                                                              }}
                                                            />
                                                            : !_.isEmpty(this.state.selectedEpisode.torrent) &&
                                                            <Button onClick={this.download}
                                                                    color={'primary'}
                                                                    loading={this.state.downloading}
                                                            >
                                                                Download
                                                            </Button>
                                                      }
                                                  </Col>
                                              </Row>
                                          </List.Item>
                                      </List>
                                      }
                                  </Col>
                              </Row>
                          </Col>
                      </Row>
                  </Card>
              </Col>
          </Row>
        );
    }
}

export default Show;
