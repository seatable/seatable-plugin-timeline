import React from 'react';
import PropTypes from 'prop-types';
import HeaderRange from './header-range';
import HeaderDays from './header-days';
import { COLUMN_WIDTH } from '../../constants'

const propTypes = {
  isToday: PropTypes.bool,
  dayOfToday: PropTypes.string,
  days: PropTypes.array,
  rows: PropTypes.array,
};

class TimelineHeader extends React.Component {

  render() {
    let { isToday, dayOfToday, days, rows } = this.props;
    let headerStyle = {
      minWidth: days.length * COLUMN_WIDTH
    }
    return (
      <div className="timeline-header" style={headerStyle}>
        <HeaderRange
          days={days}
        />
        <HeaderDays
          isToday={isToday}
          dayOfToday={dayOfToday}
          days={days}
          rows={rows}
        />
      </div>
    );
  }
}

TimelineHeader.propTypes = propTypes;

export default TimelineHeader;