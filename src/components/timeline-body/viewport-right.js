import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimelineHeader from '../header/timeline-header';
import CanvasRight from './canvas-right';
import { getGridState, getGridDatesBoundaries, getCalcDateUnit, isDifferentScope } from '../../utils/viewport-utils';
import { COLUMN_WIDTH, DATE_UNIT, GRID_VIEWS } from '../../constants';

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
    this.updateScroll({
      selectedGridView,
      selectedDate,
      viewportRightWidth,
      ...getGridState(selectedGridView, selectedDate, viewportRightWidth)
    });
  }

  componentWillReceiveProps(nextProps) {
    let { selectedGridView: newSelectedGridView, selectedDate: newSelectedDate } = nextProps;
    let viewportRightWidth = this.viewportRight.offsetWidth;
    if (this.props.isShowUsers !== nextProps.isShowUsers) {
      let { visibleStartIndex, amountDates } = this.state;
      this.isScrolling = false;
      this.updateScroll({
        viewportRightWidth,
        selectedGridView: newSelectedGridView,
        selectedDate: newSelectedDate,
        ...getGridState(newSelectedGridView, newSelectedDate, viewportRightWidth),
        visibleStartDate: amountDates[visibleStartIndex]
      });
    } else if (this.props.selectedDate !== nextProps.selectedDate && !nextProps.changedSelectedByScroll) { // onNavigate
      this.updateScroll({
        viewportRightWidth,
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
    let oversNum = scrollLeft / COLUMN_WIDTH;
    let fract = oversNum - Math.trunc(oversNum);
    let viewportRightWidth = this.viewportRight.offsetWidth;
    let overDatesCount = Math.ceil(oversNum);
    let visibleStartDate = amountDates[overDatesCount - 1];
    let visibleDatesCount = Math.ceil(viewportRightWidth / COLUMN_WIDTH);
    this.updateScroll({
      selectedGridView,
      selectedDate,
      amountDates,
      scrollLeft,
      visibleStartDate,
      viewportRightWidth,
      fract,
      ...getGridDatesBoundaries(visibleStartDate, visibleDatesCount, unit)
    });
  }

  updateScroll = ({selectedGridView, selectedDate, visibleStartDate, visibleEndDate, overscanStartDate, overscanEndDate, viewportRightWidth, amountDates, scrollLeft, fract}) => {
    let visibleDatesCount = Math.ceil(viewportRightWidth / COLUMN_WIDTH);
    let compareDate = this.getCompareDate(selectedGridView, visibleStartDate, visibleDatesCount);
    if (isDifferentScope(selectedDate, compareDate, selectedGridView)) {
      this.isScrolling = false;
      let updatedGridState = getGridState(selectedGridView, compareDate, viewportRightWidth);
      visibleEndDate = updatedGridState.visibleEndDate;
      overscanStartDate = updatedGridState.overscanStartDate;
      overscanEndDate = updatedGridState.overscanEndDate;
      amountDates = updatedGridState.amountDates;
      scrollLeft = (amountDates.indexOf(visibleStartDate) + (fract || 0)) * COLUMN_WIDTH;
      this.props.updateSelectedDate(compareDate, true);
    }
    let visibleStartIndex = amountDates.indexOf(visibleStartDate);
    let visibleEndIndex = amountDates.indexOf(visibleEndDate);
    let overscanStartIndex = amountDates.indexOf(overscanStartDate);
    let overscanEndIndex = amountDates.indexOf(overscanEndDate);
    scrollLeft = scrollLeft || visibleStartIndex * COLUMN_WIDTH;
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

  getCompareDate = (selectedGridView, visibleStartDate, visibleDatesCount) => {
    if (selectedGridView === GRID_VIEWS.YEAR) {
      return moment(visibleStartDate).add(1, DATE_UNIT.MONTH).format('YYYY-MM-DD');
    } else {
      return moment(visibleStartDate).add(Math.ceil(visibleDatesCount / 2), DATE_UNIT.DAY).format('YYYY-MM-DD');
    }
  }

  setCanvasRightScroll = (scrollTop) => {
    this.canvasRight.setCanvasRightScroll(scrollTop);
  }

  render() {
    let { overscanStartIndex, overscanEndIndex, amountDates } = this.state;
    let { selectedGridView, selectedDate, rows, renderHeaderDates } = this.props;
    let startOffset = overscanStartIndex * COLUMN_WIDTH;
    let endOffset = (amountDates.length - overscanEndIndex) * COLUMN_WIDTH;
    let overscanDates = amountDates.slice(overscanStartIndex, overscanEndIndex);

    return (
      <div className="viewport-right" ref={ref => this.viewportRight = ref} onScroll={this.onScroll}>
        <TimelineHeader
          selectedDate={selectedDate}
          overscanDates={overscanDates}
          rows={rows}
          renderHeaderDates={renderHeaderDates}
          startOffset={startOffset}
          endOffset={endOffset}
        />
        <CanvasRight
          ref={node => this.canvasRight = node}
          overscanDates={overscanDates}
          rows={rows}
          selectedGridView={selectedGridView}
          selectedDate={selectedDate}
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