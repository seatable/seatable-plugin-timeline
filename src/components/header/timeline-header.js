import React from 'react';
import PropTypes from 'prop-types';
import { COLUMN_WIDTH } from '../../constants';

const propTypes = {
  rows: PropTypes.array,
  overscanDates: PropTypes.array,
};

class TimelineHeader extends React.Component {

  render() {
    let { overscanDates, rows, startOffset, endOffset, renderHeaderDates} = this.props;
    let headerStyle = {
      width: overscanDates.length * COLUMN_WIDTH + startOffset + endOffset,
      paddingLeft: startOffset,
      paddingRight: endOffset
    };
    return (
      <div className="timeline-header" style={headerStyle}>
        {renderHeaderDates({overscanDates, rows, startOffset, endOffset})}
      </div>
    );
  }
}

TimelineHeader.propTypes = propTypes;

export default TimelineHeader;