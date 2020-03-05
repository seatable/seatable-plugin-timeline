import React from 'react';
import { zIndexs } from '../../constants';
import PropTypes from 'prop-types';

const propTypes = {
  label: PropTypes.string,
  bgColor: PropTypes.string,
  width: PropTypes.number,
  left: PropTypes.number,
};

class SingleSelectFormatter extends React.Component {

  render() {
    let { label, bgColor, width, left } = this.props;
    let style = {
      backgroundColor: bgColor,
      width,
      left,
      zIndex: zIndexs.EVENT_CELL
    };
    return (
      <div className="cell-formatter grid-cell-type-single-select position-absolute" style={style}>
        <span className="d-inline-block" title={label}>{label}</span>
      </div>
    );
  }
}

SingleSelectFormatter.propTypes = propTypes;

export default SingleSelectFormatter;
