import React from 'react';
import PropTypes from 'prop-types';
import Header from '../header/header';
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
    const { selectedGridView, selectedDate, gridStartDate, gridEndDate } = this.props;
    const viewportRightWidth = this.viewportRight.offsetWidth;
    const columnWidth = getColumnWidth(selectedGridView);
    const initState = getGridInitState(selectedGridView, selectedDate, gridStartDate, gridEndDate, viewportRightWidth);
    this.allDates = initState.allDates;
    this.updateScroll({
      viewportRightWidth,
      columnWidth,
      selectedGridView,
      selectedDate,
      ...initState
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      selectedGridView: newSelectedGridView, selectedDate: newSelectedDate, gridStartDate: newGridStartDate,
      gridEndDate: newGridEndDate,
    } = nextProps;
    const columnWidth = getColumnWidth(newSelectedGridView);
    const viewportRightWidth = this.viewportRight.offsetWidth;
    if (this.props.gridStartDate !== nextProps.gridStartDate || this.props.gridEndDate !== nextProps.gridEndDate) {
      // changed grid date range.
      this.isScrolling = false;
      this.canUpdateScrollLeft = true;
      const initState = getGridInitState(newSelectedGridView, newSelectedDate, newGridStartDate, newGridEndDate, viewportRightWidth);
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
      const initState = getGridInitState(newSelectedGridView, newSelectedDate, newGridStartDate, newGridEndDate, viewportRightWidth);
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

  componentDidUpdate(prevProps) {
    if (this.props.isShowUsers !== prevProps.isShowUsers) {
      const { selectedGridView, selectedDate } = this.props;
      const unit = getCalcDateUnit(selectedGridView);
      const scrollLeft = this.viewportRight.scrollLeft;
      const columnWidth = getColumnWidth(selectedGridView);
      const overDatesCount = Math.max(0, Math.round(scrollLeft / columnWidth));
      const viewportRightWidth = this.viewportRight.offsetWidth;
      const visibleStartDate = this.allDates[overDatesCount];
      const visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
      const overScanDates = getScanDates(selectedGridView);
      this.updateScroll({
        selectedGridView,
        selectedDate,
        visibleStartDate,
        viewportRightWidth,
        columnWidth,
        ...getGridDatesBoundaries(visibleStartDate, visibleDatesCount, overScanDates, unit)
      });
    }
  }

  renderCanvasRight = (props) => {
    const { isGroupView, groupVisibleStartIdx, groups, foldedGroups, renderedRows, ...baseProps } = this.props;
    let CustomCanvasRight;
    let canvasRightProps;
    if (isGroupView) {
      CustomCanvasRight = GroupCanvasRight;
      canvasRightProps = {groupVisibleStartIdx, groups, foldedGroups};
    } else {
      CustomCanvasRight = CanvasRight;
      canvasRightProps = {renderedRows};
    }
    return (
      <CustomCanvasRight
        ref={node => this.canvasRight = node}
        {...canvasRightProps}
        {...props}
        {...baseProps}
      />
    );
  }

  onScroll = (evt) => {
    if (!this.isScrolling) {
      this.isScrolling = true;
      return;
    }
    const { selectedGridView, selectedDate } = this.props;
    const scrollLeft = evt.target.scrollLeft;
    const unit = getCalcDateUnit(selectedGridView);
    const columnWidth = getColumnWidth(selectedGridView);
    const overDatesCount = Math.max(0, Math.round(scrollLeft / columnWidth));
    const viewportRightWidth = this.viewportRight.offsetWidth;
    const visibleStartDate = this.allDates[overDatesCount];
    const visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
    const overScanDates = getScanDates(selectedGridView);
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
    const visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
    const compareDate = getCompareDate(selectedGridView, visibleStartDate, visibleDatesCount);
    if (canUpdateSelectedDate(selectedDate, compareDate, selectedGridView)) {
      this.props.updateSelectedDate(compareDate, true);
    }
    const visibleStartIndex = this.allDates.indexOf(visibleStartDate);
    const visibleEndIndex = this.allDates.indexOf(visibleEndDate);
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
        this.viewportRight.scrollLeft = scrollLeft;
        this.canUpdateScrollLeft = false;
        if (Object.prototype.toString.call(this.props.onSelectGridView) === '[object Function]') {
          this.props.onViewportRightScroll(scrollLeft, viewportRightWidth, scrollWidth);
        }
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
    const { overScanStartIndex, overScanEndIndex } = this.state;
    const { selectedGridView, selectedDate, renderHeaderYears, renderHeaderDates, isRenderAll } = this.props;
    const columnWidth = getColumnWidth(selectedGridView);
    let overScanDates;
    let startOffset;
    let endOffset;
    if (isRenderAll) {
      overScanDates = [...this.allDates];
      startOffset = 0;
      endOffset = 0;
    } else {
      overScanDates = this.allDates.slice(overScanStartIndex, overScanEndIndex);
      startOffset = overScanStartIndex * columnWidth;
      endOffset = (this.allDates.length - overScanEndIndex) * columnWidth;
    }
    const renderedDates = getRenderedDates(selectedGridView, overScanDates);
    return (
      <div
        className="timeline-viewport-right flex-fill"
        ref={ref => this.viewportRight = ref}
        onScroll={this.onScroll}
      >
        <Header
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
  isRenderAll: PropTypes.bool,
  isGroupView: PropTypes.bool,
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
  onModifyRow: PropTypes.func,
  onSelectGridView: PropTypes.func,
  renderHeaderYears: PropTypes.func,
};

export default ViewportRight;
