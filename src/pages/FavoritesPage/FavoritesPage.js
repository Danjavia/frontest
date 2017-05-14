/**
 * External Resources
 **/
import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Tag from 'antd/lib/tag';
import Icon from 'antd/lib/icon';
import Affix from 'antd/lib/affix';

/**
 * Internal Resources
 **/
import App from '../../components/App/App';
import './FavoritesPage.css';

/**
 * Sample class definition
 **/
export default class FavoritesPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: {},
      repos: [],
      loading: false
    }
  }

  searchRepos() {

    if (this.refs.gitUser.refs.input.value === '') {
      return;
    }

    this.setState({loading: true});

    // Assign user for get their repos
    const gitUSer = this.refs.gitUser.refs.input.value;

    // prepare data, use data key!
    let query = JSON.stringify({
      query: `query {
        user(login: "${gitUSer}") {
          bio
          url
          company
          email
          avatarUrl
          name
          followers(last: 100) {
            totalCount
          }
          websiteUrl
          starredRepositories(last: 100) {
            totalCount
          }
          repositories(last: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
            edges {
              node {
                id
                name
                description
                url
                primaryLanguage {
                  name
                  color
                }
              }
            }
          }
        }
      }`
    });

    // use the github endpoint
    fetch(process.env.REACT_APP_GRAPHQL_GITHUB_ENDPOINT, {
      method: 'POST',
      body: query,
      headers: {
        "Authorization": process.env.REACT_APP_GITHUB_TOKEN
      }
    }).then(response => {
      return response.json()
    }).then(res => {
      console.log(res);
      this.setState({
        user: res.data ? res.data.user : null,
        repos: res.data && res.data.user && res.data.user.repositories ? res.data.user.repositories : [],
        loading: false
      })
    })
  }

  /**
   * render
   * @return {ReactElement} markup
   * */
  render() {
    const avatar = this.state.user && this.state.user.avatarUrl ? this.state.user.avatarUrl : 'https://s-media-cache-ak0.pinimg.com/originals/1c/7f/f6/1c7ff63a835410d8b31bce5f823cd401.jpg';

    return (
      <App>
        <div className="favorites-page">
          <div className="favorites-page__hero">
            <div className="favorites-page__search">
              <nav>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/">Logout</Link>
              </nav>
              <h1>My Favorites</h1>
              <Input placeholder="Enter repository name" ref="gitUser" />
              <Button onClick={this.searchRepos.bind(this)}>Search Repositories</Button>
            </div>
          </div>

          {this.state.loading ?
            <div className="flex"><h2>Loading...</h2></div> :
            this.state.user && this.state.user.repositories ? <div className="favorites-page__results">
              <section className="favorites-page__repos">
                {this.state.repos.edges ? this.state.repos.edges.map((repo, key) => {
                    repo = repo.node;
                    return (
                      <Card style={{ width: '30%', margin: 10 }} bodyStyle={{ padding: 0 }} key={key}>
                        <div className="custom-card">
                          <div className="favorites-page__tags">
                            {repo.primaryLanguage && <Tag color={repo.primaryLanguage.color}>{repo.primaryLanguage.name}</Tag>}
                            <Icon type="heart-o" />
                          </div>
                          <h3>
                            <a href={repo.url} target="_blank">{repo.name}</a>
                          </h3>
                          <p>{repo.description || 'This repo have not description.'}</p>
                        </div>
                      </Card>
                    );
                  }) : null}
              </section>

              <Affix offsetTop={120} style={{width: '35%'}}>
                <aside className="favorites-page__user">
                  {this.state.user.avatarUrl && <img src={avatar} alt="avatar" className="favorites-page__avatar"/>}
                  <div className="favorites-page__user__info">
                    <h4>{this.state.user.name}</h4>
                    <div>{this.state.user.bio}</div>
                    {this.state.user.starredRepositories && <span> <Icon type="star-o" /> {this.state.user.starredRepositories.totalCount}</span>}
                    {this.state.user.followers && <span> <Icon type="heart-o" /> {this.state.user.followers.totalCount}</span>}
                    {this.state.user.websiteUrl && <span> <Icon type="global" /> <a href={this.state.user.websiteUrl} target="_blank">Website</a></span>}
                  </div>
                </aside>
              </Affix>
            </div> : this.state.user == null ? <div className="flex"><h2>User doesn't exist at Github</h2></div> : <div className="flex"><h2>No repos yet</h2></div>}
        </div>
      </App>
    );
  }
}
