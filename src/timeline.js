import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimelineToolbar from './components/timeline-toolbar';
import ViewportLeft from './components/timeline-body/viewport-left';
import VIEWS from './components/timeline-grid-views';
import { dates, getDtableUuid } from './utils';
import {
  getTimelineState,
  getVisibleBoundaries,
  getRowOverscanStartIdx,
  getRowOverscanEndIdx
} from './utils/timeline-utils';
import { PLUGIN_NAME, NAVIGATE, GRID_VIEWS, zIndexs, DATE_FORMAT, ROW_HEIGHT } from './constants';

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

  componentDidMount() {
    let { selectedGridView, rows } = this.props;
    let timelineHeight = this.timeline.offsetHeight;
    let headerHeight = this.getHeaderHeight(selectedGridView);
    let viewportHeight = timelineHeight - headerHeight;
    this.setState({
      ...getTimelineState(viewportHeight, rows.length)
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedTimelineView) {
      if (this.props.selectedTimelineView !== nextProps.selectedTimelineView) {
        let selectedGridView = this.getSelectedGridView(nextProps.selectedTimelineView._id);
        this.setState({
          selectedGridView,
          selectedDate: dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY),
          changedSelectedByScroll: false,
        }, () => {
          this.onResetViewportScroll();
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
    this.setState({
      selectedGridView: gridView
    }, () => {
      this.storeSelectedGridViews(gridView);
      this.onResetViewportScroll();
    });
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

  onResetViewportScroll = () => {
    this.onViewportLeftScroll(0);
    this.onCanvasRightScroll(0);
  }

  onViewportLeftScroll = (scrollTop) => {
    this.timelineView && this.timelineView.setCanvasRightScroll(scrollTop);
    this.updateScroll(scrollTop);
  }

  onCanvasRightScroll = (scrollTop) => {
    this.viewportLeft && this.viewportLeft.setCanvasLeftScroll(scrollTop);
    this.updateScroll(scrollTop);
  }

  updateScroll = (scrollTop) => {
    let { rows } = this.props;
    let { selectedGridView } = this.state;
    let rowsCount = rows.length;
    let viewportHeight = this.timeline.offsetHeight - this.getHeaderHeight(selectedGridView);
    let { rowVisibleStartIdx, rowVisibleEndIdx } = getVisibleBoundaries(viewportHeight, scrollTop, rowsCount);
    let rowOverscanStartIdx = getRowOverscanStartIdx(rowVisibleStartIdx);
    let rowOverscanEndIdx = getRowOverscanEndIdx(rowVisibleEndIdx, rowsCount);
    this.setState({
      rowVisibleStartIdx,
      rowVisibleEndIdx,
      rowOverscanStartIdx,
      rowOverscanEndIdx
    });
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

  getHeaderHeight = (selectedGridView) => {
    // header-years + header-days
    if (selectedGridView === GRID_VIEWS.DAY) {
      return 86;
    }
    return 68;
  }

  getRenderedRows = (rowOverscanStartIdx, rowOverscanEndIdx) => {
    let { rows } = this.props;
    let rowsLength = rows.length;
    if (rowOverscanStartIdx >= rowsLength || rowOverscanEndIdx > rowsLength) {
      return [];
    }
    let i = rowOverscanStartIdx, renderRows = [];
    while (i < rowOverscanEndIdx) {
      renderRows.push(rows[i]);
      i++;
    }
    return renderRows;
  }

  render() {
    let { isShowUsers, selectedGridView, selectedDate, changedSelectedByScroll, rowOverscanStartIdx, rowOverscanEndIdx } = this.state;
    let GridView = this.getGridView(selectedGridView);
    let isToday = this.isToday();
    let rightPaneWrapperStyle = {
      marginLeft: isShowUsers && 180
    };
    let headerHeight = this.getHeaderHeight(selectedGridView)
    let blankZoneStyle = {
      height: headerHeight
    };
    let rowsCount = this.props.rows.length;
    let renderedRows = this.getRenderedRows(rowOverscanStartIdx, rowOverscanEndIdx);
    let topOffset = rowOverscanStartIdx > 0 ? rowOverscanStartIdx * ROW_HEIGHT : 0;
    let bottomOffset = (rowsCount - rowOverscanEndIdx) > 0 ? (rowsCount - rowOverscanEndIdx) * ROW_HEIGHT : 0;

    return (
      <div className="timeline-container position-relative" ref={ref => this.timeline = ref}>
        {isShowUsers &&
          <div className="left-pane-wrapper position-absolute" style={{zIndex: zIndexs.LEFT_PANE_WRAPPER}}>
            <div className="blank-zone" style={blankZoneStyle}></div>
            <ViewportLeft
              ref={node => this.viewportLeft = node}
              renderedRows={renderedRows}
              topOffset={topOffset}
              bottomOffset={bottomOffset}
              headerHeight={headerHeight}
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
            renderedRows={renderedRows}
            topOffset={topOffset}
            bottomOffset={bottomOffset}
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