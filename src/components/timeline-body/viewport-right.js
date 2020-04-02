import React from 'react';
import PropTypes from 'prop-types';
import TimelineHeader from '../header/timeline-header';
import CanvasRight from './canvas-right';
import { getGridState,
  getGridDatesBoundaries,
  getCalcDateUnit,
  getCompareDate,
  isDifferentScope,
  getScanItems,
  getColumnWidth
} from '../../utils/viewport-utils';

const propTypes = {
  isShowUsers: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  rows: PropTypes.array,
  renderHeaderDates: PropTypes.func,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
};

class ViewportRight extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      amountDates: [],
      visibleStartIndex: 0,
      visibleEndIndex: 0,
      overscanStartIndex: 0,
      overscanEndIndex: 0,
    };
    this.isScrolling = false;
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
      let { visibleStartIndex, amountDates } = this.state;
      this.isScrolling = false;
      this.updateScroll({
        viewportRightWidth,
        columnWidth,
        selectedGridView: newSelectedGridView,
        selectedDate: newSelectedDate,
        ...getGridState(newSelectedGridView, newSelectedDate, viewportRightWidth),
        visibleStartDate: amountDates[visibleStartIndex]
      });
    } else if (this.props.selectedDate !== nextProps.selectedDate && !nextProps.changedSelectedByScroll) { // onNavigate
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
    let { selectedGridView, selectedDate } = this.props;
    let { amountDates } = this.state;
    let scrollLeft = evt.target.scrollLeft;
    if (!this.isScrolling) {
      this.isScrolling = true;
      return;
    };
    let unit = getCalcDateUnit(selectedGridView);
    let columnWidth = getColumnWidth(selectedGridView);
    let oversNum = scrollLeft / columnWidth;
    let fract = oversNum - Math.trunc(oversNum);
    let viewportRightWidth = this.viewportRight.offsetWidth;
    let overDatesCount = Math.ceil(oversNum);
    let visibleStartDate = amountDates[overDatesCount - 1];
    let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
    let { overScanItems, gridScanItems } = getScanItems(selectedGridView);
    this.updateScroll({
      selectedGridView,
      selectedDate,
      amountDates,
      scrollLeft,
      visibleStartDate,
      viewportRightWidth,
      columnWidth,
      fract,
      ...getGridDatesBoundaries(visibleStartDate, visibleDatesCount, unit, overScanItems, gridScanItems)
    });
  }

  updateScroll = ({selectedGridView, selectedDate, visibleStartDate, visibleEndDate, overscanStartDate, overscanEndDate, viewportRightWidth, columnWidth, amountDates, scrollLeft, fract}) => {
    let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
    let compareDate = getCompareDate(selectedGridView, visibleStartDate, visibleDatesCount);
    if (isDifferentScope(selectedDate, compareDate, selectedGridView)) {
      this.isScrolling = false;
      let updatedGridState = getGridState(selectedGridView, compareDate, viewportRightWidth);
      visibleEndDate = updatedGridState.visibleEndDate;
      overscanStartDate = updatedGridState.overscanStartDate;
      overscanEndDate = updatedGridState.overscanEndDate;
      amountDates = updatedGridState.amountDates;
      scrollLeft = (amountDates.indexOf(visibleStartDate) + (fract || 0)) * columnWidth;
      this.props.updateSelectedDate(compareDate, true);
    }
    let visibleStartIndex = amountDates.indexOf(visibleStartDate);
    let visibleEndIndex = amountDates.indexOf(visibleEndDate);
    let overscanStartIndex = amountDates.indexOf(overscanStartDate);
    let overscanEndIndex = amountDates.indexOf(overscanEndDate);
    scrollLeft = scrollLeft || (visibleStartIndex + (fract || 0)) * columnWidth;
    this.setState({
      visibleStartIndex,
      visibleEndIndex,
      overscanStartIndex,
      overscanEndIndex,
      amountDates,
    }, () => {
      this.viewportRight.scrollLeft = scrollLeft;
    });
  }

  setCanvasRightScroll = (scrollTop) => {
    this.canvasRight.setCanvasRightScroll(scrollTop);
  }

  render() {
    let { overscanStartIndex, overscanEndIndex, amountDates } = this.state;
    let { selectedGridView, selectedDate, rows, renderHeaderDates } = this.props;
    let columnWidth = getColumnWidth(selectedGridView);
    let startOffset = overscanStartIndex * columnWidth;
    let endOffset = (amountDates.length - overscanEndIndex) * columnWidth;
    let overscanDates = amountDates.slice(overscanStartIndex, overscanEndIndex);

    return (
      <div className="viewport-right" ref={ref => this.viewportRight = ref} onScroll={this.onScroll}>
        <TimelineHeader
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          overscanDates={overscanDates}
          rows={rows}
          renderHeaderDates={renderHeaderDates}
          columnWidth={columnWidth}
          startOffset={startOffset}
          endOffset={endOffset}
        />
        <CanvasRight
          ref={node => this.canvasRight = node}
          overscanDates={overscanDates}
          rows={rows}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
          columnWidth={columnWidth}
          startOffset={startOffset}
          endOffset={endOffset}
          onCanvasRightScroll={this.props.onCanvasRightScroll}
        />
      </div>
    );
  }
}

ViewportRight.propTypes = propTypes;

export default ViewportRight;