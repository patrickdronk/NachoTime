import React, {Component} from 'react';
import {PanelHeader} from '../../components';
import {Button, Card, CardHeader, Col, Row} from "reactstrap";
import axios from "axios/index";
import ReactLoading from 'react-loading';
import ReactPlayer from 'react-player'

class Movie extends Component {
  constructor(props) {
    super(props);
    this.state = {loading: true}
  }

  async componentWillMount() {
    const {id} = this.props.match.params;
    const {data} = await axios.get(`https://tv-v2.api-fetch.website/movie/${id}?sort=trending&order=-1`);
    let movieDownloaded;
    try {
      await axios.get(`http://localhost:3333/movie/${this.props.match.params.id}`);
      movieDownloaded = true;
    } catch (e) {
      movieDownloaded = false;
    }
    this.setState({movie: data, loading: false, movieDownloaded})
  }

  download = async () => {
    await axios.get(`http://localhost:3333/download/${this.props.match.params.id}`)
  };

  render() {
    const {id} = this.props.match.params;
    const {movie} = this.state;
    if (this.state.loading) {
      return (
        <div className={'d-flex justify-content-center'} style={{marginTop: 20}}>
          <ReactLoading type={'spin'} color={'#2ba8ff'} height={667} width={100}/>
        </div>
      )
    }

    return (
      <div>
        <PanelHeader size="sm"/>
        <div className="content">
          <Row>
            <Col md={12}>
              <Card style={{
                backgroundImage: `url(${movie.images.fanart.replace('w500', 'original')})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}>
                <div>
                  <CardHeader style={{backgroundColor: '#000000ad'}}>
                    <Row>
                      <Col xs={6} sm={3} md={2}>
                        <img src={movie.images.banner} alt={'poster'}/>
                      </Col>
                      <Col xs={12} md={10}>
                        <h5 className="title" style={{color: 'white'}}>{movie.title}</h5>
                        <p style={{color: 'white'}}>{movie.synopsis}</p>
                        {this.state.movieDownloaded
                          ? <ReactPlayer url={`http://localhost:3333/movie/stream/${id}`}
                                         playing
                                         controls
                                         width={''}
                                         height={''}
                                         config={{
                                           file: {
                                             tracks: [
                                               {
                                                 kind: 'subtitles',
                                                 src: `http://localhost:3333/movie/stream/subtitle/${id}`,
                                                 srcLang: 'nl',
                                                 default: true
                                               },
                                             ],
                                             attributes: {crossOrigin: 'anonymous'}

                                           },
                                         }}
                          />
                          : <Button onClick={this.download} color={'primary'}>Download</Button>
                        }


                      </Col>
                    </Row>
                  </CardHeader>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default Movie;
