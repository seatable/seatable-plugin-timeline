import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import intl from 'react-intl-universal';
import EventRow from '../row/event-row';
import EventCells from '../row/event-cells';
import BgCells from '../row/bg-cells';
import { DATE_UNIT, DATE_FORMAT, zIndexes, GRID_VIEWS, ROW_HEIGHT } from '../../constants';

const noEventsTips = <div className="no-events">{intl.get('There_are_no_records')}</div>;

class CanvasRight extends React.Component {

  renderRows = () => {
    const {
      selectedGridView, selectedDate, overScanDates, columnWidth, renderedRows, renderedDates,
    } = this.props;
    if (renderedRows.length === 0) {
      return noEventsTips;
    }
    const bgCells = (
      <BgCells
        selectedGridView={selectedGridView}
        columnWidth={columnWidth}
        renderedDates={renderedDates}
      />
    );
    let bgRows = [];
    let eventRows = [];
    Array.isArray(renderedRows) && renderedRows.forEach(row => {
      const { events } = row;
      const convertedRow = events[0].row;
      const convertedRowId = convertedRow._id;
      bgRows.push(
        <EventRow
          key={`events-bg-row-${convertedRowId}`}
          cells={bgCells}
        />
      );
      eventRows.push(
        <EventRow
          key={`timeline-events-row-${convertedRowId}`}
          cells={
            <EventCells
              selectedGridView={selectedGridView}
              selectedDate={selectedDate}
              overScanDates={overScanDates}
              events={events}
              columnWidth={columnWidth}
              eventBus={this.props.eventBus}
              onRowExpand={this.props.onRowExpand}
              onModifyRow={this.props.onModifyRow}
            />
          }
        />
      );
    });
    return (
      <React.Fragment>
        <div className="events-bg" style={{zIndex: zIndexes.EVENTS_BG}}>{bgRows}</div>
        <div className="events-rows">{eventRows}</div>
      </React.Fragment>
    );
  }

  renderTodayMarkLine = () => {
    let { overScanDates, selectedGridView, columnWidth, renderedRows } = this.props;
    let renderedRowsLen = renderedRows.length;
    if (renderedRowsLen === 0) return null;
    let today = dayjs();
    if (selectedGridView === GRID_VIEWS.YEAR) {
      today = today.startOf(DATE_UNIT.MONTH);
    }
    today = today.format(DATE_FORMAT.YEAR_MONTH_DAY);
    let todayIndex = overScanDates.indexOf(today);
    if (todayIndex < 0) return null;
    const lineStyle = {
      top: 0,
      height: renderedRowsLen * ROW_HEIGHT,
      left: todayIndex * columnWidth + columnWidth / 2,
      zIndex: zIndexes.TODAY_MARK_LINE,
    };
    return (
      <div className="today-mark-line" style={lineStyle}></div>
    );
  }

  onViewportRightScroll = (event) => {
    const scrollLeft = event.target.scrollLeft;
    const scrollTop = event.target.scrollTop;
    this.setViewportRightScroll({scrollLeft, scrollTop});
    this.props.onViewportRightScroll({scrollLeft, scrollTop});
  }

  setViewportRightScroll = ({scrollLeft, scrollTop}) => {
    this.viewportRight.scrollLeft = scrollLeft;
    this.viewportRight.scrollTop = scrollTop;
  }

  onCanvasRightScroll = (evt) => {
    evt.stopPropagation();
    if (!this.activeScroll) {
      this.activeScroll = true;
      return;
    }
    this.props.onCanvasRightScroll(evt.target.scrollTop);
  }

  setCanvasRightScroll = (scrollTop) => {
    this.activeScroll = false;
    this.canvasRight.scrollTop = scrollTop;
  }

  render() {
    const { columnWidth, startOffset, endOffset, overScanDates, topOffset, bottomOffset } = this.props;
    const canvasRightStyle = {
      width: overScanDates.length * columnWidth + startOffset + endOffset,
      paddingLeft: startOffset,
      paddingRight: endOffset,
      zIndex: zIndexes.CANVAS_RIGHT,
    };
    return (
      <div
        className="canvas-right"
        ref={ref => this.canvasRight = ref}
        style={canvasRightStyle}
        onScroll={this.onCanvasRightScroll}
      >
        <div className="event-rows-wrapper" style={{paddingTop: topOffset, paddingBottom: bottomOffset}}>
          <div className="position-relative" style={{width: '100%', height: '100%'}}>
            {this.renderRows()}
            {this.renderTodayMarkLine()}
          </div>
        </div>
      </div>
    );
  }
}

CanvasRight.propTypes = {
  renderedRows: PropTypes.array,
  renderedDates: PropTypes.array,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  columnWidth: PropTypes.number,
  startDateOfMonth: PropTypes.string,
  endDateOfMonth: PropTypes.string,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  startOffset: PropTypes.number,
  endOffset: PropTypes.number,
  overScanDates: PropTypes.array,
  onViewportRightScroll: PropTypes.func,
  onRowExpand: PropTypes.func,
  onCanvasRightScroll: PropTypes.func,
  onModifyRow: PropTypes.func,
  eventBus: PropTypes.object,
};

export default CanvasRight;
