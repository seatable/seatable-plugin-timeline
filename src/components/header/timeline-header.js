import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  headerHeight: PropTypes.number,
  renderedRows: PropTypes.array,
  overScanDates: PropTypes.array,
  renderedDates: PropTypes.array,
  columnWidth: PropTypes.number,
  startOffset: PropTypes.number,
  endOffset: PropTypes.number,
  renderHeaderDates: PropTypes.func,
};

class TimelineHeader extends React.Component {

  render() {
    let { overScanDates, renderedDates, headerHeight, renderedRows, columnWidth, startOffset, endOffset, renderHeaderYears, renderHeaderDates } = this.props;
    let headerStyle = {
      width: overScanDates.length * columnWidth + startOffset + endOffset,
      height: headerHeight,
      paddingLeft: startOffset,
      paddingRight: endOffset
    };
    return (
      <div className="timeline-header" style={headerStyle}>
        {renderHeaderYears({overScanDates, renderedDates, columnWidth})}
        {renderHeaderDates({overScanDates, renderedDates, renderedRows, columnWidth, startOffset, endOffset})}
      </div>
    );
  }
}

TimelineHeader.propTypes = propTypes;

export default TimelineHeader;