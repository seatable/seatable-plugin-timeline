import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimelineToolbar from './components/timeline-toolbar';
import ViewportLeft from './components/timeline-body/viewport-left';
import VIEWS from './components/timeline-grid-views';
import { dates, getDtableUuid } from './utils';
import { PLUGIN_NAME, NAVIGATE, GRID_VIEWS, zIndexs, DATE_FORMAT } from './constants';

import './css/timeline.css';

const KEY_SELECTED_GRID_VIEWS = `${PLUGIN_NAME}-selectedGridViews`;

const propTypes = {
  rows: PropTypes.array,
  selectedTimelineView: PropTypes.object,
  onTimelineSettingToggle: PropTypes.func,
  onViewportRightScroll: PropTypes.func,
  onRowExpand: PropTypes.func,
};

class Timeline extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isShowUsers: true,
      selectedGridView: this.getSelectedGridView(props.selectedTimelineView._id),
      selectedDate: dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY),
      changedSelectedByScroll: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedTimelineView) {
      if (this.props.selectedTimelineView !== nextProps.selectedTimelineView) {
        this.setState({
          selectedGridView: this.getSelectedGridView(nextProps.selectedTimelineView._id),
          selectedDate: dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY),
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
    return localGridView || GRID_VIEWS.MONTH;
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
    let todayDate = dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY);
    selectedDate = selectedDate || todayDate;
    if (action === NAVIGATE.PREVIOUS) {
      selectedDate = moment(selectedDate).subtract(1, selectedGridView).format(DATE_FORMAT.YEAR_MONTH_DAY);
    } else if (action === NAVIGATE.NEXT) {
      selectedDate = moment(selectedDate).add(1, selectedGridView).format(DATE_FORMAT.YEAR_MONTH_DAY);
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
    if (selectedGridView === GRID_VIEWS.YEAR) {
      return yearOfSelectedDate === yearOfToday;
    } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
      let monthOfSelectedDate = moment(selectedDate).month();
      let monthOfToday = today.month();
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
    let headerHeight = selectedGridView === GRID_VIEWS.DAY ? 86 : 68; // header-years + header-days
    let blankZoneStyle = {
      height: headerHeight
    };
    return (
      <div className="timeline-container position-relative">
        {isShowUsers &&
          <div className="left-pane-wrapper position-absolute" style={{zIndex: zIndexs.LEFT_PANE_WRAPPER}}>
            <div className="blank-zone" style={blankZoneStyle}></div>
            <ViewportLeft
              ref={node => this.viewportLeft = node}
              rows={rows}
              onViewportLeftScroll={this.onViewportLeftScroll}
            />
          </div>
        }
        <div className="right-pane-wrapper position-relative" style={rightPaneWrapperStyle}>
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
            headerHeight={headerHeight}
            rows={rows}
            updateSelectedDate={this.updateSelectedDate}
            onCanvasRightScroll={this.onCanvasRightScroll}
            onViewportRightScroll={this.props.onViewportRightScroll}
            onRowExpand={this.props.onRowExpand}
          />
        </div>
      </div>
    );
  }
}

Timeline.propTypes = propTypes;

export default Timeline;