import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import html2canvas from 'html2canvas';
import TimelineSetting from './components/timeline-setting';
import Toolbar from './components/toolbar';
import VIEWS from './components/timeline-grid-views';
import SelectExportDateRangeDialog from './components/dialog/select-export-date-range-dialog';
import { dates, getDtableUuid } from './utils';
import { PLUGIN_NAME, NAVIGATE, GRID_VIEWS, DATE_FORMAT, DATE_UNIT } from './constants';
import * as EventTypes from './constants/event-types';
import { ExportViewGenerator } from './components/export/export-view-generator';

const KEY_SELECTED_GRID_VIEWS = `${PLUGIN_NAME}-selectedGridViews`;

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
      isShowSelectExportDateRangeDialog: false,
      isExporting: false,
      isAfterDelay: false,
      ...this.getInitDateRange()
    };
    this.gridViews = this.getGridViews();
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({isAfterDelay: true});
      clearTimeout(this.timer);
      this.timer = null;
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    let { selectedTimelineView: oldSelectedTimelineView, settings: oldSettings } = this.props;
    let { selectedTimelineView, settings } = nextProps;
    if ((selectedTimelineView && oldSelectedTimelineView !== selectedTimelineView) ||
      (settings && settings !== oldSettings)) {
      let { gridStartDate, gridEndDate } = this.state;
      let selectedGridView = this.getSelectedGridView(nextProps.selectedTimelineView._id);
      const diffs = moment(gridEndDate).diff(gridStartDate, DATE_UNIT.YEAR);
      let initDateRange = {};
      if (selectedGridView === GRID_VIEWS.YEAR && diffs < 2) {
        initDateRange = this.getInitDateRange();
      }
      this.setState({
        selectedGridView,
        selectedDate: dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY),
        changedSelectedByScroll: false,
        ...initDateRange
      }, () => {
        this.onResetViewportScroll();
      });
    }
  }

  getInitDateRange = () => {
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

  onSelectGridView = (selectedGridView) => {
    let { selectedDate, gridStartDate, gridEndDate } = this.state;
    if (selectedGridView === this.state.selectedGridView) {
      return;
    }

    // not less than 3 years under the view of year.
    const diffs = moment(gridEndDate).diff(gridStartDate, DATE_UNIT.YEAR);
    let initDateRange = {};
    if (selectedGridView === GRID_VIEWS.YEAR && diffs < 2) {
      initDateRange = this.getInitDateRange();
      selectedDate = dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY);
    }

    this.setState({
      selectedDate,
      selectedGridView,
      ...initDateRange
    }, () => {
      this.storeSelectedGridViews(selectedGridView);
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
    this.props.eventBus.dispatch(EventTypes.RESET_VIEWPORT_SCROLL_TOP);
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
    return this.gridViews[selectedGridView];
  };

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
  }

  updateDateRange = (gridStartDate, gridEndDate) => {
    const { selectedGridView } = this.state;
    const viewport = window.timelineViewport;
    const days = moment(gridEndDate).diff(gridStartDate, DATE_UNIT.DAY);
    const middleDate = moment(gridStartDate).add(Math.floor(days / 2), DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
    const today = dates.getToday(DATE_FORMAT.YEAR_MONTH_DAY);
    const canNavigateToday = dates.isDateInRange(today, gridStartDate, gridEndDate) &&
      viewport.viewportRight.canNavigateToday(selectedGridView, today, gridStartDate, gridEndDate);
    this.setState({
      gridStartDate,
      gridEndDate,
      canNavigateToday,
      selectedDate: middleDate,
    });
  }

  onExportAsImage = () => {
    this.setState({isShowSelectExportDateRangeDialog: true});
  }

  onSelectDateRangeToggle = () => {
    this.setState({
      isExporting: false,
      isShowSelectExportDateRangeDialog: !this.state.isShowSelectExportDateRangeDialog
    });
  }

  onConfirmExport = (gridStartDate, gridEndDate) => {
    const { isShowUsers, selectedGridView, selectedDate } = this.state;
    const GridView = this.gridViews[selectedGridView];
    this.setState({isExporting: true});
    ExportViewGenerator({
      isShowUsers, selectedGridView, selectedDate,
      gridStartDate, gridEndDate, GridView, ...this.props});
    setTimeout(() => {
      const ele = document.querySelector('#timeline-export-container .timeline-container');
      if (!ele) return;
      html2canvas(ele, {
        windowWidth: ele.scrollWidth,
        windowHeight: ele.scrollHeight
      }).then(canvas => {
        this.setState({
          isExporting: false,
          isShowSelectExportDateRangeDialog: false
        });
        let eleA = document.createElement('a');
        eleA.href = canvas.toDataURL('image/png');
        eleA.download = `${this.props.selectedTimelineView.name}.png`;
        eleA.click();
        document.body.removeChild(document.querySelector('#timeline-export-container'));
      });
    });
  }

  render() {
    let { isShowUsers, selectedGridView, selectedDate, changedSelectedByScroll, gridStartDate, gridEndDate,
      canNavigateToday, isShowSelectExportDateRangeDialog, isExporting, isAfterDelay } = this.state;
    let { tables, views, singleSelectColumns, dateColumns, numberColumns, isShowTimelineSetting,
      settings, rows, columns, isGroupView, groups, collaborators } = this.props;
    let GridView = this.gridViews[selectedGridView];
    let isToday = this.isToday();
    return (
      <div className="timeline-container" ref={ref => this.timeline = ref}>
        {isAfterDelay &&
          <Fragment>
            <Toolbar
              selectedGridView={selectedGridView}
              selectedDate={selectedDate}
              canNavigateToday={!isToday && canNavigateToday}
              isShowUsers={isShowUsers}
              settings={settings || {}}
              columns={columns}
              isGroupView={isGroupView}
              eventBus={this.props.eventBus}
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
              gridStartDate={gridStartDate}
              gridEndDate={gridEndDate}
              rows={rows}
              columns={columns}
              collaborators={collaborators}
              settings={settings || {}}
              onModifyTimelineSettings={this.props.onModifyTimelineSettings}
              isGroupView={isGroupView}
              groups={groups}
              eventBus={this.props.eventBus}
              updateSelectedDate={this.updateSelectedDate}
              onViewportRightScroll={this.onViewportRightScroll}
              onRowExpand={this.props.onRowExpand}
              dtable={this.props.dtable}
              tableID={this.props.tableID}
              formulaRows={this.props.formulaRows}
              tables={tables}
            />
          </Fragment>
        }
        {isShowTimelineSetting &&
          <TimelineSetting
            tables={tables}
            views={views}
            singleSelectColumns={singleSelectColumns}
            dateColumns={dateColumns}
            numberColumns={numberColumns}
            selectedGridView={selectedGridView}
            settings={settings || {}}
            gridStartDate={gridStartDate}
            gridEndDate={gridEndDate}
            onModifyTimelineSettings={this.props.onModifyTimelineSettings}
            onHideTimelineSetting={this.props.onHideTimelineSetting}
            updateDateRange={this.updateDateRange}
          />
        }
        {isShowSelectExportDateRangeDialog &&
          <SelectExportDateRangeDialog
            isExporting={isExporting}
            onSelectDateRangeToggle={this.onSelectDateRangeToggle}
            onConfirmExportDateRange={this.onConfirmExport}
          />
        }
      </div>
    );
  }
}

Timeline.propTypes = {
  tables: PropTypes.array,
  views: PropTypes.array,
  selectedTimelineView: PropTypes.object,
  rows: PropTypes.array,
  isGroupView: PropTypes.bool,
  groups: PropTypes.array,
  columns: PropTypes.array,
  singleSelectColumns: PropTypes.array,
  dateColumns: PropTypes.array,
  numberColumns: PropTypes.array,
  settings: PropTypes.object,
  isShowTimelineSetting: PropTypes.bool,
  eventBus: PropTypes.object,
  onModifyTimelineSettings: PropTypes.func,
  onHideTimelineSetting: PropTypes.func,
  onRowExpand: PropTypes.func,
};

export default Timeline;
