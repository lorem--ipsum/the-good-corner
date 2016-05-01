import React from 'react';
export default class Loader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var classNames = ['loader'];

    if (this.props.isLoading) {
      classNames.push('visible');
    }

    return (
      <div className={classNames.join(' ')}>
        <div className="label light">Chargement...</div>
      </div>
    );
  }
}
