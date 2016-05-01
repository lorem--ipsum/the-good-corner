import React from 'react';
export default class Banner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      tempQueries: []
    };
  }

  toggle() {
    this.setState({isOpen: !this.state.isOpen});
  }

  handleQueriesChange(event) {
    this.setState({tempQueries: event.target.value.split('\n')});
  }

  onSave() {
    this.props.onChange(this.state.tempQueries);
    this.setState({isOpen: false});
  }

  onCancel() {
    this.setState({isOpen: false});
  }

  componentDidMount() {
    var queries = this.props.queries;

    if (!queries || queries.length === 0) {
      this.setState({tempQueries: []});
      return;
    }

    this.setState({tempQueries: queries});
  }

  render() {
    var drawerClasses = ['drawer'];

    if (this.state.isOpen) {
      drawerClasses.push('open');
    } else {
      drawerClasses.push('closed');
    }

    return (
      <div className="banner">
        <div className="row header">
          <div className="col-20"></div>
          <div className="col-60 center light">The Good Corner</div>
          <div className="col-20 right">
            <i className={this.state.isOpen ? 'fa fa-remove' : 'fa fa-gear'} onClick={this.toggle.bind(this)}></i>
          </div>
        </div>
        <div className={drawerClasses.join(' ')}>
          <textarea
            value={this.state.tempQueries.join('\n')}
            onChange={this.handleQueriesChange.bind(this)}
          ></textarea>
          <div className="row buttons">
            <div className="col-100 right">
              <button className="secondary light" onClick={this.onCancel.bind(this)}>Cancel</button>
              <button className="primary light" onClick={this.onSave.bind(this)}>Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
