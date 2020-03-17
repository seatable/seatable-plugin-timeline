import React from 'react';
import PropTypes from 'prop-types';
import { ROW_HEIGHT } from '../constants';

const propTypes = {
  cells: PropTypes.array,
};

class EventRow extends React.Component {

  render() {
    let { cells, style } = this.props;
    return (
      <div className="timeline-row position-relative" style={{height: ROW_HEIGHT, ...style}}>
        {cells}
      </div>
    );
  }
}

EventRow.propTypes = propTypes;

export default EventRow;