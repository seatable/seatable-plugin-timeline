import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimelineToolbar from './components/timeline-toolbar';
import ViewportLeft from './components/timeline-viewport/viewport-left';
import Month from './components/timeline-views/month';
import { dates } from './utils';
import { NAVIGATE, VIEW_TYPE, DATE_UNIT, zIndexs, COLUMN_WIDTH } from './constants';

import './css/timeline.css';

const propTypes = {
  rows: PropTypes.array,
  selectedDate: PropTypes.string,
  selectedTimelineView: PropTypes.string,
  onNavigate: PropTypes.func,
};

class Timeline extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowUsers: true
    };
  }

  onShowUsersToggle = () => {
    this.setState({isShowUsers: !this.state.isShowUsers});
  }

  onNavigate = (action) => {
    let { selectedDate, selectedTimelineView } = this.props;
    selectedDate = selectedDate || dates.getToday('YYYY-MM-DD');
    if (action === NAVIGATE.PREVIOUS) {
      if (selectedTimelineView === VIEW_TYPE.MONTH) {
        selectedDate = moment(selectedDate).subtract(1, DATE_UNIT.MONTH).format('YYYY-MM-DD');
      }
    } else if (action === NAVIGATE.NEXT) {
      if (selectedTimelineView === VIEW_TYPE.MONTH) {
        selectedDate = moment(selectedDate).add(1, DATE_UNIT.MONTH).format('YYYY-MM-DD');
      }
    } else if (action === NAVIGATE.TODAY) {
      selectedDate = dates.getToday('YYYY-MM-DD');
    }
    this.resetScroll();
    this.props.onNavigate(selectedDate);
  }

  isToday = () => {
    let { selectedDate, selectedTimelineView } = this.props;
    let today = moment();
    let yearOfSelectedDate = moment(selectedDate).year();
    let monthOfSelectedDate = moment(selectedDate).month();
    let yearOfToday = today.year();
    let monthOfToday = today.month();
    if (selectedTimelineView === VIEW_TYPE.MONTH) {
      return yearOfSelectedDate === yearOfToday &&
        monthOfSelectedDate === monthOfToday;
    }
    return false;
  }

  resetScroll = () => {
    if (this.gridView && this.viewportLeft) {
      this.gridView.setGridViewScroll({scrollLeft: 0, scrollTop: 0});
      this.gridView.setViewportRightScroll({scrollLeft: 0, scrollTop: 0});
      this.viewportLeft.setViewportLeftScroll({scrollLeft: 0, scrollTop: 0});
    }
  }

  onViewportLeftScroll = ({scrollLeft, scrollTop}) => {
    this.gridView && this.gridView.setViewportRightScroll({scrollLeft, scrollTop});
  }

  onViewportRightScroll = ({scrollLeft, scrollTop}) => {
    this.viewportLeft && this.viewportLeft.setViewportLeftScroll({scrollLeft, scrollTop});
  }

  render() {
    let { isShowUsers } = this.state;
    let { rows, selectedDate } = this.props;
    let isToday = this.isToday();
    let days = dates.getDaysInMonth(selectedDate);
    let startDateOfMonth = moment(selectedDate).startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD');
    let endDateOfMonth = moment(selectedDate).endOf(DATE_UNIT.MONTH).format('YYYY-MM-DD');
    let width = days.length * COLUMN_WIDTH;
    let rightPaneWrapperStyle = {
      marginLeft: isShowUsers && 180
    };
    return (
      <div className="timeline-container position-relative">
        {isShowUsers &&
          <div className="left-pane-wrapper position-absolute" style={{zIndex: zIndexs.LEFT_PANE_WRAPPER}}>
            <div className="blank-zone"></div>
            <ViewportLeft
              ref={node => this.viewportLeft = node}
              rows={rows}
              onViewportLeftScroll={this.onViewportLeftScroll}
            />
          </div>
        }
        <div className="right-pane-wrapper" style={rightPaneWrapperStyle}>
          <TimelineToolbar
            isToday={isToday}
            days={days}
            selectedDate={selectedDate}
            isShowUsers={isShowUsers}
            onShowUsersToggle={this.onShowUsersToggle}
            onNavigate={this.onNavigate}
          />
          <Month
            ref={node => this.gridView = node}
            isToday={isToday}
            days={days}
            rows={rows}
            width={width}
            selectedDate={selectedDate}
            startDateOfMonth={startDateOfMonth}
            endDateOfMonth={endDateOfMonth}
            onViewportRightScroll={this.onViewportRightScroll}
          />
        </div>
      </div>
    );
  }
}

Timeline.propTypes = propTypes;

export default Timeline;