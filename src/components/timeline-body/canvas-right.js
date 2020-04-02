import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import EventRow from '../event-row';
import EventCell from '../event-cell';
import { dates } from '../../utils';
import { getCalcDateUnit } from '../../utils/viewport-utils';
import { ROW_HEIGHT, DATE_UNIT, zIndexs, GRID_VIEWS } from '../../constants';
import SingleSelectFormatter from '../../components/cell-formatter/single-select-formatter';
import intl from 'react-intl-universal';
import '../../locale';

const propTypes = {
  days: PropTypes.array,
  rows: PropTypes.array,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  columnWidth: PropTypes.number,
  startDateOfMonth: PropTypes.string,
  endDateOfMonth: PropTypes.string,
  onViewportRightScroll: PropTypes.func,
};

class ViewportRight extends React.Component {

  renderEventRows = (dateUnit) => {
    let { rows } = this.props;
    if (!rows || rows.length === 0) {
      return <div className="no-events d-flex align-items-center justify-content-center">{intl.get('There_are_no_records')}</div>
    }
    return (
      <React.Fragment>
        <div className="events-bg position-absolute" style={{zIndex: zIndexs.EVENTS_BG}}>
          {Array.isArray(rows) && rows.map((r, index) => {
            return (
              <EventRow
                key={`events-bg-row-${index}`}
                cells={this.renderBgCells()}
              />
            );
          })}
        </div>
        <div className="events-rows position-absolute">
          {Array.isArray(rows) && rows.map((r, index) => {
            return (
              <EventRow
                key={`timeline-events-row-${index}`}
                cells={this.renderEventCells(r, dateUnit)}
              />
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  renderEventCells = (row, dateUnit) => {
    let { overscanDates, columnWidth } = this.props;
    let { user, events } = row;
    let overscanStartDate = overscanDates[0];
    let overscanEndDate = overscanDates[overscanDates.length - 1];
    let displayEvents = this.getEventsInRange(events, overscanStartDate, overscanEndDate, dateUnit);
    return displayEvents.map((e, index) => {
      let { label, bgColor, start, end } = e;
      let duration = moment(end).diff(moment(start), dateUnit);
      let width = duration * columnWidth;
      let left = this.getEventLeft(overscanStartDate, start);
      return (
        <EventCell
          key={`timeline-event-cell-${user}-${index}`}
          style={{left, zIndex: zIndexs.EVENT_CELL, width}}
          formatter={<SingleSelectFormatter label={label} bgColor={bgColor} start={start} end={end} />}
        />
      );
    });
  }

  renderBgCells = () => {
    let { overscanDates, columnWidth } = this.props;
    return overscanDates.map((d) => {
      let week = dates.getDate2Week(d);
      let isEndRange = this.isEndOfRange(d);
      let isWeekend = this.isWeekend(week);
      return (
        <div
          key={`timeline-day-bg-${d}`}
          name={d}
          className={classnames({'timeline-day-bg': true, 'sun-or-sat-day': isWeekend, 'd-inline-block': true, 'end-of-range': isEndRange})}
          style={{width: columnWidth}}
        ></div>
      );
    });
  }

  getEventsInRange = (events, startDate, endDate, dateUnit) => {
    let { selectedDate } = this.props;
    if (!Array.isArray(events)) {
      return [];
    }
    return events.filter(e => moment(e.end).diff(moment(e.start), dateUnit) > 0 &&
      (dates.isDateInRange(e.start, startDate, endDate) ||
      dates.isDateInRange(e.end, startDate, endDate) ||
      dates.isDateInRange(selectedDate, e.start, e.end))
    );
  }

  getEventLeft = (overscanStartDate, startDate) => {
    let { selectedGridView, columnWidth } = this.props;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      let formattedOverscanStartDate = moment(overscanStartDate).format('YYYY-MM');
      let formattedStartDate = moment(startDate).format('YYYY-MM');
      return moment(formattedStartDate).diff(formattedOverscanStartDate, DATE_UNIT.MONTH) * columnWidth;
    } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
      return moment(startDate).diff(overscanStartDate, DATE_UNIT.DAY) * columnWidth;
    }
  }

  renderTodayMarkLine = () => {
    let { rows, overscanDates, selectedGridView, columnWidth } = this.props;
    let today = moment();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      today = today.startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD');
    } else if (selectedGridView === GRID_VIEWS.MONTH) {
      today = today.format('YYYY-MM-DD');
    } else {
      today = today.format('YYYY-MM-DD');
    }
    let todayIndex = overscanDates.indexOf(today);
    if (todayIndex < 0) return null;
    let left = todayIndex * columnWidth + columnWidth / 2;
    let height = rows.length * ROW_HEIGHT;
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
      return moment(date).endOf(DATE_UNIT.YEAR).format('YYYY-MM') === moment(date).format('YYYY-MM');
    } else if (selectedGridView === GRID_VIEWS.DAY || GRID_VIEWS.MONTH) {
      return moment(date).endOf(DATE_UNIT.MONTH).format('YYYY-MM-DD') === date;
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
    this.props.onCanvasRightScroll(evt.target.scrollTop);
  }

  setCanvasRightScroll = (scrollTop) => {
    this.canvasRight.scrollTop = scrollTop;
  }

  render() {
    let { selectedGridView, columnWidth, startOffset, endOffset, overscanDates } = this.props;
    let dateUnit = getCalcDateUnit(selectedGridView);
    let canvasRightStyle = {
      width: overscanDates.length * columnWidth + startOffset + endOffset,
      paddingLeft: startOffset,
      paddingRight: endOffset,
    };
    return (
      <div className="canvas-right" ref={ref => this.canvasRight = ref} style={canvasRightStyle} onScroll={this.onCanvasRightScroll}>
        <div className="position-relative" style={{width: '100%', height: '100%'}}>
          {this.renderEventRows(dateUnit)}
          {this.renderTodayMarkLine()}
        </div>
      </div>
    );
  }
}

ViewportRight.propTypes = propTypes;

export default ViewportRight;