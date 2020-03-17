import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TimelineHeader from '../header/timeline-header';
import CanvasRight from './canvas-right';
import { dates } from '../../utils';
import { COLUMN_WIDTH, DATE_UNIT, VIEW_TYPE } from '../../constants';

const propTypes = {
  isToday: PropTypes.bool,
  isShowUsers: PropTypes.bool,
  changedSelectedByScroll: PropTypes.bool,
  selectedView: PropTypes.string,
  selectedDate: PropTypes.string,
  rows: PropTypes.array,
  renderHeaderDays: PropTypes.func,
  updateSelectedDate: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
};

class ViewportRight extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      amountDays: [],
      visibleStartIndex: 0,
      visibleEndIndex: 0,
      overscanStartIndex: 0,
      overscanEndIndex: 0,
    };
    this.isScrolling = false;
  }

  componentDidMount() {
    let { selectedView, selectedDate } = this.props;
    this.updateScroll({
      viewportRightWidth: this.viewportRight.offsetWidth,
      amountDays: this.getAmountDays(selectedDate),
      visibleStartDate: moment(selectedDate).startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD'),
      selectedView,
      selectedDate,
    });
  }

  componentWillReceiveProps(nextProps) {
    let { amountDays, visibleStartIndex } = this.state;
    let viewportRightWidth = this.viewportRight.offsetWidth;
    if (this.props.isShowUsers !== nextProps.isShowUsers) {
      let { selectedView, selectedDate } = nextProps;
      this.isScrolling = false;
      this.updateScroll({
        visibleStartDate: amountDays[visibleStartIndex],
        viewportRightWidth,
        amountDays,
        selectedView,
        selectedDate
      });
    } else if (this.props.selectedDate !== nextProps.selectedDate && !nextProps.changedSelectedByScroll) { // onNavigate
      let { selectedView, selectedDate } = nextProps;
      this.updateScroll({
        viewportRightWidth,
        amountDays: this.getAmountDays(selectedDate),
        visibleStartDate: moment(selectedDate).startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD'),
        selectedView,
        selectedDate,
      });
    }
  }

  onScroll = (evt) => {
    let { selectedView, selectedDate } = this.props;
    let { amountDays } = this.state;
    let scrollLeft = evt.target.scrollLeft;
    if (!this.isScrolling) {
      this.isScrolling = true;
      return;
    };
    let overDaysCount = Math.ceil(scrollLeft / COLUMN_WIDTH);
    this.updateScroll({
      viewportRightWidth: this.viewportRight.offsetWidth,
      visibleStartDate: amountDays[overDaysCount - 1],
      selectedView,
      selectedDate,
      amountDays,
      scrollLeft
    });
  }

  updateScroll = ({selectedDate, selectedView, visibleStartDate, viewportRightWidth, amountDays, scrollLeft}) => {
    let visibleDaysCount = Math.ceil(viewportRightWidth / COLUMN_WIDTH);
    let visibleEndDate = moment(visibleStartDate).add(visibleDaysCount - 1, DATE_UNIT.DAY).format('YYYY-MM-DD');
    let overscanStartDate = moment(visibleStartDate).add(-10, DATE_UNIT.DAY).format('YYYY-MM-DD');
    let overscanEndDate = moment(visibleEndDate).add(10, DATE_UNIT.DAY).format('YYYY-MM-DD');
    let middleDateIndex = Math.round(visibleDaysCount / 2) - 1;
    let middleDate = moment(visibleStartDate).add(middleDateIndex, DATE_UNIT.DAY).format('YYYY-MM-DD');
    let isSelectedDateChanged = false;
    if (!this.isWithinViewport(selectedDate, middleDate, selectedView)) {
      isSelectedDateChanged = true;
      this.isScrolling = false;
      amountDays = this.getAmountDays(middleDate);
      scrollLeft = amountDays.indexOf(visibleStartDate) * COLUMN_WIDTH;
      this.props.updateSelectedDate(middleDate, true);
    }
    let visibleStartIndex = amountDays.indexOf(visibleStartDate);
    let visibleEndIndex = amountDays.indexOf(visibleEndDate);
    let overscanStartIndex = amountDays.indexOf(overscanStartDate);
    let overscanEndIndex = amountDays.indexOf(overscanEndDate);
    scrollLeft = !isSelectedDateChanged && scrollLeft ? scrollLeft : visibleStartIndex * COLUMN_WIDTH;
    this.setState({
      visibleStartIndex,
      visibleEndIndex,
      overscanStartIndex,
      overscanEndIndex,
      amountDays,
    }, () => {
      this.viewportRight.scrollLeft = scrollLeft;
    });
  }

  getAmountDays = (date) => {
    return [
      ...dates.getDaysInMonth(moment(date).add(-1, 'months')),
      ...dates.getDaysInMonth(date),
      ...dates.getDaysInMonth(moment(date).add(1, 'months'))
    ];
  }

  isWithinViewport = (dateA, dateB, viewType) => {
    let formattedDateA = moment(dateA);
    let formattedDateB = moment(dateB);
    if (viewType === VIEW_TYPE.MONTH) {
      return (formattedDateA.year() === formattedDateB.year()) &&
        (formattedDateA.month() === formattedDateB.month());
    }
    return false;
  }

  setCanvasRightScroll = (scrollTop) => {
    this.canvasRight.setCanvasRightScroll(scrollTop);
  }

  render() {
    let { overscanStartIndex, overscanEndIndex, amountDays } = this.state;
    let { selectedDate, isToday, rows, renderHeaderDays } = this.props;
    let startOffset = overscanStartIndex * COLUMN_WIDTH;
    let endOffset = (amountDays.length - overscanEndIndex) * COLUMN_WIDTH;
    let overscanDays = amountDays.slice(overscanStartIndex, overscanEndIndex);

    return (
      <div className="viewport-right" ref={ref => this.viewportRight = ref} onScroll={this.onScroll}>
        <TimelineHeader
          isToday={isToday}
          selectedDate={selectedDate}
          overscanDays={overscanDays}
          rows={rows}
          renderHeaderDays={renderHeaderDays}
          startOffset={startOffset}
          endOffset={endOffset}
        />
        <CanvasRight
          ref={node => this.canvasRight = node}
          isToday={isToday}
          overscanDays={overscanDays}
          rows={rows}
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