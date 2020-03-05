import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  formatter: PropTypes.func,
  value: PropTypes.string,
};

class EventCell extends React.Component {
  render() {
    let { formatter: Formatter, value } = this.props;
    let cellContent = <Formatter value={value} />
    return (
      <div className="timeline-event-cell">
        {cellContent}
      </div>
    )
  }
}

EventCell.propTypes = propTypes;

export default EventCell;