import moment from 'moment';
import * as dates from './dates';
import { DATE_UNIT, GRID_VIEWS, COLUMN_WIDTH } from '../constants';

export const getGridState = (selectedGridView, selectedDate, viewportRightWidth) => {
  let visibleDatesCount = Math.ceil(viewportRightWidth / COLUMN_WIDTH);
  let visibleStartDate, unit;
  if (selectedGridView === GRID_VIEWS.YEAR) {
    unit = DATE_UNIT.MONTH;
    visibleStartDate= moment(selectedDate).startOf(DATE_UNIT.YEAR).format('YYYY-MM-DD');
  } else {
    unit = DATE_UNIT.DAY;
    visibleStartDate = moment(selectedDate).add(-Math.ceil(visibleDatesCount / 2), DATE_UNIT.DAY).format('YYYY-MM-DD')
  }
  let { overscanStartDate, gridStartDate, visibleEndDate, overscanEndDate, gridEndDate } = getGridDatesBoundaries(visibleStartDate, visibleDatesCount, unit);
  let amountDates = dates.getDatesInRange(gridStartDate, gridEndDate, unit);
  return {visibleStartDate, visibleEndDate, overscanStartDate, overscanEndDate, amountDates};
}

export const getGridDatesBoundaries = (visibleStartDate, visibleDatesCount, unit) => {
  let overscanStartDate = moment(visibleStartDate).add(-10, unit).format('YYYY-MM-DD');
  let gridStartDate = moment(visibleStartDate).add(-40, unit);
  let visibleEndDate = moment(visibleStartDate).add(visibleDatesCount, unit).format('YYYY-MM-DD');
  let overscanEndDate = moment(visibleEndDate).add(10, unit).format('YYYY-MM-DD');
  let gridEndDate = moment(visibleEndDate).add(40, unit);
  return {overscanStartDate, gridStartDate, visibleEndDate, overscanEndDate, gridEndDate};
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