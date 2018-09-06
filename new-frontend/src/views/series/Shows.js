import React, {Component} from 'react';
import axios from "axios";
import InfiniteScroll from 'react-infinite-scroller';
import {Row, List, Spin} from "antd";
import {Link} from "react-router-dom";

class Shows extends Component {
    state = {
        shows: []
    };

    async componentWillMount() {
        const {data: shows} = await axios.get("https://tv-v2.api-fetch.website/shows/1?sort=trending&order=-1");
        this.setState({shows})
    }

    loadMore = async (page) => {
        const {data: shows} = await axios.get(`https://tv-v2.api-fetch.website/shows/${page}?sort=trending&order=-1`);
        this.setState({shows: [...this.state.shows, ...shows]})
    };

    renderSeries = () => {
        return(
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
                  dataSource={this.state.shows}
                  renderItem={show => {
                      return (
                        <List.Item>
                            <Link to={`${this.props.match.url}/${show.imdb_id}`}>
                                <div
                                  style={{
                                      backgroundImage: `url(${show.images.poster})`,
                                      height: 220,
                                      width: 140,
                                      backgroundSize: 'cover',
                                      marginBottom: 20,
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

    render() {
        return(
          <Row>
              <div style={{marginTop: 15}}>
                  {
                     this.renderSeries()
                  }
              </div>
          </Row>
        )
    }
}

export default Shows
