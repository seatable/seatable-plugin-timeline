import moment from 'moment';
import * as dates from './dates';
import { DATE_UNIT, DATE_FORMAT, GRID_VIEWS } from '../constants';
import { GENERAL_COLUMN_WIDTH, MONTH_COLUMN_WIDTH } from '../constants/column';

export const getGridInitState = (selectedGridView, selectedDate, gridStartDate, gridEndDate, viewportRightWidth) => {
  let m_gridStartDate = moment(gridStartDate);
  let m_gridEndDate = moment(gridEndDate);
  let columnWidth = getColumnWidth(selectedGridView);
  let overScanDates = getScanDates(selectedGridView);
  let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
  let visibleStartDate, unit;
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      unit = DATE_UNIT.MONTH;
      m_gridStartDate = m_gridStartDate.subtract(1, DATE_UNIT.MONTH);
      visibleStartDate= moment(selectedDate).startOf(DATE_UNIT.YEAR).subtract(1, DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
    case GRID_VIEWS.MONTH: {
      unit = DATE_UNIT.DAY;
      m_gridStartDate = m_gridStartDate.subtract(4, DATE_UNIT.DAY);
      visibleStartDate= moment(selectedDate).startOf(DATE_UNIT.MONTH).subtract(4, DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
    default: {
      // default view: Day.
      unit = DATE_UNIT.DAY;
      m_gridStartDate = m_gridStartDate.subtract(1, DATE_UNIT.DAY);
      visibleStartDate = moment(selectedDate).subtract(Math.ceil(visibleDatesCount / 3 + 1), DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
  }
  const allDates = dates.getDatesInRange(m_gridStartDate, m_gridEndDate, unit);
  const { visibleEndDate, overScanStartDate, overScanEndDate } = getGridDatesBoundaries(visibleStartDate, visibleDatesCount, overScanDates, unit);
  return {visibleStartDate, visibleEndDate, overScanStartDate, overScanEndDate, allDates};
};

export const getGridDatesBoundaries = (visibleStartDate, visibleDatesCount, overScanDates, unit) => {
  let overScanStartDate = moment(visibleStartDate).add(-overScanDates, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let visibleEndDate = moment(visibleStartDate).add(visibleDatesCount, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let overScanEndDate = moment(visibleEndDate).add(overScanDates, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  return {visibleEndDate, overScanStartDate, overScanEndDate};
};

export const getCompareDate = (selectedGridView, visibleStartDate, visibleDatesCount) => {
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      return moment(visibleStartDate).add(5, DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY);
    }
    case GRID_VIEWS.MONTH: {
      return moment(visibleStartDate).add(15, DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
    }
    default: {
      // default view: Day.
      return moment(visibleStartDate).add(Math.ceil(visibleDatesCount / 3), DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
    }
  }
};

export const canUpdateSelectedDate = (dateA, dateB, selectedGridView) => {
  let formattedDateA = moment(dateA);
  let formattedDateB = moment(dateB);
  let yearOfDateA = formattedDateA.year();
  let yearOfDateB = formattedDateB.year();
  if (selectedGridView === GRID_VIEWS.YEAR) {
    return yearOfDateA !== yearOfDateB;
  } else {
    let monthOfDateA = formattedDateA.month();
    let monthOfDateB = formattedDateB.month();
    return yearOfDateA !== yearOfDateB || monthOfDateA !== monthOfDateB;
  }
};

export const getScanDates = (selectedGridView) => {
  switch (selectedGridView) {
    case GRID_VIEWS.MONTH: {
      return 40;
    }
    default: {
      return 10;
    }
  }
};

export const getCalcDateUnit = (selectedGridView) => {
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      return DATE_UNIT.MONTH;
    }
    default: {
      return DATE_UNIT.DAY;
    }
  }
};

export const getColumnWidth = (selectedGridView) => {
  switch (selectedGridView) {
    case GRID_VIEWS.MONTH: {
      return MONTH_COLUMN_WIDTH;
    }
    default: {
      return GENERAL_COLUMN_WIDTH;
    }
  }
};

export const getRenderedDates = (selectedGridView, overScanDates) => {
  if (selectedGridView === GRID_VIEWS.YEAR) {
    return dates.getUniqueDates(overScanDates, DATE_UNIT.YEAR, DATE_FORMAT.YEAR);
  } else if (selectedGridView === GRID_VIEWS.MONTH) {
    return dates.getUniqueDates(overScanDates, DATE_UNIT.MONTH, DATE_FORMAT.YEAR_MONTH_DAY);
  } else if (selectedGridView === GRID_VIEWS.DAY) {
    return overScanDates;
  }
};