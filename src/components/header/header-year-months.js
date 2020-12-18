import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TodayMark from './today-mark';
import { dates } from '../../utils';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';
import intl from 'react-intl-universal';
import '../../locale';

const propTypes = {
  overScanDates: PropTypes.array,
  renderedRows: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderYearMonths extends React.Component {

  render() {
    let { overScanDates, columnWidth } = this.props;
    let todayIndex = overScanDates.indexOf(moment().startOf(DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY));
    let todayMarkStyle = {
      left: todayIndex * columnWidth + (columnWidth - 6) / 2,
      top: 23
    };
    return (
      <div className="header-year-months position-relative d-inline-flex align-items-end">
        {overScanDates.map((d) => {
          let displayDate = intl.get(dates.getDate2Month(d));
          return (
            <div className="date-item d-flex flex-column" name={d} key={`date-item-${d}`}>
              <span key={`month-${d}`} className="month d-flex align-items-center justify-content-center">{displayDate}</span>
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