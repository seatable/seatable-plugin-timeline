import moment from 'moment';
import * as dates from './dates';
import { DATE_UNIT, DATE_FORMAT, GRID_VIEWS } from '../constants';

const GENERAL_COLUMN_WIDTH = 40;
const MONTH_COLUMN_WIDTH = 10;

export const getGridInitState = (selectedGridView, selectedDate, viewportRightWidth) => {
  let gridStartDate = moment().subtract(15, DATE_UNIT.YEAR).startOf(DATE_UNIT.YEAR);
  let gridEndDate = moment().add(15, DATE_UNIT.YEAR).endOf(DATE_UNIT.YEAR);
  let columnWidth = getColumnWidth(selectedGridView);
  let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
  let { overScanDates, gridDates } = getScanDates(selectedGridView);
  let visibleStartDate, unit;
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      unit = DATE_UNIT.MONTH;
      gridStartDate = gridStartDate.subtract(1, DATE_UNIT.MONTH);
      visibleStartDate= moment(selectedDate).startOf(DATE_UNIT.YEAR).subtract(1, DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
    case GRID_VIEWS.MONTH: {
      unit = DATE_UNIT.DAY;
      gridStartDate = gridStartDate.subtract(4, DATE_UNIT.DAY);
      visibleStartDate= moment(selectedDate).startOf(DATE_UNIT.MONTH).subtract(-4, DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
    default: {
      // default view: Day.
      unit = DATE_UNIT.DAY;
      const diffs = -(Math.ceil(visibleDatesCount / 3 + 1));
      gridStartDate = gridStartDate.subtract(diffs, DATE_UNIT.DAY);
      visibleStartDate = moment(selectedDate).add(diffs, DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
  }
  const allDates = dates.getDatesInRange(gridStartDate, gridEndDate, unit);
  const { visibleEndDate, overScanStartDate, overScanEndDate } = getGridDatesBoundaries(visibleStartDate, visibleDatesCount, overScanDates, gridDates, unit);
  return {visibleStartDate, visibleEndDate, overScanStartDate, overScanEndDate, allDates};
};

export const getGridDatesBoundaries = (visibleStartDate, visibleDatesCount, overScanDates, gridDates, unit) => {
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
    return (yearOfDateA !== yearOfDateB);
  } else {
    let monthOfDateA = formattedDateA.month();
    let monthOfDateB = formattedDateB.month();
    return (yearOfDateA !== yearOfDateB) ||
      (monthOfDateA !== monthOfDateB);
  }
};

export const getScanDates = (selectedGridView) => {
  switch (selectedGridView) {
    case GRID_VIEWS.MONTH: {
      return {overScanDates: 40, gridDates: 200};
    }
    default: {
      return {overScanDates: 10, gridDates: 80};
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