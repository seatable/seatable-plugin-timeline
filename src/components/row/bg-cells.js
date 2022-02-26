import React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { DATE_FORMAT, DATE_UNIT, GRID_VIEWS } from '../../constants';

function BgCells({selectedGridView, columnWidth, renderedDates}) {
  const isWeekend = (date) => {
    if (selectedGridView === GRID_VIEWS.DAY) {
      return moment(date).isoWeekday() === 6 ||
        moment(date).isoWeekday() === 7;
    }
    return false;
  };

  const isEndOfRange = (date) => {
    if (selectedGridView === GRID_VIEWS.YEAR) {
      return moment(date).endOf(DATE_UNIT.YEAR).format(DATE_FORMAT.YEAR_MONTH) === moment(date).format(DATE_FORMAT.YEAR_MONTH);
    } else if (selectedGridView === GRID_VIEWS.DAY || GRID_VIEWS.MONTH) {
      return moment(date).endOf(DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY) === date;
    }
    return false;
  };

  return renderedDates.map((d) => {
    let dateItemWidth, _isWeekend = false, isEndRange = false;
    if (selectedGridView === GRID_VIEWS.YEAR) {
      isEndRange = true;
      let endOfYear = moment(d).endOf(DATE_UNIT.YEAR);
      dateItemWidth = (endOfYear.diff(d, DATE_UNIT.MONTH) + 1) * columnWidth;
    } else if (selectedGridView === GRID_VIEWS.MONTH) {
      isEndRange = true;
      let endOfMonth = moment(d).endOf(DATE_UNIT.MONTH);
      dateItemWidth = (moment(endOfMonth).diff(d, DATE_UNIT.DAY) + 1) * columnWidth;
    } else {
      isEndRange = isEndOfRange(d);
      _isWeekend = isWeekend(d);
      dateItemWidth = columnWidth;
    }
    const dateBgClassName = classnames({
      'timeline-date-bg': true,
      'd-inline-block': true,
      'sun-or-sat-day': _isWeekend,
      'end-of-range': isEndRange
    });
    return (
      <div key={`timeline-date-bg-${d}`} name={d} className={dateBgClassName} style={{width: dateItemWidth}}></div>
    );
  });
}

BgCells.propTypes = {
  selectedGridView: PropTypes.string,
  columnWidth: PropTypes.number,
  renderedDates: PropTypes.array,
};

export default BgCells;
