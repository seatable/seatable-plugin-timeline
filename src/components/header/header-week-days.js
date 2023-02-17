import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import TodayMark from './today-mark';
import { dates } from '../../utils';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';

const propTypes = {
  overScanDates: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderWeekDays extends React.Component {
  render() {
    const { overScanDates, columnWidth } = this.props;
    const todayIndex = overScanDates.indexOf(dayjs().format(DATE_FORMAT.YEAR_MONTH_DAY));
    const todayMarkStyle = {
      left: todayIndex * columnWidth + (columnWidth - 6) / 2,
      top: 23
    };
    const renderedWeekDates = dates.getUniqueDates(overScanDates, DATE_UNIT.WEEK, DATE_FORMAT.YEAR_MONTH_DAY);
    const lastOverScanDate = overScanDates[overScanDates.length - 1];
    const lastRenderedDate = renderedWeekDates[renderedWeekDates.length - 1];
    return (
      <div className="header-days-range">
        {renderedWeekDates.map(d => {
          let endOfMonth = dayjs(d).endOf(DATE_UNIT.WEEK);
          let dateItemWidth = (endOfMonth.diff(d, DATE_UNIT.DAY) + 1) * columnWidth;
          let displayDate = dayjs(d).format('D');
          // When this date is the last date on a weekly scale, need to calculate the width between it and the actual rendered date
          if (d === lastRenderedDate) {
            dateItemWidth = (dayjs(lastOverScanDate).diff(d, DATE_UNIT.DAY)) * columnWidth;
          }
          return (
            <div className="date-item" name={d} key={`date-item-${d}`} style={{width: dateItemWidth}}>
              <span key={`month-${d}`} className="week-date-item">{displayDate}</span>
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

HeaderWeekDays.propTypes = propTypes;

export default HeaderWeekDays;
