import React from 'react';
import PropTypes from 'prop-types';
import { dates } from '../../utils';
import { DATE_UNIT } from '../../constants';

const propTypes = {
  isToday: PropTypes.bool,
  dayOfToday: PropTypes.string,
  days: PropTypes.array,
  rows: PropTypes.array,
};

class HeaderDays extends React.Component {

  render() {
    let { isToday, dayOfToday, days, rows } = this.props;
    let todayMarkLeft = (dayOfToday - 1) * 40 + (40 - 6) / 2;
    return (
      <div className="header-days position-relative d-flex">
        {days.map((d) => {
          let day = dates.getDateWithUnit(d, DATE_UNIT.DAY);
          return <div key={`header-days-${d}`} className="day-item d-inline-flex justify-content-center">{day}</div>;
        })}
        {(isToday && rows && rows.length > 0) &&
          <div className="today-mark position-absolute" style={{left: todayMarkLeft}}></div>
        }
      </div>
    );
  }
}

HeaderDays.propTypes = propTypes;

export default HeaderDays;