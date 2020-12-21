import React from 'react';
import PropTypes from 'prop-types';
import TimelineHeader from '../header/timeline-header';
import CanvasRight from './canvas-right';
import GroupCanvasRight from './group-canvas-right';
import {
  getGridInitState,
  getGridDatesBoundaries,
  getCalcDateUnit,
  getCompareDate,
  getScanDates,
  getColumnWidth,
  getRenderedDates,
  canUpdateSelectedDate,
} from '../../utils/viewport-right-utils';
import * as dates from '../../utils/dates';
import * as EventTypes from '../../constants/event-types';

class ViewportRight extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visibleStartIndex: 0,
      visibleEndIndex: 0,
      overScanStartIndex: 0,
      overScanEndIndex: 0,
    };
    this.allDates = [];
    this.isScrolling = false;
    this.canUpdateScrollLeft = true;
  }

  componentDidMount() {
    let { selectedGridView, selectedDate, gridStartDate, gridEndDate } = this.props;
    let viewportRightWidth = this.viewportRight.offsetWidth;
    let columnWidth = getColumnWidth(selectedGridView);
    let initState = getGridInitState(selectedGridView, selectedDate, gridStartDate, gridEndDate, viewportRightWidth);
    this.allDates = initState.allDates;
    this.updateScroll({
      viewportRightWidth,
      columnWidth,
      selectedGridView,
      selectedDate,
      ...initState
    });
  }

  componentWillReceiveProps(nextProps) {
    let { selectedGridView: newSelectedGridView, selectedDate: newSelectedDate, gridStartDate: newGridStartDate,
      gridEndDate: newGridEndDate } = nextProps;
    let columnWidth = getColumnWidth(newSelectedGridView);
    let viewportRightWidth = this.viewportRight.offsetWidth;
    if (this.props.isShowUsers !== nextProps.isShowUsers) {
      let { visibleStartIndex } = this.state;
      this.isScrolling = false;
      this.canUpdateScrollLeft = true;
      let initState = getGridInitState(newSelectedGridView, newSelectedDate, newGridStartDate, newGridEndDate, viewportRightWidth);
      this.allDates = initState.allDates;
      this.updateScroll({
        viewportRightWidth,
        columnWidth,
        selectedGridView: newSelectedGridView,
        selectedDate: newSelectedDate,
        ...initState,
        visibleStartDate: this.allDates[visibleStartIndex]
      });
    } else if (this.props.gridStartDate !== nextProps.gridStartDate || this.props.gridEndDate !== nextProps.gridEndDate) {
      // changed grid date range.
      this.isScrolling = false;
      this.canUpdateScrollLeft = true;
      let initState = getGridInitState(newSelectedGridView, newSelectedDate, newGridStartDate, newGridEndDate, viewportRightWidth);
      this.allDates = initState.allDates;
      this.updateScroll({
        viewportRightWidth,
        columnWidth,
        selectedGridView: newSelectedGridView,
        selectedDate: newSelectedDate,
        ...initState
      });
    } else if (this.props.selectedDate !== nextProps.selectedDate && !nextProps.changedSelectedByScroll) {
      // onNavigate.
      this.isScrolling = false;
      this.canUpdateScrollLeft = true;
      let initState = getGridInitState(newSelectedGridView, newSelectedDate, newGridStartDate, newGridEndDate, viewportRightWidth);
      this.allDates = initState.allDates;
      this.updateScroll({
        viewportRightWidth,
        columnWidth,
        selectedGridView: newSelectedGridView,
        selectedDate: newSelectedDate,
        ...initState
      });
    }
  }

  renderCanvasRight = (props) => {
    let { isGroupView } = this.props;
    let { overScanDates, renderedDates, startOffset, endOffset, columnWidth } = props;
    let { selectedGridView, selectedDate, topOffset, bottomOffset, onRowExpand, eventBus,
      onCanvasRightScroll } = this.props;
    let baseProps = { overScanDates, renderedDates, topOffset, bottomOffset, startOffset, endOffset,
      selectedGridView, selectedDate, columnWidth, onRowExpand, eventBus, onCanvasRightScroll };
    let CustomCanvasRight = CanvasRight;
    let customProps = {};
    if (isGroupView) {
      let { groupVisibleStartIdx, groups, foldedGroups } = this.props;
      CustomCanvasRight = GroupCanvasRight;
      customProps = {
        groupVisibleStartIdx,
        groups,
        foldedGroups
      };
    } else {
      customProps = {
        renderedRows: this.props.renderedRows
      };
    }
    return (
      <CustomCanvasRight
        ref={node => this.canvasRight = node}
        {...baseProps}
        {...customProps}
      />
    );
  }

  onScroll = (evt) => {
    if (!this.isScrolling) {
      this.isScrolling = true;
      return;
    }
    let { selectedGridView, selectedDate } = this.props;
    let scrollLeft = evt.target.scrollLeft;
    let unit = getCalcDateUnit(selectedGridView);
    let columnWidth = getColumnWidth(selectedGridView);
    let overDatesCount = Math.max(0, Math.round(scrollLeft / columnWidth));
    let viewportRightWidth = this.viewportRight.offsetWidth;
    let visibleStartDate = this.allDates[overDatesCount];
    let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
    let overScanDates = getScanDates(selectedGridView);
    this.props.eventBus.dispatch(EventTypes.VIEWPORT_RIGHT_SCROLL, {visibleStartDate, scrollLeft});
    this.updateScroll({
      selectedGridView,
      selectedDate,
      visibleStartDate,
      viewportRightWidth,
      columnWidth,
      ...getGridDatesBoundaries(visibleStartDate, visibleDatesCount, overScanDates, unit)
    });
    this.props.onViewportRightScroll(scrollLeft, viewportRightWidth, this.viewportRight.scrollWidth);
  }

  updateScroll = ({selectedGridView, selectedDate, visibleStartDate, visibleEndDate, overScanStartDate, overScanEndDate, viewportRightWidth, columnWidth}) => {
    let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
    let compareDate = getCompareDate(selectedGridView, visibleStartDate, visibleDatesCount);
    if (canUpdateSelectedDate(selectedDate, compareDate, selectedGridView)) {
      this.props.updateSelectedDate(compareDate, true);
    }
    let visibleStartIndex = this.allDates.indexOf(visibleStartDate);
    let visibleEndIndex = this.allDates.indexOf(visibleEndDate);
    let overScanStartIndex = this.allDates.indexOf(overScanStartDate);
    let overScanEndIndex = this.allDates.indexOf(overScanEndDate);
    if (overScanStartIndex < 0) {
      overScanStartIndex = 0;
    }
    if (overScanEndIndex < 0) {
      overScanEndIndex = this.allDates.length;
    }
    this.setState({
      visibleStartIndex,
      visibleEndIndex,
      overScanStartIndex,
      overScanEndIndex
    }, () => {
      if (this.canUpdateScrollLeft) {
        const scrollWidth = this.viewportRight.scrollWidth;
        const scrollLeft = visibleStartIndex * columnWidth;
        this.props.eventBus.dispatch(EventTypes.VIEWPORT_RIGHT_SCROLL, {visibleStartDate, scrollLeft});
        this.viewportRight.scrollLeft = scrollLeft;
        this.canUpdateScrollLeft = false;
        this.props.onViewportRightScroll(scrollLeft, viewportRightWidth, scrollWidth);
      }
    });
  }

  setCanvasRightScroll = (scrollTop) => {
    this.canvasRight.setCanvasRightScroll(scrollTop);
  }

  canNavigateToday = (selectedGridView, selectedDate, gridStartDate, gridEndDate) => {
    const viewportRightWidth = this.viewportRight.offsetWidth;
    const { visibleEndDate } = getGridInitState(selectedGridView, selectedDate, gridStartDate, gridEndDate, viewportRightWidth);
    return dates.isDateInRange(visibleEndDate, gridStartDate, gridEndDate);
  }

  render() {
    let { overScanStartIndex, overScanEndIndex } = this.state;
    let { selectedGridView, selectedDate, isShowUsers, renderHeaderYears, renderHeaderDates } = this.props;
    let columnWidth = getColumnWidth(selectedGridView);
    let startOffset = overScanStartIndex * columnWidth;
    let endOffset = (this.allDates.length - overScanEndIndex) * columnWidth;
    let overScanDates = this.allDates.slice(overScanStartIndex, overScanEndIndex);
    let renderedDates = getRenderedDates(selectedGridView, overScanDates);
    return (
      <div
        className="timeline-viewport-right position-relative"
        ref={ref => this.viewportRight = ref}
        onScroll={this.onScroll}
        style={{marginLeft: isShowUsers && 180}}
      >
        <TimelineHeader
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          overScanDates={overScanDates}
          renderedDates={renderedDates}
          renderHeaderYears={renderHeaderYears}
          renderHeaderDates={renderHeaderDates}
          columnWidth={columnWidth}
          startOffset={startOffset}
          endOffset={endOffset}
        />
        {this.renderCanvasRight({columnWidth, startOffset, endOffset, overScanDates, renderedDates})}
      </div>
    );
  }
}

ViewportRight.propTypes = {
  isShowUsers: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  gridStartDate: PropTypes.string,
  gridEndDate: PropTypes.string,
  renderedRows: PropTypes.array,
  groupVisibleStartIdx: PropTypes.number,
  groups: PropTypes.array,
  foldedGroups: PropTypes.array,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  eventBus: PropTypes.object,
  changedSelectedByScroll: PropTypes.bool,
  renderHeaderDates: PropTypes.func,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
  onViewportRightScroll: PropTypes.func,
};

export default ViewportRight;