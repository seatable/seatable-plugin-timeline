import React from 'react';
import PropTypes from 'prop-types';
import { HEADER_HEIGHT } from '../../constants';

const propTypes = {
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
    let { overScanDates, renderedDates, columnWidth, startOffset, endOffset, renderHeaderYears, renderHeaderDates } = this.props;
    let headerStyle = {
      width: overScanDates.length * columnWidth + startOffset + endOffset,
      height: HEADER_HEIGHT,
      paddingLeft: startOffset,
      paddingRight: endOffset
    };
    return (
      <div className="timeline-header" style={headerStyle}>
        {renderHeaderYears({overScanDates, renderedDates, columnWidth})}
        {renderHeaderDates({overScanDates, renderedDates, columnWidth, startOffset, endOffset})}
      </div>
    );
  }
}

TimelineHeader.propTypes = propTypes;

export default TimelineHeader;
