import React from 'react';
export default class Card extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var item = this.props.item;

    var thumbnailClasses = ['thumbnail'];
    if (!item.thumbnail) {
      thumbnailClasses.push('empty');
    }

    var lastUpdate = item.lastUpdate;

    return (
      <div className="card">
        <div className="row">
          <div className="col-20 right">
            <div className={thumbnailClasses.join(' ')}>
              <a target="_blank" className="link" href={item.url}>
                <div className="outer">
                  <div className="inner">
                    <img src={item.thumbnail}></img>
                  </div>
                </div>
              </a>
              <span className="imageCount">{item.imageCount}</span>
            </div>
          </div>
          <div className="col-80 infos">
            <div className="row">
              <div className="col-50">
                <div className="location">{item.location}</div>
              </div>
              <div className="col-50 right">
                <div className="last-update">
                  <div className="absolute">{lastUpdate.label}</div>
                  <div className="relative">{lastUpdate.relativeLabel}</div>
                </div>
              </div>
            </div>

            <div className="title">{item.title}</div>
            <div className="row price-and-actions">
              <div className="col-50">
                <div className="price"><span>{item.price}</span></div>
              </div>
              <div className="col-50 right">
                <a target="_blank" className="link" href={item.url}><i className="fa fa-external-link"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
