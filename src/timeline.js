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
  getRowOverScanStartIdx,
  getRowOverScanEndIdx
} from './utils/timeline-utils';
import { PLUGIN_NAME, NAVIGATE, GRID_VIEWS, zIndexs, DATE_FORMAT, ROW_HEIGHT, DATE_UNIT } from './constants';

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
      canScrollToLeft: true,
      canScrollToRight: true,
      canNavigateToday: true,
      ...this.getInitGridRangeDates(),
    };
    this.headerHeight = 68;
  }

  componentDidMount() {
    let { rows } = this.props;
    let timelineHeight = this.timeline.offsetHeight;
    let viewportHeight = timelineHeight - this.headerHeight;
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

  getInitGridRangeDates = () => {
    return {
      gridStartDate: moment().subtract(2, DATE_UNIT.YEAR).startOf(DATE_UNIT.YEAR).format(DATE_FORMAT.YEAR_MONTH_DAY),
      gridEndDate: moment().add(2, DATE_UNIT.YEAR).endOf(DATE_UNIT.YEAR).format(DATE_FORMAT.YEAR_MONTH_DAY),
    };
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
    let { gridStartDate, gridEndDate, selectedDate } = this.state;

    // not less than 3 years under the view of year.
    const diffs = moment(gridEndDate).diff(gridStartDate, DATE_UNIT.YEAR);
    let initGridRangeDates = {};
    if (gridView === GRID_VIEWS.YEAR && diffs < 2) {
      initGridRangeDates = this.getInitGridRangeDates();
      selectedDate = dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY);
    }

    this.setState({
      selectedGridView: gridView,
      selectedDate,
      ...initGridRangeDates,
    }, () => {
      this.storeSelectedGridViews(gridView);
      this.onResetViewportScroll();
    });
  }

  onNavigate = (action) => {
    let { selectedDate, selectedGridView } = this.state;
    let todayDate = dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY);
    selectedDate = selectedDate || todayDate;
    let calcDateUnit;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      calcDateUnit = DATE_UNIT.YEAR;
    } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
      calcDateUnit = DATE_UNIT.MONTH;
    }
    if (action === NAVIGATE.PREVIOUS) {
      if (!this.state.canScrollToLeft) {
        return;
      }
      selectedDate = moment(selectedDate).subtract(1, calcDateUnit).format(DATE_FORMAT.YEAR_MONTH_DAY);
    } else if (action === NAVIGATE.NEXT && this.state.canScrollToRight) {
      if (!this.state.canScrollToRight) {
        return;
      }
      selectedDate = moment(selectedDate).add(1, calcDateUnit).format(DATE_FORMAT.YEAR_MONTH_DAY);
    } else if (action === NAVIGATE.TODAY) {
      selectedDate = todayDate;
    }
    if (selectedDate !== this.state.selectedDate) {
      this.updateSelectedDate(selectedDate, false);
    }
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
    this.scrollTop = scrollTop;
    let { rows } = this.props;
    let rowsCount = rows.length;
    let viewportHeight = this.timeline.offsetHeight - this.headerHeight;
    let { rowVisibleStartIdx, rowVisibleEndIdx } = getVisibleBoundaries(viewportHeight, scrollTop, rowsCount);
    let rowOverScanStartIdx = getRowOverScanStartIdx(rowVisibleStartIdx);
    let rowOverScanEndIdx = getRowOverScanEndIdx(rowVisibleEndIdx, rowsCount);
    this.setState({
      rowVisibleStartIdx,
      rowVisibleEndIdx,
      rowOverScanStartIdx,
      rowOverScanEndIdx
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

  getRenderedRows = (rowOverScanStartIdx, rowOverScanEndIdx) => {
    let { rows } = this.props;
    let rowsLength = rows.length;
    if (rowOverScanStartIdx >= rowsLength || rowOverScanEndIdx > rowsLength) {
      return [];
    }
    let i = rowOverScanStartIdx, renderRows = [];
    while (i < rowOverScanEndIdx) {
      renderRows.push(rows[i]);
      i++;
    }
    return renderRows;
  }

  onViewportRightScroll = (viewportRightScrollLeft, viewportRightWidth, viewportRightScrollWidth) => {
    const { canScrollToLeft, canScrollToRight } = this.state;
    if (canScrollToLeft && viewportRightScrollLeft <= 0) {
      this.setState({canScrollToLeft: false});
    } else if (!canScrollToLeft && viewportRightScrollLeft > 0) {
      this.setState({canScrollToLeft: true});
    }
    if (canScrollToRight && viewportRightScrollWidth - viewportRightWidth - viewportRightScrollLeft <= 0) {
      this.setState({canScrollToRight: false});
    } else if (!canScrollToRight && viewportRightScrollWidth - viewportRightWidth - viewportRightScrollLeft > 0) {
      this.setState({canScrollToRight: true});
    }

    this.props.onViewportRightScroll();
  }

  updateSelectedRange = (gridStartDate, gridEndDate) => {
    const { selectedGridView } = this.state;
    const days = moment(gridEndDate).diff(gridStartDate, DATE_UNIT.DAY);
    const middleDate = moment(gridStartDate).add(Math.floor(days / 2), DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
    const today = dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY);
    const canNavigateToday = dates.isDateInRange(today, gridStartDate, gridEndDate) &&
      this.timelineView.viewportRight.canNavigateToday(selectedGridView, today, gridStartDate, gridEndDate);
    this.setState({
      gridStartDate,
      gridEndDate,
      canNavigateToday,
      selectedDate: middleDate,
    });
  }

  render() {
    let { isShowUsers, selectedGridView, selectedDate, changedSelectedByScroll, rowOverScanStartIdx,
      rowOverScanEndIdx, gridStartDate, gridEndDate, canNavigateToday } = this.state;
    let GridView = this.getGridView(selectedGridView);
    let isToday = this.isToday();
    let rightPaneWrapperStyle = {
      marginLeft: isShowUsers && 180
    };
    let blankZoneStyle = {
      height: this.headerHeight
    };
    let rowsCount = this.props.rows.length;
    let renderedRows = this.getRenderedRows(rowOverScanStartIdx, rowOverScanEndIdx);
    let topOffset = rowOverScanStartIdx > 0 ? rowOverScanStartIdx * ROW_HEIGHT : 0;
    let bottomOffset = (rowsCount - rowOverScanEndIdx) > 0 ? (rowsCount - rowOverScanEndIdx) * ROW_HEIGHT : 0;

    return (
      <div className="timeline-container position-relative" ref={ref => this.timeline = ref}>
        {isShowUsers &&
          <div className="left-pane-wrapper position-absolute" style={{zIndex: zIndexs.LEFT_PANE_WRAPPER}}>
            <div className="blank-zone" style={blankZoneStyle}></div>
            <ViewportLeft
              ref={node => this.viewportLeft = node}
              scrollTop={this.scrollTop}
              renderedRows={renderedRows}
              topOffset={topOffset}
              bottomOffset={bottomOffset}
              headerHeight={this.headerHeight}
              onViewportLeftScroll={this.onViewportLeftScroll}
            />
          </div>
        }
        <div className="right-pane-wrapper position-relative" style={rightPaneWrapperStyle}>
          <TimelineToolbar
            selectedGridView={selectedGridView}
            selectedDate={selectedDate}
            gridStartDate={gridStartDate}
            gridEndDate={gridEndDate}
            canNavigateToday={!isToday && canNavigateToday}
            isShowUsers={isShowUsers}
            onShowUsersToggle={this.onShowUsersToggle}
            onNavigate={this.onNavigate}
            onTimelineSettingToggle={this.props.onTimelineSettingToggle}
            onSelectGridView={this.onSelectGridView}
            updateSelectedRange={this.updateSelectedRange}
          />
          <GridView
            ref={node => this.timelineView = node}
            isShowUsers={isShowUsers}
            changedSelectedByScroll={changedSelectedByScroll}
            selectedGridView={selectedGridView}
            selectedDate={selectedDate}
            gridStartDate={gridStartDate}
            gridEndDate={gridEndDate}
            headerHeight={this.headerHeight}
            renderedRows={renderedRows}
            topOffset={topOffset}
            bottomOffset={bottomOffset}
            updateSelectedDate={this.updateSelectedDate}
            onCanvasRightScroll={this.onCanvasRightScroll}
            onViewportRightScroll={this.onViewportRightScroll}
            onRowExpand={this.props.onRowExpand}
          />
        </div>
      </div>
    );
  }
}

Timeline.propTypes = propTypes;

export default Timeline;