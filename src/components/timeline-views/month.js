import React from 'react';
import PropTypes from 'prop-types';
import TimelineHeader from '../header/timeline-header';
import ViewportRight from '../timeline-viewport/viewport-right';
import { dates } from '../../utils';

const propTypes = {
  isToday: PropTypes.bool,
  days: PropTypes.array,
  rows: PropTypes.array,
  width: PropTypes.number,
  selectedDate: PropTypes.string,
  startDateOfMonth: PropTypes.string,
  endDateOfMonth: PropTypes.string,
};

class Month extends React.Component {
  
  constructor(props) {
    super(props);
    this.dayOfToday = dates.getToday('D');
  }

  setGridViewScroll = ({scrollLeft, scrollTop}) => {
    this.gridView.scrollLeft = scrollLeft;
    this.gridView.scrollTop = scrollTop;
  }

  setViewportRightScroll = ({scrollLeft, scrollTop}) => {
    this.viewportRight.setViewportRightScroll({scrollLeft, scrollTop});
  }

  render() {
    let { isToday, days, rows, width, selectedDate, startDateOfMonth, endDateOfMonth } = this.props;
    return (
      <div className="timeline-month-view" ref={ref => this.gridView = ref}>
        <TimelineHeader
          isToday={isToday}
          days={days}
          rows={rows}
          width={width}
          dayOfToday={this.dayOfToday}
        />
        <ViewportRight
          ref={node => this.viewportRight = node}
          isToday={isToday}
          days={days}
          rows={rows}
          selectedDate={selectedDate}
          width={width}
          startDateOfMonth={startDateOfMonth}
          endDateOfMonth={endDateOfMonth}
          dayOfToday={this.dayOfToday}
          onViewportRightScroll={this.props.onViewportRightScroll}
        />
      </div>
    );
  }
}

Month.propTypes = propTypes;

export default Month;