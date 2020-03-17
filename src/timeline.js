import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimelineToolbar from './components/timeline-toolbar';
import ViewportLeft from './components/timeline-body/viewport-left';
import Month from './components/timeline-views/month';
import { dates } from './utils';
import { NAVIGATE, VIEW_TYPE, DATE_UNIT, zIndexs } from './constants';

import './css/timeline.css';

const propTypes = {
  rows: PropTypes.array,
};

class Timeline extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowUsers: true,
      selectedView: VIEW_TYPE.MONTH,
      selectedDate: dates.getToday('YYYY-MM-DD'),
      changedSelectedByScroll: false,
    };
  }

  onShowUsersToggle = () => {
    this.setState({isShowUsers: !this.state.isShowUsers});
  }

  onNavigate = (action) => {
    let { selectedDate, selectedView } = this.state;
    let todayDate = dates.getToday('YYYY-MM-DD');
    selectedDate = selectedDate || todayDate;
    if (action === NAVIGATE.PREVIOUS) {
      if (selectedView === VIEW_TYPE.MONTH) {
        selectedDate = moment(selectedDate).subtract(1, DATE_UNIT.MONTH).format('YYYY-MM-DD');
      }
    } else if (action === NAVIGATE.NEXT) {
      if (selectedView === VIEW_TYPE.MONTH) {
        selectedDate = moment(selectedDate).add(1, DATE_UNIT.MONTH).format('YYYY-MM-DD');
      }
    } else if (action === NAVIGATE.TODAY) {
      selectedDate = todayDate;
    }
    this.updateSelectedDate(selectedDate, false);
  }

  updateSelectedDate = (selectedDate, changedSelectedByScroll) => {
    this.setState({selectedDate, changedSelectedByScroll});
  }

  isToday = () => {
    let { selectedDate, selectedView } = this.state;
    let today = moment();
    let yearOfSelectedDate = moment(selectedDate).year();
    let monthOfSelectedDate = moment(selectedDate).month();
    let yearOfToday = today.year();
    let monthOfToday = today.month();
    if (selectedView === VIEW_TYPE.MONTH) {
      return yearOfSelectedDate === yearOfToday &&
        monthOfSelectedDate === monthOfToday;
    }
    return false;
  }

  onViewportLeftScroll = (scrollTop) => {
    this.timelineView && this.timelineView.setCanvasRightScroll(scrollTop);
  }

  onCanvasRightScroll = (scrollTop) => {
    this.viewportLeft && this.viewportLeft.setCanvasLeftScroll(scrollTop);
  }

  render() {
    let { isShowUsers, selectedView, selectedDate, changedSelectedByScroll } = this.state;
    let { rows } = this.props;
    let isToday = this.isToday();
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
            selectedDate={selectedDate}
            isShowUsers={isShowUsers}
            onShowUsersToggle={this.onShowUsersToggle}
            onNavigate={this.onNavigate}
          />
          <Month
            ref={node => this.timelineView = node}
            isToday={isToday}
            isShowUsers={isShowUsers}
            changedSelectedByScroll={changedSelectedByScroll}
            selectedView={selectedView}
            selectedDate={selectedDate}
            rows={rows}
            updateSelectedDate={this.updateSelectedDate}
            onCanvasRightScroll={this.onCanvasRightScroll}
          />
        </div>
      </div>
    );
  }
}

Timeline.propTypes = propTypes;

export default Timeline;