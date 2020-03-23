import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  formatter: PropTypes.node,
  style: PropTypes.object,
};

class EventCell extends React.Component {
  render() {
    let { formatter, style } = this.props;
    let eventCellStyle = {
      ...style
    };
    return (
      <div className="timeline-event-cell d-flex align-items-center" style={eventCellStyle}>
        {formatter}
      </div>
    )
  }
}

EventCell.propTypes = propTypes;

export default EventCell;