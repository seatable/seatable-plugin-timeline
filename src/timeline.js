import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimelineToolbar from './components/timeline-toolbar';
import ViewportLeft from './components/timeline-body/viewport-left';
import VIEWS from './components/timeline-grid-views';
import { dates, getDtableUuid } from './utils';
import { PLUGIN_NAME, NAVIGATE, GRID_VIEWS, zIndexs } from './constants';

import './css/timeline.css';

const KEY_SELECTED_GRID_VIEWS = `${PLUGIN_NAME}-selectedGridViews`;

const propTypes = {
  rows: PropTypes.array,
  selectedTimelineView: PropTypes.object,
  onTimelineSettingToggle: PropTypes.func,
};

class Timeline extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowUsers: true,
      selectedGridView: this.getSelectedGridView(props.selectedTimelineView._id),
      selectedDate: dates.getToday('YYYY-MM-DD'),
      changedSelectedByScroll: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedTimelineView) {
      if (this.props.selectedTimelineView !== nextProps.selectedTimelineView) {
        this.setState({
          selectedGridView: this.getSelectedGridView(nextProps.selectedTimelineView._id),
          selectedDate: dates.getToday('YYYY-MM-DD'),
        });
      }
    }
  }

  getSelectedGridViews = () => {
    let selectedGridViews = window.localStorage.getItem(KEY_SELECTED_GRID_VIEWS);
    return selectedGridViews ? JSON.parse(selectedGridViews) : {};
  }

  storeSelectedGridViews = (gridView) => {
    let { selectedTimelineView } = this.props;
    let viewId = selectedTimelineView._id;
    let dtableUuid = getDtableUuid();
    let selectedGridViews = this.getSelectedGridViews();
    selectedGridViews[`${dtableUuid}-${viewId}`] = gridView;
    window.localStorage.setItem(KEY_SELECTED_GRID_VIEWS, JSON.stringify(selectedGridViews));
  }

  getSelectedGridView = (viewId) => {
    let dtableUuid = getDtableUuid();
    let localGridViews = this.getSelectedGridViews();
    let localGridView = localGridViews[`${dtableUuid}-${viewId}`];
    return localGridView || GRID_VIEWS.DAY;
  }

  onShowUsersToggle = () => {
    this.setState({isShowUsers: !this.state.isShowUsers});
  }

  onSelectGridView = (gridView) => {
    this.setState({selectedGridView: gridView});
    this.storeSelectedGridViews(gridView);
  }

  onNavigate = (action) => {
    let { selectedDate, selectedGridView } = this.state;
    let todayDate = dates.getToday('YYYY-MM-DD');
    selectedDate = selectedDate || todayDate;
    if (action === NAVIGATE.PREVIOUS) {
      selectedDate = moment(selectedDate).subtract(1, selectedGridView).format('YYYY-MM-DD');
    } else if (action === NAVIGATE.NEXT) {
      selectedDate = moment(selectedDate).add(1, selectedGridView).format('YYYY-MM-DD');
    } else if (action === NAVIGATE.TODAY) {
      selectedDate = todayDate;
    }
    this.updateSelectedDate(selectedDate, false);
  }

  updateSelectedDate = (selectedDate, changedSelectedByScroll) => {
    this.setState({selectedDate, changedSelectedByScroll});
  }

  isToday = () => {
    let { selectedDate, selectedGridView } = this.state;
    let today = moment();
    let yearOfSelectedDate = moment(selectedDate).year();
    let yearOfToday = today.year();
    if (selectedGridView === GRID_VIEWS.MONTH) {
      let monthOfSelectedDate = moment(selectedDate).month();
      let monthOfToday = today.month();
      return yearOfSelectedDate === yearOfToday &&
        monthOfSelectedDate === monthOfToday;
    } else if (selectedGridView === GRID_VIEWS.YEAR) {
      return yearOfSelectedDate === yearOfToday;
    }
    return false;
  }

  onViewportLeftScroll = (scrollTop) => {
    this.timelineView && this.timelineView.setCanvasRightScroll(scrollTop);
  }

  onCanvasRightScroll = (scrollTop) => {
    this.viewportLeft && this.viewportLeft.setCanvasLeftScroll(scrollTop);
  }

  getGridViews = () => {
    const views = [GRID_VIEWS.YEAR, GRID_VIEWS.MONTH, GRID_VIEWS.DAY];
    let viewObject = {};
    Array.isArray(views) && views.forEach((v) => {
      viewObject[v] = VIEWS[v];
    });
    return viewObject;
  }

  getGridView = (selectedGridView) => {
    const views = this.getGridViews();
    return views[selectedGridView];
  };

  render() {
    let { isShowUsers, selectedGridView, selectedDate, changedSelectedByScroll } = this.state;
    let { rows } = this.props;
    let GridView = this.getGridView(selectedGridView);
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
            selectedGridView={selectedGridView}
            isToday={isToday}
            selectedDate={selectedDate}
            isShowUsers={isShowUsers}
            onShowUsersToggle={this.onShowUsersToggle}
            onNavigate={this.onNavigate}
            onTimelineSettingToggle={this.props.onTimelineSettingToggle}
            onSelectGridView={this.onSelectGridView}
          />
          <GridView
            ref={node => this.timelineView = node}
            isShowUsers={isShowUsers}
            changedSelectedByScroll={changedSelectedByScroll}
            selectedGridView={selectedGridView}
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