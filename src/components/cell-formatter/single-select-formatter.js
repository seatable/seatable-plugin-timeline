import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  label: PropTypes.string,
  bgColor: PropTypes.string,
  start: PropTypes.string,
  end: PropTypes.string,
};

class SingleSelectFormatter extends React.Component {

  render() {
    let { label, bgColor, start, end } = this.props;
    return (
      <div className="cell-formatter grid-cell-type-single-select d-flex align-items-center" style={{backgroundColor: bgColor}}>
        <span className="d-inline-block" title={`${label}(${start} - ${end})`}>{label}</span>
      </div>
    );
  }
}

SingleSelectFormatter.propTypes = propTypes;

export default SingleSelectFormatter;
