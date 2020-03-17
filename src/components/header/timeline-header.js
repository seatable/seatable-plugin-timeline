import React from 'react';
import PropTypes from 'prop-types';
import { COLUMN_WIDTH } from '../../constants';

const propTypes = {
  isToday: PropTypes.bool,
  rows: PropTypes.array,
  overscanDays: PropTypes.array,
};

class TimelineHeader extends React.Component {

  render() {
    let { isToday, overscanDays, rows, startOffset, endOffset, renderHeaderDays} = this.props;
    let headerStyle = {
      width: overscanDays.length * COLUMN_WIDTH + startOffset + endOffset,
      paddingLeft: startOffset,
      paddingRight: endOffset
    };
    return (
      <div className="timeline-header" style={headerStyle}>
        {renderHeaderDays({isToday, overscanDays, rows, startOffset, endOffset})}
      </div>
    );
  }
}

TimelineHeader.propTypes = propTypes;

export default TimelineHeader;