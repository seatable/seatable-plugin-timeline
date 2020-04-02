import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import TodayMark from './today-mark';
import { dates } from '../../utils';
import { DATE_UNIT } from '../../constants';

const propTypes = {
  overscanDates: PropTypes.array,
  rows: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderDays extends React.Component {

  render() {
    let { overscanDates, rows, columnWidth } = this.props;
    let todayIndex = overscanDates.indexOf(moment().format('YYYY-MM-DD'));
    let todayMarkLeft = todayIndex * columnWidth + (columnWidth - 6) / 2;
    return (
      <div className="header-days position-relative d-inline-flex">
        {overscanDates.map((d) => {
          let week = dates.getDate2Week(d);
          let day = dates.getDateWithUnit(d, DATE_UNIT.DAY);
          return (
            <div className="date-item d-flex flex-column" name={d} key={`date-item-${d}`}>
              <span key={`week-${d}`} className="week d-flex align-items-center justify-content-center">{week}</span>
              <span key={`day-${d}`} className="day d-flex align-items-center justify-content-center">{day}</span>
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

HeaderDays.propTypes = propTypes;

export default HeaderDays;