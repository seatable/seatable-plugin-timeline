import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import EventRow from '../event-row';
import EventCell from '../event-cell';
import { dates } from '../../utils';
import { getCalcDateUnit } from '../../utils/viewport-utils';
import { ROW_HEIGHT, COLUMN_WIDTH, DATE_UNIT, zIndexs, GRID_VIEWS } from '../../constants';
import SingleSelectFormatter from '../../components/cell-formatter/single-select-formatter';
import intl from 'react-intl-universal';
import '../../locale';

const propTypes = {
  days: PropTypes.array,
  rows: PropTypes.array,
  selectedGridView: PropTypes.string,
  selectedDate: PropTypes.string,
  startDateOfMonth: PropTypes.string,
  endDateOfMonth: PropTypes.string,
  width: PropTypes.number,
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
    let { overscanDates } = this.props;
    let { user, events } = row;
    let startDate = overscanDates[0];
    let endDate = overscanDates[overscanDates.length - 1];
    let displayEvents = this.getEventsInRange(events, startDate, endDate);
    return displayEvents.map((e, index) => {
      let { label, bgColor, start, end } = e;
      if (moment(start).isBefore(startDate)) {
        start = startDate;
      }
      if (moment(end).isAfter(endDate)) {
        end = endDate;
      }
      let duration = moment(end).diff(moment(start), dateUnit);
      let width = duration * COLUMN_WIDTH;
      let left = moment(start).diff(moment(startDate), dateUnit) * COLUMN_WIDTH;
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
    let { overscanDates } = this.props;
    return overscanDates.map((d) => {
      let week = dates.getDate2Week(d);
      let isEndRange = this.isEndOfRange(d);
      let isWeekend = this.isWeekend(week);
      return (
        <div
          key={`timeline-day-bg-${d}`}
          name={d}
          className={classnames({'timeline-day-bg': true, 'sun-or-sat-day': isWeekend, 'd-inline-block': true, 'end-of-range': isEndRange})}
          style={{width: COLUMN_WIDTH}}
        ></div>
      );
    });
  }

  getEventsInRange = (events, startDate, endDate) => {
    let { selectedGridView, selectedDate } = this.props;
    if (!Array.isArray(events)) {
      return [];
    }
    let unit = getCalcDateUnit(selectedGridView);
    return events.filter(e => moment(e.end).diff(moment(e.start), unit) > 0 &&
      (dates.isDateInRange(e.start, startDate, endDate) ||
      dates.isDateInRange(e.end, startDate, endDate) ||
      dates.isDateInRange(selectedDate, e.start, e.end))
    );
  }

  getTodayMarkLineStyle = (dateUnit) => {
    let { rows, overscanDates, selectedGridView } = this.props;
    let today = selectedGridView === GRID_VIEWS.YEAR ?
      moment().startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD') :
      moment().format('YYYY-MM-DD');
    let left = overscanDates.indexOf(today) * COLUMN_WIDTH + COLUMN_WIDTH / 2;
    let height = rows.length * ROW_HEIGHT;
    return {
      top: 0,
      height,
      left,
      zIndex: zIndexs.TODAY_MARK_LINE,
    };
  }

  isWeekend = (week) => {
    let { selectedGridView } = this.props;
    if (selectedGridView === GRID_VIEWS.YEAR) return false;
    return week === 'S';
  }

  isEndOfRange = (date) => {
    let { selectedGridView } = this.props;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      return moment(date).endOf(DATE_UNIT.YEAR).format('YYYY-MM') === moment(date).format('YYYY-MM');
    } else {
      return moment(date).endOf(DATE_UNIT.MONTH).format('YYYY-MM-DD') === date;
    }
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
    let { selectedGridView, rows, startOffset, endOffset, overscanDates } = this.props;
    let dateUnit = getCalcDateUnit(selectedGridView);
    let canvasRightStyle = {
      width: overscanDates.length * COLUMN_WIDTH + startOffset + endOffset,
      paddingLeft: startOffset,
      paddingRight: endOffset,
    };
    return (
      <div className="canvas-right" ref={ref => this.canvasRight = ref} style={canvasRightStyle} onScroll={this.onCanvasRightScroll}>
        <div className="position-relative" style={{width: '100%', height: '100%'}}>
          {this.renderEventRows(dateUnit)}
          {(Array.isArray(rows) && rows.length > 0) && 
            <div className="today-mark-line position-absolute" style={this.getTodayMarkLineStyle(dateUnit)}></div>
          }
        </div>
      </div>
    );
  }
}

ViewportRight.propTypes = propTypes;

export default ViewportRight;