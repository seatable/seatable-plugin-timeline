import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TodayMark from './today-mark';
import { DATE_UNIT } from '../../constants';

const propTypes = {
  overscanDates: PropTypes.array,
  rows: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderMonths extends React.Component {

  getMonthDates = () => {
    let { overscanDates } = this.props;
    let exsitMonth, dates = []
    Array.isArray(overscanDates) && overscanDates.forEach((d) => {
      let startOfMonth = moment(d).startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD')
      if (exsitMonth !== startOfMonth) {
        dates.push(d);
        exsitMonth = startOfMonth;
      }
    });
    return dates;
  }

  render() {
    let { overscanDates, rows, columnWidth } = this.props;
    let todayIndex = overscanDates.indexOf(moment().format('YYYY-MM-DD'));
    let todayMarkLeft = todayIndex * columnWidth + (columnWidth - 6) / 2;
    let monthDates = this.getMonthDates();
    return (
      <div className="header-months position-relative d-inline-flex align-items-end">
        {monthDates.map(d => {
          let dateItemWidth = (moment(d).endOf(DATE_UNIT.MONTH).diff(d, DATE_UNIT.DAY) + 1) * columnWidth;
          let displayDate;
          if (moment(d).startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD') === d) {
            displayDate = `${moment(d).format('D')}-${moment(d).endOf(DATE_UNIT.MONTH).format('D')}`;
          }
          return (
            <div className="date-item d-flex flex-column" name={d} key={`date-item-${d}`} style={{width: dateItemWidth}}>
              <span key={`month-${d}`} className="month d-flex align-items-center justify-content-center">{displayDate}</span>
            </div>
          );
        })}
        {(todayIndex > -1 && Array.isArray(rows) && rows.length > 0) &&
          <TodayMark style={{left: todayMarkLeft}} />
        }
      </div>
    );
  }
}

HeaderMonths.propTypes = propTypes;

export default HeaderMonths;