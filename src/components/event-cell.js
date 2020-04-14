import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  colorColumnKey: PropTypes.string,
  formatter: PropTypes.node,
  style: PropTypes.object,
  id: PropTypes.string,
  row: PropTypes.object,
  onRowExpand: PropTypes.func,
};

class EventCell extends React.Component {

  onRowExpand = (evt) => {
    evt.preventDefault();
    let { id, row, onRowExpand } = this.props;
    if (onRowExpand) {
      onRowExpand(evt, row, id);
    }
  }

  render() {
    let { id, formatter, style } = this.props;
    let eventCellStyle = {
      ...style
    };
    return (
      <div
        className="timeline-event-cell d-flex align-items-center"
        id={id || ''}
        style={eventCellStyle}
        onClick={this.onRowExpand}
      >
        {formatter}
      </div>
    )
  }
}

EventCell.propTypes = propTypes;

export default EventCell;