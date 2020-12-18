import React from 'react';
import PropTypes from 'prop-types';

class EventCell extends React.PureComponent {

  onRowExpand = (evt) => {
    evt.preventDefault();
    let { id, row, onRowExpand } = this.props;
    if (onRowExpand) {
      onRowExpand(evt, row, id);
    }
  }

  render() {
    let { id, formatter, style, title } = this.props;
    let eventCellStyle = {
      ...style
    };
    return (
      <div
        className="timeline-event-cell d-flex align-items-center"
        id={id || ''}
        style={eventCellStyle}
        title={title}
        onClick={this.onRowExpand}
      >
        {formatter}
      </div>
    );
  }
}

EventCell.propTypes = {
  colorColumnKey: PropTypes.string,
  formatter: PropTypes.node,
  style: PropTypes.object,
  id: PropTypes.string,
  row: PropTypes.object,
  title: PropTypes.string,
  onRowExpand: PropTypes.func,
};

export default EventCell;