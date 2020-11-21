import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TodayMark from './today-mark';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';
import intl from 'react-intl-universal';

import '../../locale';

const propTypes = {
  overScanDates: PropTypes.array,
  renderedDates: PropTypes.array,
  renderedRows: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderDaysRange extends React.Component {

  render() {
    let { overScanDates, renderedDates, renderedRows, columnWidth } = this.props;
    let todayIndex = overScanDates.indexOf(moment().format(DATE_FORMAT.YEAR_MONTH_DAY));
    let todayMarkStyle = {
      left: todayIndex * columnWidth + (columnWidth - 6) / 2,
      top: 23
    };

    return (
      <div className="header-days-range position-relative d-inline-flex align-items-end">
        {renderedDates.map(d => {
          let startOfMonth = moment(d).startOf(DATE_UNIT.MONTH);
          let endOfMonth = moment(d).endOf(DATE_UNIT.MONTH);
          let dateItemWidth = (endOfMonth.diff(d, DATE_UNIT.DAY) + 1) * columnWidth;
          let displayDate;
          if (moment(d).startOf(DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY) === d) {
            displayDate = intl.get('days_range', {startOfMonthDay: startOfMonth.format('D'), endOfMonthDay: endOfMonth.format('D')});
          }
          return (
            <div className="date-item d-flex flex-column" name={d} key={`date-item-${d}`} style={{width: dateItemWidth}}>
              <span key={`month-${d}`} className="days-range-item d-flex align-items-center justify-content-center">{displayDate}</span>
            </div>
          );
        })}
        {(todayIndex > -1 && Array.isArray(renderedRows) && renderedRows.length > 0) &&
          <TodayMark style={todayMarkStyle} />
        }
      </div>
    );
  }
}

HeaderDaysRange.propTypes = propTypes;

export default HeaderDaysRange;