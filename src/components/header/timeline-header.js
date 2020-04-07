import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  headerHeight: PropTypes.number,
  rows: PropTypes.array,
  overscanDates: PropTypes.array,
  columnWidth: PropTypes.number,
  startOffset: PropTypes.number,
  endOffset: PropTypes.number,
  renderHeaderDates: PropTypes.func,
};

class TimelineHeader extends React.Component {

  render() {
    let { overscanDates, headerHeight, rows, columnWidth, startOffset, endOffset, renderHeaderYears, renderHeaderDates } = this.props;
    let headerStyle = {
      width: overscanDates.length * columnWidth + startOffset + endOffset,
      height: headerHeight,
      paddingLeft: startOffset,
      paddingRight: endOffset
    };
    return (
      <div className="timeline-header" style={headerStyle}>
        {renderHeaderYears({overscanDates, columnWidth})}
        {renderHeaderDates({overscanDates, rows, columnWidth, startOffset, endOffset})}
      </div>
    );
  }
}

TimelineHeader.propTypes = propTypes;

export default TimelineHeader;