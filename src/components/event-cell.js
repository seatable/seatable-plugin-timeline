import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  colorColumnKey: PropTypes.string,
  formatter: PropTypes.node,
  style: PropTypes.object,
  index: PropTypes.number,
  row: PropTypes.object,
  onRowExpand: PropTypes.func,
};

class EventCell extends React.Component {

  onRowExpand = (evt) => {
    evt.preventDefault();
    let { index, row, onRowExpand } = this.props;
    if (onRowExpand) {
      let { _id } = row || {};
      let target = `timeline_event_cell_${index}_${_id}`;
      onRowExpand(evt, row, target);
    }
  }

  render() {
    let { index, row, formatter, style } = this.props;
    let { _id } = row || {};
    let eventCellStyle = {
      ...style
    };
    return (
      <div
        className="timeline-event-cell d-flex align-items-center"
        id={`timeline_event_cell_${index}_${_id}`}
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