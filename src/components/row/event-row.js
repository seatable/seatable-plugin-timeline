import React from 'react';
import PropTypes from 'prop-types';
import { ROW_HEIGHT } from '../../constants';

class EventRow extends React.Component {

  render() {
    let { cells } = this.props;
    return (
      <div className="timeline-row" style={{height: ROW_HEIGHT}}>
        {cells}
      </div>
    );
  }
}

EventRow.propTypes = {
  cells: PropTypes.object,
};

export default EventRow;