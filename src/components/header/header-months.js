import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TodayMark from './today-mark';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';
import { dates } from '../../utils';

const propTypes = {
  overscanDates: PropTypes.array,
  rows: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderMonths extends React.Component {

  render() {
    let { overscanDates, rows, columnWidth } = this.props;
    let todayIndex = overscanDates.indexOf(moment().format(DATE_FORMAT.YEAR_MONTH_DAY));
    let todayMarkLeft = todayIndex * columnWidth + (columnWidth - 6) / 2;
    let monthDates = dates.getUniqueDates(overscanDates, DATE_UNIT.MONTH, DATE_FORMAT.YEAR_MONTH);
    return (
      <div className="header-months position-relative d-inline-flex align-items-end">
        {monthDates.map(d => {
          let startOfMonth = moment(d).startOf(DATE_UNIT.MONTH);
          let endOfMonth = moment(d).endOf(DATE_UNIT.MONTH);
          let dateItemWidth = (endOfMonth.diff(d, DATE_UNIT.DAY) + 1) * columnWidth;
          let displayDate;
          if (moment(d).startOf(DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY) === d) {
            displayDate = `${startOfMonth.format('D')} \u2192 ${endOfMonth.format('D')}`;
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