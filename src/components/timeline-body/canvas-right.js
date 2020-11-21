import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import EventRow from '../event-row';
import EventCell from '../event-cell';
import { dates } from '../../utils';
import { ROW_HEIGHT, DATE_UNIT, DATE_FORMAT, zIndexs, GRID_VIEWS } from '../../constants';
import EventFormatter from '../../components/cell-formatter/event-formatter';
import intl from 'react-intl-universal';
import '../../locale';

const propTypes = {
  days: PropTypes.array,
  renderedRows: PropTypes.array,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  headerHeight: PropTypes.number,
  columnWidth: PropTypes.number,
  startDateOfMonth: PropTypes.string,
  endDateOfMonth: PropTypes.string,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  onViewportRightScroll: PropTypes.func,
  onRowExpand: PropTypes.func,
};

class CanvasRight extends React.Component {

  renderRows = () => {
    let { renderedRows, renderedDates, rowsCount } = this.props;
    if (rowsCount === 0) {
      return <div className="no-events d-flex align-items-center justify-content-center">{intl.get('There_are_no_records')}</div>;
    }
    let bgRows = [], eventRows = [];
    Array.isArray(renderedRows) && renderedRows.forEach((r, index) => {
      bgRows.push(
        <EventRow
          key={`events-bg-row-${index}`}
          cells={this.renderBgCells(renderedDates)}
        />
      );
      eventRows.push(
        <EventRow
          key={`timeline-events-row-${index}`}
          cells={this.renderEventCells(r, index)}
        />
      );
    });
    return (
      <React.Fragment>
        <div className="events-bg position-absolute" style={{zIndex: zIndexs.EVENTS_BG}}>
          {bgRows}
        </div>
        <div className="events-rows position-absolute">
          {eventRows}
        </div>
      </React.Fragment>
    );
  }

  renderEventCells = (eventRow, rowIndex) => {
    let { overScanDates } = this.props;
    let { events } = eventRow;
    let overScanStartDate = overScanDates[0];
    let overScanEndDate = overScanDates[overScanDates.length - 1];
    let displayEvents = this.getEventsInRange(events, overScanStartDate, overScanEndDate);
    return displayEvents.map((e) => {
      let { label, bgColor, textColor, start, end, row } = e;
      if (!row) return null;
      let width = this.getEventWidth(start, end);
      let left = this.getEventLeft(overScanStartDate, start);
      let { _id: rowId } = row;
      let formatterLabel = null, formatterStyle = {};
      if (width < 30) {
        formatterLabel = '';
        formatterStyle = {
          padding: 0
        };
      } else {
        formatterLabel = label;
        formatterStyle = {
          padding: '0 10px'
        };
      }
      return (
        <EventCell
          key={`timeline-event-cell-${rowIndex}_${rowId}`}
          style={{left, zIndex: zIndexs.EVENT_CELL, width}}
          row={row}
          id={`timeline_event_cell_${rowIndex}_${rowId}`}
          onRowExpand={this.props.onRowExpand}
          title={`${label}(${start} - ${end})`}
          formatter={<EventFormatter label={formatterLabel} bgColor={bgColor} textColor={textColor} formatterStyle={formatterStyle} />}
        />
      );
    });
  }

  renderBgCells = (renderedDates) => {
    let { columnWidth, selectedGridView } = this.props;
    return renderedDates.map((d) => {
      let dateItemWidth, isWeekend = false, isEndRange = false;
      if (selectedGridView === GRID_VIEWS.YEAR) {
        isEndRange = true;
        let endOfYear = moment(d).endOf(DATE_UNIT.YEAR);
        dateItemWidth = (endOfYear.diff(d, DATE_UNIT.MONTH) + 1) * columnWidth;
      } else if (selectedGridView === GRID_VIEWS.MONTH) {
        isEndRange = true;
        let endOfMonth = moment(d).endOf(DATE_UNIT.MONTH);
        dateItemWidth = (moment(endOfMonth).diff(d, DATE_UNIT.DAY) + 1) * columnWidth;
      } else {
        isEndRange = this.isEndOfRange(d);
        isWeekend = this.isWeekend(dates.getDate2Week(d));
        dateItemWidth = columnWidth;
      }
      return (
        <div
          key={`timeline-date-bg-${d}`}
          name={d}
          className={classnames({'timeline-date-bg': true, 'sun-or-sat-day': isWeekend, 'd-inline-block': true, 'end-of-range': isEndRange})}
          style={{width: dateItemWidth}}
        ></div>
      );
    });
  }

