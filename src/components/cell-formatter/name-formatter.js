import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  value: PropTypes.string,
};

class NameFormatter extends React.Component {

  render() {
    let { value } = this.props;
    return (
      <div className="cell-formatter grid-cell-type-name">
        <span className="d-inline-block">{value}</span>
      </div>
    );
  }
}

NameFormatter.propTypes = propTypes;

export default NameFormatter;
