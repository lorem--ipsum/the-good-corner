import React from 'react';
export default class Card extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var thumbnailClasses = ['thumbnail'];
    if (!this.props.item.thumbnail) {
      thumbnailClasses.push('empty');
    }

    var lastUpdate = this.props.item.lastUpdate;

    return (
      <div className="card">
        <div className="row">
          <div className="col-20 middle">
            <div className={thumbnailClasses.join(' ')}>
              <img src={this.props.item.thumbnail}></img>
            </div>
          </div>
          <div className="col-80 infos">
            <div className="row">
              <div className="col-50">
                <div className="location">{this.props.item.location}</div>
              </div>
              <div className="col-50 right">
                <div className="last-update">
                  <div className="absolute">{lastUpdate.label}</div>
                  <div className="relative">{lastUpdate.relativeLabel}</div>
                </div>
              </div>
            </div>

            <div className="title">{this.props.item.title}</div>
            <div className="row price-and-actions">
              <div className="col-50">
                <div className="price"><span>{this.props.item.price}</span></div>
              </div>
              <div className="col-50 right">
                <a target="_blank" className="link" href={this.props.item.url}><i className="fa fa-external-link"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