  getEventsInRange = (events, startDate, endDate) => {
    let { selectedGridView, selectedDate } = this.props;
    if (!Array.isArray(events)) {
      return [];
    }
    return events.filter(e => {
      let { start: eventStartDate, end: eventEndDate } = e;
      let isValidEvent = true;
      if (selectedGridView === GRID_VIEWS.YEAR) {
        isValidEvent = moment(eventEndDate).diff(eventStartDate, DATE_UNIT.MONTH) > 0;
      } else {
        isValidEvent = moment(eventEndDate).isSameOrAfter(eventStartDate);
      }
      return isValidEvent && (dates.isDateInRange(eventStartDate, startDate, endDate) ||
        dates.isDateInRange(eventEndDate, startDate, endDate) ||
        dates.isDateInRange(selectedDate, eventStartDate, eventEndDate));
    });
  }

  getEventWidth = (eventStartDate, eventEndDate) => {
    let { selectedGridView, columnWidth } = this.props;
    let duration = 0;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      duration = moment(eventEndDate).diff(moment(eventStartDate), DATE_UNIT.MONTH) + 1;
    } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
      duration = moment(eventEndDate).diff(moment(eventStartDate), DATE_UNIT.DAY) + 1;
    }
    return duration * columnWidth;
  }

  getEventLeft = (overScanStartDate, startDate) => {
    let { selectedGridView, columnWidth } = this.props;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      let formattedOverScanStartDate = moment(overScanStartDate).format(DATE_FORMAT.YEAR_MONTH);
      let formattedStartDate = moment(startDate).format(DATE_FORMAT.YEAR_MONTH);
      return moment(formattedStartDate).diff(formattedOverScanStartDate, DATE_UNIT.MONTH) * columnWidth;
    } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
      return moment(startDate).diff(overScanStartDate, DATE_UNIT.DAY) * columnWidth;
    }
  }

  renderTodayMarkLine = () => {
    let { overScanDates, selectedGridView, columnWidth, renderedRows, rowsCount } = this.props;
    let today = moment();
    if (rowsCount === 0) return null;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      today = today.startOf(DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY);
    } else if (selectedGridView === GRID_VIEWS.MONTH) {
      today = today.format(DATE_FORMAT.YEAR_MONTH_DAY);
    } else {
      today = today.format(DATE_FORMAT.YEAR_MONTH_DAY);
    }
    let todayIndex = overScanDates.indexOf(today);
    if (todayIndex < 0) return null;
    let left = todayIndex * columnWidth + columnWidth / 2;
    let height = renderedRows.length * ROW_HEIGHT;
    return <div
      className="today-mark-line position-absolute"
      style={{
        top: 0,
        height,
        left,
        zIndex: zIndexs.TODAY_MARK_LINE,
      }}></div>;
  }

  isWeekend = (week) => {
    let { selectedGridView } = this.props;
    if (selectedGridView === GRID_VIEWS.DAY) {
      return week === 'S';
    }
    return false;
  }

  isEndOfRange = (date) => {
    let { selectedGridView } = this.props;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      return moment(date).endOf(DATE_UNIT.YEAR).format(DATE_FORMAT.YEAR_MONTH) === moment(date).format(DATE_FORMAT.YEAR_MONTH);
    } else if (selectedGridView === GRID_VIEWS.DAY || GRID_VIEWS.MONTH) {
      return moment(date).endOf(DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY) === date;
    }
    return false;
  }

  onViewportRightScroll = (event) => {
    let scrollLeft = event.target.scrollLeft;
    let scrollTop = event.target.scrollTop;
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
    let { headerHeight, columnWidth, startOffset, endOffset, overScanDates, topOffset, bottomOffset } = this.props;
    let canvasRightStyle = {
      width: overScanDates.length * columnWidth + startOffset + endOffset,
      height: `calc(100% - ${headerHeight + 18}px)`,
      paddingLeft: startOffset,
      paddingRight: endOffset,
    };
    return (
      <div className="canvas-right" ref={ref => this.canvasRight = ref} style={canvasRightStyle} onScroll={this.onCanvasRightScroll}>
        <div
          className="event-rows-wrapper"
          style={{
            paddingTop: topOffset,
            paddingBottom: bottomOffset
          }}
        >
          <div className="position-relative" style={{width: '100%', height: '100%'}}>
            {this.renderRows()}
            {this.renderTodayMarkLine()}
          </div>
        </div>
      </div>
    );
  }
}

CanvasRight.propTypes = propTypes;

export default CanvasRight;