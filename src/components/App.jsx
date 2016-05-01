import React from 'react';
import qwest from 'qwest';

import Banner from './Banner.jsx';
import Card from './Card.jsx';
import Loader from './Loader.jsx';

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      queries: [
        'https://www.leboncoin.fr/locations/offres/bretagne/finistere/?th=1&mrs=600&mre=950&ret=1',
        'https://www.leboncoin.fr/motos/offres/bretagne/finistere/29/?th=1&pe=7&ccs=600'
      ]
    };
  }

  queriesChanged(queries) {
    this.setState({queries: queries}, this.loadData);
  }

  componentDidMount() {
    this.loadData();
  }

  loadData(queries) {
    this.setState({isLoading: true});

    var queries = this.state.queries;

    if (!queries || queries.length === 0) {
      this.state.items = [];
      return;
    }

    var that = this;

    qwest.post('/results', {queries: queries}).then(function(xhr, response) {
      that.setState({
        isLoading: false,
        items: response.data
          .reduce(function(a, b) {return a.concat(b.results);}, [])
          .map(function(item) {
            item.lastUpdate.date = new Date(item.lastUpdate.ISOString);
            return item;
          })
          .sort(function(a, b) { return b.lastUpdate.date.getTime() - a.lastUpdate.date.getTime(); })
      });
    });
  }

  render() {
    return (
      <div className="content">
        <Banner queries={this.state.queries} onChange={this.queriesChanged.bind(this)}></Banner>
        <div className="items">
          <div className="prout">
            { this.state.items.map(function(item, i) {
                return <Card item={item} key={item.id}></Card>
            }) }
          </div>
        </div>
        <div className="footer"></div>
        <Loader isLoading={this.state.isLoading}/>
      </div>
    );
  }
}
