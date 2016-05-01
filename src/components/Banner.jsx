import React from 'react';
export default class Banner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: true
    };
  }

  toggle() {
    this.setState({isOpen: !this.state.isOpen});
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
          <textarea></textarea>
          <div className="row buttons">
            <div className="col-100 right">
              <button className="secondary light">Cancel</button>
              <button className="primary light">Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
