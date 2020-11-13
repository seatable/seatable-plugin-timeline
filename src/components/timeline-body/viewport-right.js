import React from 'react';
import PropTypes from 'prop-types';
import TimelineHeader from '../header/timeline-header';
import CanvasRight from './canvas-right';
import { getGridState,
  getGridDatesBoundaries,
  getCalcDateUnit,
  getCompareDate,
  isDifferentScope,
  getScanDates,
  getColumnWidth,
  getRenderedDates,
  canUpdateSelectedDate,
} from '../../utils/viewport-utils';

const propTypes = {
  isShowUsers: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  headerHeight: PropTypes.number,
  renderedRows: PropTypes.array,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  renderHeaderDates: PropTypes.func,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
  onViewportRightScroll: PropTypes.func,
};

class ViewportRight extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      amountDates: [],
      dateVisibleStartIndex: 0,
      dateVisibleEndIndex: 0,
      dateOverscanStartIndex: 0,
      dateOverscanEndIndex: 0,
    };
    this.isScrolling = false;
    this.currentDate = props.selectedDate;
  }

  componentDidMount() {
    let { selectedGridView, selectedDate } = this.props;
    let viewportRightWidth = this.viewportRight.offsetWidth;
    let columnWidth = getColumnWidth(selectedGridView);
    this.updateScroll({
      selectedGridView,
      selectedDate,
      viewportRightWidth,
      columnWidth,
      ...getGridState(selectedGridView, selectedDate, viewportRightWidth)
    });
  }

  componentWillReceiveProps(nextProps) {
    let { selectedGridView: newSelectedGridView, selectedDate: newSelectedDate } = nextProps;
    let columnWidth = getColumnWidth(newSelectedGridView);
    let viewportRightWidth = this.viewportRight.offsetWidth;
    if (this.props.isShowUsers !== nextProps.isShowUsers) {
      let { dateVisibleStartIndex, amountDates } = this.state;
      this.isScrolling = false;
      this.updateScroll({
        viewportRightWidth,
        columnWidth,
        selectedGridView: newSelectedGridView,
        selectedDate: newSelectedDate,
        ...getGridState(newSelectedGridView, newSelectedDate, viewportRightWidth),
        visibleStartDate: amountDates[dateVisibleStartIndex]
      });
    } else if (this.props.selectedDate !== nextProps.selectedDate && !nextProps.changedSelectedByScroll) { // onNavigate
      this.currentDate = nextProps.selectedDate;
      this.isScrolling = false;
      this.updateScroll({
        viewportRightWidth,
        columnWidth,
        selectedGridView: newSelectedGridView,
        selectedDate: newSelectedDate,
        ...getGridState(newSelectedGridView, newSelectedDate, viewportRightWidth)
      });
    }
  }

  onScroll = (evt) => {
    if (!this.isScrolling) {
      this.isScrolling = true;
      return;
    }
    let { selectedGridView, selectedDate } = this.props;
    let { amountDates } = this.state;
    let scrollLeft = evt.target.scrollLeft;
    let unit = getCalcDateUnit(selectedGridView);
    let columnWidth = getColumnWidth(selectedGridView);
    let oversNum = scrollLeft / columnWidth;
    let fract = oversNum - Math.trunc(oversNum);
    let viewportRightWidth = this.viewportRight.offsetWidth;
    let overDatesCount = Math.ceil(oversNum) - 1;
    if (overDatesCount < 0) {
      overDatesCount = 0;
    } else if (overDatesCount >= amountDates.length) {
      overDatesCount = amountDates.length - 1;
    }
    let visibleStartDate = amountDates[overDatesCount];
    let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
    let { overscanDates, gridDates } = getScanDates(selectedGridView);
    this.updateScroll({
      selectedGridView,
      selectedDate,
      amountDates,
      scrollLeft,
      visibleStartDate,
      viewportRightWidth,
      columnWidth,
      fract,
      ...getGridDatesBoundaries(visibleStartDate, visibleDatesCount, overscanDates, gridDates, unit)
    });
  }

  updateScroll = ({selectedGridView, selectedDate, visibleStartDate, visibleEndDate, overscanStartDate, overscanEndDate, viewportRightWidth, columnWidth, scrollLeft, amountDates, fract}) => {
    let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
    let compareDate = getCompareDate(selectedGridView, visibleStartDate, visibleDatesCount);
    if (canUpdateSelectedDate(selectedDate, compareDate, selectedGridView)) {
      this.props.updateSelectedDate(compareDate, true);
    }
    if (isDifferentScope(this.currentDate, compareDate, selectedGridView)) {
      let updatedGridState = getGridState(selectedGridView, compareDate, viewportRightWidth);
      visibleEndDate = updatedGridState.visibleEndDate;
      overscanStartDate = updatedGridState.overscanStartDate;
      overscanEndDate = updatedGridState.overscanEndDate;
      amountDates = updatedGridState.amountDates;
      scrollLeft = (amountDates.indexOf(visibleStartDate) + (fract || 0)) * columnWidth;
      this.currentDate = compareDate;
    }
    let dateVisibleStartIndex = amountDates.indexOf(visibleStartDate);
    let dateVisibleEndIndex = amountDates.indexOf(visibleEndDate);
    let dateOverscanStartIndex = amountDates.indexOf(overscanStartDate);
    let dateOverscanEndIndex = amountDates.indexOf(overscanEndDate);
    scrollLeft = scrollLeft || (dateVisibleStartIndex + (fract || 0)) * columnWidth;
    this.setState({
      dateVisibleStartIndex,
      dateVisibleEndIndex,
      dateOverscanStartIndex,
      dateOverscanEndIndex,
      amountDates
    }, () => {
      this.viewportRight.scrollLeft = scrollLeft;
    });
    this.props.onViewportRightScroll();
  }

  setCanvasRightScroll = (scrollTop) => {
    this.canvasRight.setCanvasRightScroll(scrollTop);
  }

  render() {
    let { dateOverscanStartIndex, dateOverscanEndIndex, amountDates } = this.state;
    let { selectedGridView, selectedDate, headerHeight, renderedRows, renderHeaderYears, renderHeaderDates, topOffset, bottomOffset } = this.props;
    let columnWidth = getColumnWidth(selectedGridView);
    let startOffset = dateOverscanStartIndex * columnWidth;
    let endOffset = (amountDates.length - dateOverscanEndIndex) * columnWidth;
    let overscanDates = amountDates.slice(dateOverscanStartIndex, dateOverscanEndIndex);
    let renderedDates = getRenderedDates(selectedGridView, overscanDates);

    return (
      <div
        className="timeline-viewport-right"
        ref={ref => this.viewportRight = ref}
        onScroll={this.onScroll}
      >
        <TimelineHeader
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          overscanDates={overscanDates}
          renderedDates={renderedDates}
          headerHeight={headerHeight}
          renderedRows={renderedRows}
          renderHeaderYears={renderHeaderYears}
          renderHeaderDates={renderHeaderDates}
          columnWidth={columnWidth}
          startOffset={startOffset}
          endOffset={endOffset}
        />
        <CanvasRight
          ref={node => this.canvasRight = node}
          overscanDates={overscanDates}
          renderedDates={renderedDates}
          renderedRows={renderedRows}
          topOffset={topOffset}
          bottomOffset={bottomOffset}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          headerHeight={headerHeight}
          columnWidth={columnWidth}
          startOffset={startOffset}
          endOffset={endOffset}
          onCanvasRightScroll={this.props.onCanvasRightScroll}
          onRowExpand={this.props.onRowExpand}
        />
      </div>
    );
  }
}

ViewportRight.propTypes = propTypes;

export default ViewportRight;