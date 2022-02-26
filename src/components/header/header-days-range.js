import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import intl from 'react-intl-universal';
import TodayMark from './today-mark';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';

const propTypes = {
  overScanDates: PropTypes.array,
  renderedDates: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderDaysRange extends React.Component {

  render() {
    let { overScanDates, renderedDates, columnWidth } = this.props;
    let todayIndex = overScanDates.indexOf(dayjs().format(DATE_FORMAT.YEAR_MONTH_DAY));
    let todayMarkStyle = {
      left: todayIndex * columnWidth + (columnWidth - 6) / 2,
      top: 23
    };

    return (
      <div className="header-days-range">
        {renderedDates.map(d => {
          let startOfMonth = dayjs(d).startOf(DATE_UNIT.MONTH);
          let endOfMonth = dayjs(d).endOf(DATE_UNIT.MONTH);
          let dateItemWidth = (endOfMonth.diff(d, DATE_UNIT.DAY) + 1) * columnWidth;
          let displayDate;
          if (dayjs(d).startOf(DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY) === d) {
            displayDate = intl.get('days_range', {startOfMonthDay: startOfMonth.format('D'), endOfMonthDay: endOfMonth.format('D')});
          }
          return (
            <div className="date-item" name={d} key={`date-item-${d}`} style={{width: dateItemWidth}}>
              <span key={`month-${d}`} className="days-range-item">{displayDate}</span>
            </div>
          );
        })}
        {todayIndex > -1 &&
          <TodayMark style={todayMarkStyle} />
        }
      </div>
    );
  }
}

HeaderDaysRange.propTypes = propTypes;

export default HeaderDaysRange;
