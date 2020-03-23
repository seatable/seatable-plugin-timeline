import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import EventRow from '../event-row';
import EventCell from '../event-cell';
import { dates } from '../../utils';
import { ROW_HEIGHT, COLUMN_WIDTH, DATE_UNIT, zIndexs } from '../../constants';
import SingleSelectFormatter from '../../components/cell-formatter/single-select-formatter';

const propTypes = {
  isToday: PropTypes.bool,
  days: PropTypes.array,
  rows: PropTypes.array,
  selectedDate: PropTypes.string,
  startDateOfMonth: PropTypes.string,
  endDateOfMonth: PropTypes.string,
  width: PropTypes.number,
  onViewportRightScroll: PropTypes.func,
};

class ViewportRight extends React.Component {

  renderEventRows = () => {
    let { rows } = this.props;
    if (!rows || rows.length === 0) {
      return <div className="no-events d-flex align-items-center justify-content-center">暂无相关记录。</div>
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
                cells={this.renderEventCells(r)}
              />
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  renderEventCells = (row) => {
    let { overscanDays } = this.props;
    let { user, events } = row;
    let startDate = overscanDays[0];
    let endDate = overscanDays[overscanDays.length - 1];
    let displayEvents = this.getEventsInRange(events, startDate, endDate);
    return displayEvents.map((e, index) => {
      let { label, bgColor, start, end } = e;
      let duration = moment(end).diff(moment(start), 'days');
      let width = duration * COLUMN_WIDTH;
      let left = moment(start).diff(moment(startDate), 'days') * COLUMN_WIDTH;
      if (duration < 1) {
        return null;
      }
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
    let { overscanDays } = this.props;
    return overscanDays.map((d) => {
      let week = dates.getDate2Week(d);
      let isEndOfMonth = moment(d).endOf(DATE_UNIT.MONTH).format('YYYY-MM-DD') === d;
      return (
        <div
          key={`timeline-day-bg-${d}`}
          name={d}
          className={classnames({'timeline-day-bg': true, 'sun-or-sat-day': week === 'S', 'd-inline-block': true, 'end-of-month': isEndOfMonth})}
          style={{width: COLUMN_WIDTH}}
        ></div>
      );
    });
  }

  getEventsInRange = (events, startDate, endDate) => {
    if (!Array.isArray(events)) {
      return [];
    }
    return events.filter(e => moment(e.start).isBetween(startDate, endDate) ||
      moment(e.end).isBetween(startDate, endDate)
    );
  }

  getTodayMarkLineStyle = () => {
    let { rows, overscanDays } = this.props;
    let left = dates.getDaysInRange(overscanDays[0], moment().format('YYYY-MM-DD')).length * COLUMN_WIDTH + COLUMN_WIDTH / 2;
    let height = rows.length * ROW_HEIGHT;
    return {
      top: 0,
      height,
      left,
      zIndex: zIndexs.TODAY_MARK_LINE,
    };
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
    let { isToday, rows, startOffset, endOffset, overscanDays } = this.props;
    let canvasRightStyle = {
      width: overscanDays.length * COLUMN_WIDTH + startOffset + endOffset,
      paddingLeft: startOffset,
      paddingRight: endOffset,
    };
    return (
      <div className="canvas-right" ref={ref => this.canvasRight = ref} style={canvasRightStyle} onScroll={this.onCanvasRightScroll}>
        <div className="position-relative" style={{width: '100%', height: '100%'}}>
          {this.renderEventRows()}
          {(isToday && rows && rows.length > 0) && 
            <div className="today-mark-line position-absolute" style={this.getTodayMarkLineStyle()}></div>
          }
        </div>
      </div>
    );
  }
}

ViewportRight.propTypes = propTypes;

export default ViewportRight;