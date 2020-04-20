import moment from 'moment';
import * as dates from './dates';
import { DATE_UNIT, DATE_FORMAT, GRID_VIEWS } from '../constants';

const GENERAL_COLUMN_WIDTH = 40;
const MONTH_COLUMN_WIDTH = 10;

export const getGridState = (selectedGridView, selectedDate, viewportRightWidth) => {
  let columnWidth = getColumnWidth(selectedGridView);
  let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
  let { overscanDates, gridDates } = getScanDates(selectedGridView);
  let visibleStartDate, unit;
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      unit = DATE_UNIT.MONTH;
      visibleStartDate= moment(selectedDate).startOf(DATE_UNIT.YEAR).add(-1, DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
    case GRID_VIEWS.MONTH: {
      unit = DATE_UNIT.DAY;
      visibleStartDate= moment(selectedDate).startOf(DATE_UNIT.MONTH).add(-4, DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
    default: {
      // default view: Day.
      unit = DATE_UNIT.DAY;
      visibleStartDate = moment(selectedDate).add(-(Math.ceil(visibleDatesCount / 3 + 1)), DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
  }
  let { gridStartDate, gridEndDate, visibleEndDate, overscanStartDate, overscanEndDate } = getGridDatesBoundaries(visibleStartDate, visibleDatesCount, overscanDates, gridDates, unit);
  let amountDates = dates.getDatesInRange(gridStartDate, gridEndDate, unit);
  return {gridStartDate, gridEndDate, visibleStartDate, visibleEndDate, overscanStartDate, overscanEndDate, amountDates};
}

export const getGridDatesBoundaries = (visibleStartDate, visibleDatesCount, overscanDates, gridDates, unit) => {
  let overscanStartDate = moment(visibleStartDate).add(-overscanDates, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let gridStartDate = moment(visibleStartDate).add(-gridDates, unit);
  let visibleEndDate = moment(visibleStartDate).add(visibleDatesCount, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let overscanEndDate = moment(visibleEndDate).add(overscanDates, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let gridEndDate = moment(visibleEndDate).add(gridDates, unit);
  return {gridStartDate, gridEndDate, visibleEndDate, overscanStartDate, overscanEndDate};
}

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
}

export const isDifferentScope = (dateA, dateB, selectedGridView) => {
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
}

export const getScanDates = (selectedGridView) => {
  switch (selectedGridView) {
    case GRID_VIEWS.MONTH: {
      return {overscanDates: 40, gridDates: 240};
    }
    default: {
      return {overscanDates: 10, gridDates: 80};
    }
  }
}

export const getCalcDateUnit = (selectedGridView) => {
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      return DATE_UNIT.MONTH;
    }
    default: {
      return DATE_UNIT.DAY;
    }
  }
}

export const getColumnWidth = (selectedGridView) => {
  switch (selectedGridView) {
    case GRID_VIEWS.MONTH: {
      return MONTH_COLUMN_WIDTH;
    }
    default: {
      return GENERAL_COLUMN_WIDTH;
    }
  }
}

export const getRenderedDates = (selectedGridView, overscanDates) => {
  if (selectedGridView === GRID_VIEWS.YEAR) {
    return dates.getUniqueDates(overscanDates, DATE_UNIT.YEAR, DATE_FORMAT.YEAR);
  } else if (selectedGridView === GRID_VIEWS.MONTH) {
    return dates.getUniqueDates(overscanDates, DATE_UNIT.MONTH, DATE_FORMAT.YEAR_MONTH_DAY);
  } else if (selectedGridView === GRID_VIEWS.DAY) {
    return overscanDates;
  }
}