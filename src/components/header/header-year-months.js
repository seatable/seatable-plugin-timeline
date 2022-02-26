import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import intl from 'react-intl-universal';
import TodayMark from './today-mark';
import { dates } from '../../utils';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';

const propTypes = {
  overScanDates: PropTypes.array,
  renderedRows: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderYearMonths extends React.Component {

  render() {
    let { overScanDates, columnWidth } = this.props;
    let todayIndex = overScanDates.indexOf(dayjs().startOf(DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY));
    let todayMarkStyle = {
      left: todayIndex * columnWidth + (columnWidth - 6) / 2,
      top: 23
    };
    return (
      <div className="header-year-months">
        {overScanDates.map((d) => {
          let displayDate = intl.get(dates.getDate2Month(d));
          return (
            <div className="date-item" name={d} key={`date-item-${d}`}>
              <span key={`month-${d}`} className="month">{displayDate}</span>
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

HeaderYearMonths.propTypes = propTypes;

export default HeaderYearMonths;
