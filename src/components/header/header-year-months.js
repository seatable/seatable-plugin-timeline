import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { dates } from '../../utils';
import { COLUMN_WIDTH, DATE_UNIT } from '../../constants';

const propTypes = {
  overscanDates: PropTypes.array,
  rows: PropTypes.array,
};

class HeaderYearMonths extends React.Component {

  render() {
    let { overscanDates, rows } = this.props;
    let todayMarkLeft = overscanDates.indexOf(moment().startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD')) * COLUMN_WIDTH + (COLUMN_WIDTH - 6) / 2;
    return (
      <div className="header-year-months position-relative d-inline-flex align-items-end">
        {overscanDates.map((d) => {
          let month = dates.getDate2Month(d);
          return (
            <div className="month-item d-flex flex-column" name={d} key={`day-item-${d}`}>
              <span key={`month-${d}`} className="month d-flex align-items-center justify-content-center">{month}</span>
            </div>
          );
        })}
        {(Array.isArray(rows) && rows.length > 0) &&
          <div className="today-mark position-absolute" style={{left: todayMarkLeft}}></div>
        }
      </div>
    );
  }
}

HeaderYearMonths.propTypes = propTypes;

export default HeaderYearMonths;