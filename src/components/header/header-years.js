import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DATE_UNIT, DATE_FORMAT, GRID_VIEWS } from '../../constants';

const propTypes = {
  selectedGridView: PropTypes.string,
  yearDates: PropTypes.array,
  columnWidth: PropTypes.number,
};

class HeaderYears extends React.Component {

  renderYearDates = () => {
    let { selectedGridView, yearDates, columnWidth } = this.props;
    return Array.isArray(yearDates) && yearDates.map((d) => {
      let calcUnit, displayFormat, displayDate, dateItemWidth = 0;
      if (selectedGridView === GRID_VIEWS.YEAR) {
        calcUnit = DATE_UNIT.YEAR;
        displayFormat = DATE_FORMAT.YEAR;
        dateItemWidth = (moment(d).endOf(DATE_UNIT.YEAR).diff(d, DATE_UNIT.MONTH) + 1) * columnWidth;
      } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
        calcUnit = DATE_UNIT.MONTH;
        displayFormat = DATE_FORMAT.YEAR_MONTH;
        dateItemWidth = (moment(d).endOf(DATE_UNIT.MONTH).diff(d, DATE_UNIT.DAY) + 1) * columnWidth;
      }
      if (moment(d).startOf(calcUnit).format(DATE_FORMAT.YEAR_MONTH_DAY) === d) {
        displayDate = moment(d).format(displayFormat);
      }
      return (
        <div className="year-item d-flex flex-column" name={d} key={`date-item-${d}`} style={{width: dateItemWidth}}>
          <span key={`year-${d}`} className="month d-flex align-items-center">{displayDate}</span>
        </div>
      );
    });
  }

  render() {
    return (
      <div className="header-years position-relative d-inline-flex align-items-center">
        {this.renderYearDates()}
      </div>
    );
  }
}

HeaderYears.propTypes = propTypes;

export default HeaderYears;