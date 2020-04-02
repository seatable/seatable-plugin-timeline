import moment from 'moment';
import * as dates from './dates';
import { DATE_UNIT, GRID_VIEWS } from '../constants';

export const getGridState = (selectedGridView, selectedDate, viewportRightWidth) => {
  let columnWidth = getColumnWidth(selectedGridView);
  let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
  let { overScanItems, gridScanItems } = getScanItems(selectedGridView);
  let visibleStartDate, unit;
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      unit = DATE_UNIT.MONTH;
      visibleStartDate= moment(selectedDate).startOf(DATE_UNIT.YEAR).format('YYYY-MM-DD');
      break;
    }
    case GRID_VIEWS.MONTH: {
      unit = DATE_UNIT.DAY;
      visibleStartDate= moment(selectedDate).startOf(DATE_UNIT.MONTH).format('YYYY-MM-DD');
      break;
    }
    default: {
      // default view: Day.
      unit = DATE_UNIT.DAY;
      visibleStartDate = moment(selectedDate).add(-Math.ceil(visibleDatesCount / 2), DATE_UNIT.DAY).format('YYYY-MM-DD');
      break;
    }
  }
  let { overscanStartDate, gridStartDate, visibleEndDate, overscanEndDate, gridEndDate } = getGridDatesBoundaries(visibleStartDate, visibleDatesCount, overScanItems, gridScanItems, unit);
  let amountDates = dates.getDatesInRange(gridStartDate, gridEndDate, unit);
  return {visibleStartDate, visibleEndDate, overscanStartDate, overscanEndDate, amountDates};
}

export const getGridDatesBoundaries = (visibleStartDate, visibleDatesCount, overScanItems, gridScanItems, unit) => {
  let overscanStartDate = moment(visibleStartDate).add(-overScanItems, unit).format('YYYY-MM-DD');
  let gridStartDate = moment(visibleStartDate).add(-gridScanItems, unit);
  let visibleEndDate = moment(visibleStartDate).add(visibleDatesCount, unit).format('YYYY-MM-DD');
  let overscanEndDate = moment(visibleEndDate).add(overScanItems, unit).format('YYYY-MM-DD');
  let gridEndDate = moment(visibleEndDate).add(gridScanItems, unit);
  return {overscanStartDate, gridStartDate, visibleEndDate, overscanEndDate, gridEndDate};
}

export const getCompareDate = (selectedGridView, visibleStartDate, visibleDatesCount) => {
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      return moment(visibleStartDate).add(5, DATE_UNIT.MONTH).format('YYYY-MM-DD');
    }
    case GRID_VIEWS.MONTH: {
      return moment(visibleStartDate).add(15, DATE_UNIT.DAY).format('YYYY-MM-DD');
    }
    default: {
      // default view: Day.
      return moment(visibleStartDate).add(Math.ceil(visibleDatesCount / 2), DATE_UNIT.DAY).format('YYYY-MM-DD');
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
      return {overScanItems: 40, gridScanItems: 160};
    }
    default: {
      return {overScanItems: 10, gridScanItems: 40};
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
      return 10;
    }
    default: {
      return 40;
    }
  }
}