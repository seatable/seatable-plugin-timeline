import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  label: PropTypes.string,
  bgColor: PropTypes.string,
  start: PropTypes.string,
  end: PropTypes.string,
};

class EventFormatter extends React.Component {

  render() {
    let { label, bgColor, start, end } = this.props;
    return (
      <div className="cell-formatter grid-cell-type-single-select d-flex align-items-center" style={{backgroundColor: bgColor}}>
        <span className="d-inline-block" title={`${label}(${start} - ${end})`}>{label}</span>
      </div>
    );
  }
}

EventFormatter.propTypes = propTypes;

export default EventFormatter;
