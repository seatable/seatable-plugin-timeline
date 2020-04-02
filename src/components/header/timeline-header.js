import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  selectedGridView: PropTypes.string,
  rows: PropTypes.array,
  overscanDates: PropTypes.array,
  columnWidth: PropTypes.number,
  startOffset: PropTypes.number,
  endOffset: PropTypes.number,
  renderHeaderDates: PropTypes.func,
};

class TimelineHeader extends React.Component {

  render() {
    let { overscanDates, rows, columnWidth, startOffset, endOffset, renderHeaderDates } = this.props;
    let headerStyle = {
      width: overscanDates.length * columnWidth + startOffset + endOffset,
      paddingLeft: startOffset,
      paddingRight: endOffset
    };
    return (
      <div className="timeline-header" style={headerStyle}>
        {renderHeaderDates({overscanDates, rows, columnWidth, startOffset, endOffset})}
      </div>
    );
  }
}

TimelineHeader.propTypes = propTypes;

export default TimelineHeader;