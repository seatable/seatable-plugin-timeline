import React from 'react';
import PropTypes from 'prop-types';
import { handleEnterKeyDown } from '../../utils/common-utils';

const propTypes = {
  label: PropTypes.string,
  bgColor: PropTypes.string,
  textColor: PropTypes.string,
  formatterStyle: PropTypes.object,
  canEventDateBeChanged: PropTypes.bool,
  onEventMouseDown: PropTypes.func,
};

class EventFormatter extends React.Component {

  render() {
    let { label, bgColor, textColor, formatterStyle, canEventDateBeChanged, onEventMouseDown } = this.props;
    formatterStyle = formatterStyle || {};
    let cellFormatterStyle = {
      backgroundColor: bgColor,
      color: textColor,
      ...formatterStyle,
    };
    return (
      <div 
        className="cell-formatter grid-cell-type-single-select" 
        style={cellFormatterStyle}
        tabIndex={0}
        onKeyDown={canEventDateBeChanged && handleEnterKeyDown(onEventMouseDown)}
        aria-label={label}
      >
        <span className="d-inline-block">{label}</span>
      </div>
    );
  }
}

EventFormatter.propTypes = propTypes;

export default EventFormatter;
