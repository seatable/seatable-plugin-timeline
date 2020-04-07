import moment from 'moment';
import * as dates from './dates';
import { DATE_UNIT, DATE_FORMAT, GRID_VIEWS } from '../constants';

const GENERAL_COLUMN_WIDTH = 40;
const MONTH_COLUMN_WIDTH = 10;

export const getGridState = (selectedGridView, selectedDate, viewportRightWidth) => {
  let columnWidth = getColumnWidth(selectedGridView);
  let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
  let { overScanItems, gridScanItems } = getScanItems(selectedGridView);
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
  let { overscanStartDate, gridStartDate, visibleEndDate, overscanEndDate, gridEndDate } = getGridDatesBoundaries(visibleStartDate, visibleDatesCount, overScanItems, gridScanItems, unit);
  let amountDates = dates.getDatesInRange(gridStartDate, gridEndDate, unit);
  return {visibleStartDate, visibleEndDate, overscanStartDate, overscanEndDate, amountDates};
}

export const getGridDatesBoundaries = (visibleStartDate, visibleDatesCount, overScanItems, gridScanItems, unit) => {
  let overscanStartDate = moment(visibleStartDate).add(-overScanItems, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let gridStartDate = moment(visibleStartDate).add(-gridScanItems, unit);
  let visibleEndDate = moment(visibleStartDate).add(visibleDatesCount, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let overscanEndDate = moment(visibleEndDate).add(overScanItems, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let gridEndDate = moment(visibleEndDate).add(gridScanItems, unit);
  return {overscanStartDate, gridStartDate, visibleEndDate, overscanEndDate, gridEndDate};
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

export const getScanItems = (selectedGridView) => {
  switch (selectedGridView) {
    case GRID_VIEWS.MONTH: {
      return {overScanItems: 80, gridScanItems: 240};
    }
    default: {
      return {overScanItems: 10, gridScanItems: 80};
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