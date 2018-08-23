import React, {Component} from 'react';
import {Col, Row, Input, List, Spin} from "antd";
import axios from "axios";
import InfiniteScroll from 'react-infinite-scroller';
import {Link} from "react-router-dom";
import {Select} from 'antd';

const url = process.env.REACT_APP_API_SERVER;
const Option = Select.Option;
const Search = Input.Search;
const genres = [
    'all',
    'action',
    'adventure',
    'animation',
    'comedy',
    'crime',
    'disaster',
    'documentary',
    'drama',
    'eastern',
    'family',
    'fan-film',
    'fantasy',
    'film-noir',
    'history',
    'holiday',
    'horror',
    'indie',
    'music',
    'mystery',
    'none',
    'road',
    'romance',
    'science-fiction',
    'short',
    'sports',
    'sporting-event',
    'suspense',
    'thriller',
    'tv-movie',
    'war',
    'western'
];

class Movies extends Component {
    state = {movies: [], query: '', searchResult: [], token: sessionStorage.getItem('token')};

    async componentWillMount() {

        const {data} = await axios.get("https://tv-v2.api-fetch.website/movies/1?sort=trending&order=-1");
        const {data: downloadedMovies} = await axios.get(`${url}/movies`, {
            headers: { Authorization: "Bearer " + this.state.token }
        });

        const movies = data.map(movie => {
            downloadedMovies.forEach(downloadedMovie => {
                if (!movie.downloaded) {
                    movie.downloaded = movie._id === downloadedMovie.imdb_id;
                }
            });
            return movie;
        });

        this.setState({movies})
    }

    search = async (query) => {
        if (query.length === 0) {
            this.loadMore(1);
            this.setState({searchResult: []});
        } else {
            const {data} = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=096bba66f505e38c48ce8f5966fab7f8&language=en-US&query=${query}&page=1`)
            this.setState({searchResult: data.results});
        }
    };

    loadMore = async (page) => {
        const genre = this.state.genre ? `&genre=${this.state.genre}` : '';
        const {data} = await axios.get(`https://tv-v2.api-fetch.website/movies/${page}?sort=trending&order=-1${genre}`);
        const {data: downloadedMovies} = await axios.get(`${url}/movies`, {
            headers: { Authorization: "Bearer " + this.state.token }
        });

        const movies = data.map(movie => {
            downloadedMovies.forEach(downloadedMovie => {
                if (!movie.downloaded) {
                    movie.downloaded = movie._id === downloadedMovie.imdb_id;
                }
            });
            return movie;
        });

        this.setState({movies: [...this.state.movies, ...movies]})
    };

    renderMovies = () => {
        return (
          <div style={{height: '700px', overflow: 'auto'}}>
              <InfiniteScroll
                pageStart={1}
                loadMore={this.loadMore}
                hasMore={true}
                loader={<Spin key={0}/>}
                useWindow={false}
              >
                  <List
                    grid={{gutter: 12, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 8}}
                    dataSource={this.state.movies}
                    renderItem={movie => {
                        let opacity = 0.2;
                        if (movie.downloaded) {
                            opacity = 1.0
                        }
                        return (
                          <List.Item>
                              <Link to={`${this.props.match.url}/${movie.imdb_id}`}>
                                  <div
                                    style={{
                                        backgroundImage: `url(${movie.images.poster})`,
                                        height: 220,
                                        width: 140,
                                        backgroundSize: 'cover',
                                        marginBottom: 20,
                                        opacity: opacity
                                    }}
                                  >
                                  </div>
                              </Link>
                          </List.Item>
                        )
                    }}
                  />
              </InfiniteScroll>
          </div>
        )
    };

    navigate = async (movie_id) => {
        const {data: {imdb_id}} = await axios.get(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=096bba66f505e38c48ce8f5966fab7f8&language=en-US`);
        this.props.history.push(`/movies/${imdb_id}`);
    };

    renderSearchResults = () => {
        return (
          <List
            grid={{gutter: 18, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 8}}
            dataSource={this.state.searchResult}
            renderItem={movie => {
                console.log(movie);
                let opacity = 1.0;
                return (
                  <List.Item>
                      <div onClick={() => this.navigate(movie.id)}
                           style={{
                               backgroundImage: `url(https://image.tmdb.org/t/p/w300_and_h450_bestv2/${movie.poster_path})`,
                               height: 220,
                               width: 140,
                               backgroundSize: 'cover',
                               marginBottom: 20,
                               opacity: opacity
                           }}>
                      </div>
                  </List.Item>
                )
            }}
          />
        );
    };

    genreChanged = async (genre) => {
        this.setState({genre, query: ''});
        const {data} = await axios.get(`https://tv-v2.api-fetch.website/movies/${1}?sort=trending&order=-1&genre=${genre}`);
        const {data: downloadedMovies} = await axios.get(`${url}/movies`, {
            headers: { Authorization: "Bearer " + this.state.token }
        });

        const movies = data.map(movie => {
            downloadedMovies.forEach(downloadedMovie => {
                if (!movie.downloaded) {
                    movie.downloaded = movie._id === downloadedMovie.imdb_id;
                }
            });
            return movie;
        });

        this.setState({movies: movies, searchResult: []})
    };

    render() {
        return (
          <div>
              <Row>
                  <Col>
                      <Row>
                          <Col>
                              <h1>Movies</h1>
                          </Col>
                      </Row>
                      <Row gutter={16} type="flex" justify="end">
                          <Col xs={12} md={9} xl={5}>
                              <Select defaultValue="all" onChange={this.genreChanged} style={{width: '100%'}}>
                                  {
                                      genres.map((genre) => {
                                          return (
                                            <Option key={genre} value={genre}>{genre}</Option>
                                          )
                                      })
                                  }
                              </Select>
                          </Col>
                          <Col xs={12} md={9} xl={5}>
                              <Search
                                value={this.state.query}
                                onSearch={this.search}
                                onChange={(e)=> this.setState({query: e.target.value})}
                                enterButton
                              />
                          </Col>
                      </Row>
                      <Row>
                          <div style={{marginTop: 15}}>
                              {
                                  this.state.searchResult.length > 0 ? this.renderSearchResults() : this.renderMovies()
                              }
                          </div>
                      </Row>
                  </Col>
              </Row>
          </div>
        );
    }
}

export default Movies;
