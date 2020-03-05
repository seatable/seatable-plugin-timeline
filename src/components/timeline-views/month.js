import React from 'react';
import PropTypes from 'prop-types';
import TimelineHeader from '../header/timeline-header';
import ViewportRight from '../timeline-viewport/viewport-right';
import { dates } from '../../utils';

const propTypes = {
  isToday: PropTypes.bool,
  days: PropTypes.array,
  rows: PropTypes.array,
  minWidth: PropTypes.number,
  selectedDate: PropTypes.string,
  startDateOfMonth: PropTypes.string,
};

class Month extends React.Component {
  
  constructor(props) {
    super(props);
    this.dayOfToday = dates.getToday('D');
  }

  setScroll = ({scrollLeft, scrollTop}) => {
    this.viewportRight.setScroll({scrollLeft, scrollTop});
  }

  render() {
    let { isToday, days, rows, minWidth, selectedDate, startDateOfMonth } = this.props;
    return (
      <div className="timeline-month-view" ref={ref => this.gridView = ref}>
        <TimelineHeader
          isToday={isToday}
          days={days}
          rows={rows}
          minWidth={minWidth}
          dayOfToday={this.dayOfToday}
        />
        <ViewportRight
          ref={node => this.viewportRight = node}
          isToday={isToday}
          days={days}
          rows={rows}
          selectedDate={selectedDate}
          minWidth={minWidth}
          startDateOfMonth={startDateOfMonth}
          dayOfToday={this.dayOfToday}
          onViewportRightScroll={this.props.onViewportRightScroll}
        />
      </div>
    );
  }
}

Month.propTypes = propTypes;

export default Month;