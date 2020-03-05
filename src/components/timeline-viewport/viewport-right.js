import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import moment from 'moment';
import EventRow from '../event-row';
import { dates } from '../../utils';
import { ROW_HEIGHT, COLUMN_WIDTH, zIndexs } from '../../constants';
import SingleSelectFormatter from '../../components/cell-formatter/single-select-formatter';

const propTypes = {
  isToday: PropTypes.bool,
  days: PropTypes.array,
  rows: PropTypes.array,
  selectedDate: PropTypes.string,
  startDateOfMonth: PropTypes.string,
  minWidth: PropTypes.number,
  dayOfToday: PropTypes.string,
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
    let { startDateOfMonth } = this.props;
    let { collaborator, events } = row;
    if (!Array.isArray(events)) {
      return [];
    }
    return events.map((e, index) => {
      let { label, bgColor, start, end }  = e;
      let duration = moment(end).diff(moment(start), 'days');
      let width = duration * COLUMN_WIDTH;
      let left = moment(start).diff(moment(startDateOfMonth), 'days') * COLUMN_WIDTH;
      if (duration < 1) {
        return null;
      }
      return <div key={`timeline-event-cell-${collaborator}-${index}`} className="timeline-event-cell">
        <SingleSelectFormatter
          label={label}
          bgColor={bgColor}
          width={width}
          left={left}
        />
      </div>
    });
  }

  renderBgCells = () => {
    let { days } = this.props;
    return days.map((d) => {
      let week = dates.getDate2Week(d);
      return (
        <div key={`timeline-day-bg-${d}`} className={classnames({'timeline-day-bg': true, 'sun-or-sat-day': week === 'S'})} style={{width: COLUMN_WIDTH}}></div>
      );
    });
  }

  getTodayMarkLineStyle = () => {
    let { rows, dayOfToday } = this.props;
    let left = (dayOfToday - 1) * COLUMN_WIDTH + COLUMN_WIDTH / 2;
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
    this.setScroll({scrollLeft, scrollTop});
    this.props.onViewportRightScroll({scrollLeft, scrollTop});
  }

  setScroll = ({scrollLeft, scrollTop}) => {
    this.viewportRight.scrollLeft = scrollLeft;
    this.viewportRight.scrollTop = scrollTop;
  }

  render() {
    let { isToday, rows, minWidth } = this.props;
    let viewportRightStyle = {minWidth};

    return (
      <div className="viewport-right position-relative" ref={ref => this.viewportRight = ref} style={viewportRightStyle} onScroll={this.onViewportRightScroll}>
        {this.renderEventRows()}
        {(isToday && rows && rows.length > 0) && 
          <div className="today-mark-line position-absolute" style={this.getTodayMarkLineStyle()}></div>
        }
      </div>
    );
  }
}

ViewportRight.propTypes = propTypes;

export default ViewportRight;