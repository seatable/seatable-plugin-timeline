import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TodayMark from './today-mark';
import { dates } from '../../utils';
import { DATE_UNIT, DATE_FORMAT } from '../../constants';

const propTypes = {
  overScanDates: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderDays extends React.Component {

  render() {
    let { overScanDates, columnWidth } = this.props;
    let todayIndex = overScanDates.indexOf(moment().format(DATE_FORMAT.YEAR_MONTH_DAY));
    let todayMarkStyle = {
      left: todayIndex * columnWidth + (columnWidth - 6) / 2,
    };
    return (
      <div className="header-days">
        {overScanDates.map((d) => {
          let day = dates.getDateWithUnit(d, DATE_UNIT.DAY);
          return (
            <div className="date-item" name={d} key={`date-item-${d}`}>
              <span key={`day-${d}`} className="day">{day}</span>
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

HeaderDays.propTypes = propTypes;

export default HeaderDays;
