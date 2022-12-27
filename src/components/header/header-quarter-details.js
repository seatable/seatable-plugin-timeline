import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import intl from 'react-intl-universal';
import TodayMark from './today-mark';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';

import * as dates from '../../utils/dates';

const propTypes = {
  overScanDates: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderQuarterDetails extends React.Component {

  render() {
    const { overScanDates, columnWidth } = this.props;
    const todayIndex = overScanDates.indexOf(dayjs().format(DATE_FORMAT.YEAR_MONTH_DAY));
    const todayMarkStyle = {
      left: todayIndex * columnWidth + (columnWidth - 6) / 2,
      top: 23
    };

    const renderedDates = dates.getUniqueDates(overScanDates, DATE_UNIT.MONTH, DATE_FORMAT.YEAR_MONTH_DAY);

    return (
      <div className="header-days-range">
        {renderedDates.map(d => {
          let endOfMonth = dayjs(d).endOf(DATE_UNIT.MONTH);
          let dateItemWidth = (endOfMonth.diff(d, DATE_UNIT.DAY) + 1) * columnWidth;
          let displayDate;
          if (dayjs(d).startOf(DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY) === d) {
            displayDate = intl.get(dates.getDate2Month(d));
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

HeaderQuarterDetails.propTypes = propTypes;

export default HeaderQuarterDetails;
