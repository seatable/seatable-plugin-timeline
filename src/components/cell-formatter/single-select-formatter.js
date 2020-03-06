import React from 'react';
import { zIndexs } from '../../constants';
import PropTypes from 'prop-types';

const propTypes = {
  label: PropTypes.string,
  bgColor: PropTypes.string,
  width: PropTypes.number,
  left: PropTypes.number,
  start: PropTypes.string,
  end: PropTypes.string,
};

class SingleSelectFormatter extends React.Component {

  render() {
    let { label, bgColor, width, left, start, end } = this.props;
    let style = {
      backgroundColor: bgColor,
      width,
      left,
      zIndex: zIndexs.EVENT_CELL
    };
    return (
      <div className="cell-formatter grid-cell-type-single-select position-absolute" style={style}>
        <span className="d-inline-block" title={`${label}(${start} - ${end})`}>{label}</span>
      </div>
    );
  }
}

SingleSelectFormatter.propTypes = propTypes;

export default SingleSelectFormatter;
