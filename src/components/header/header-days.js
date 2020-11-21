import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TodayMark from './today-mark';
import { dates } from '../../utils';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';

const propTypes = {
  overScanDates: PropTypes.array,
  renderedRows: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderDays extends React.Component {

  render() {
    let { overScanDates, renderedRows, columnWidth } = this.props;
    let todayIndex = overScanDates.indexOf(moment().format(DATE_FORMAT.YEAR_MONTH_DAY));
    let todayMarkStyle = {
      left: todayIndex * columnWidth + (columnWidth - 6) / 2,
    };
    return (
      <div className="header-days position-relative d-inline-flex">
        {overScanDates.map((d) => {
          let day = dates.getDateWithUnit(d, DATE_UNIT.DAY);
          return (
            <div className="date-item d-flex flex-column" name={d} key={`date-item-${d}`}>
              <span key={`day-${d}`} className="day d-flex align-items-center justify-content-center">{day}</span>
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

HeaderDays.propTypes = propTypes;

export default HeaderDays;