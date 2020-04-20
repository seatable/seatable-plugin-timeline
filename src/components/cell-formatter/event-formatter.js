import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  label: PropTypes.string,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
  formatterStyle: PropTypes.object,
};

class EventFormatter extends React.Component {

  render() {
    let { label, bgColor, textColor, formatterStyle } = this.props;
    formatterStyle = formatterStyle || {};
    let cellFormatterStyle = {
      backgroundColor: bgColor,
      color: textColor,
      ...formatterStyle,
    }
    return (
      <div className="cell-formatter grid-cell-type-single-select d-flex align-items-center" style={cellFormatterStyle}>
        <span className="d-inline-block">{label}</span>
      </div>
    );
  }
}

EventFormatter.propTypes = propTypes;

export default EventFormatter;
