import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import * as dates from './dates';
import { DATE_UNIT, DATE_FORMAT, GRID_VIEWS } from '../constants';
import { GENERAL_COLUMN_WIDTH, MONTH_COLUMN_WIDTH, QUARTER_COLUMN_WIDTH } from '../constants/column';

dayjs.extend(quarterOfYear);

export const getGridInitState = (selectedGridView, selectedDate, gridStartDate, gridEndDate, viewportRightWidth) => {
  let m_gridStartDate = dayjs(gridStartDate);
  let m_gridEndDate = dayjs(gridEndDate);
  let columnWidth = getColumnWidth(selectedGridView);
  let overScanDates = getScanDates(selectedGridView);
  let visibleDatesCount = Math.ceil(viewportRightWidth / columnWidth);
  let visibleStartDate, unit;
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      unit = DATE_UNIT.MONTH;
      m_gridStartDate = m_gridStartDate.subtract(1, DATE_UNIT.MONTH);
      visibleStartDate = dayjs(selectedDate).startOf(DATE_UNIT.YEAR).subtract(1, DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
    case GRID_VIEWS.QUARTER: {
      unit = DATE_UNIT.DAY;
      m_gridStartDate = m_gridStartDate.subtract(4, DATE_UNIT.DAY);
      visibleStartDate = dayjs(selectedDate).startOf(DATE_UNIT.QUARTER).subtract(4, DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
    case GRID_VIEWS.MONTH: {
      unit = DATE_UNIT.DAY;
      m_gridStartDate = m_gridStartDate.subtract(4, DATE_UNIT.DAY);
      visibleStartDate = dayjs(selectedDate).startOf(DATE_UNIT.MONTH).subtract(4, DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
    default: {
      // default view: Day.
      unit = DATE_UNIT.DAY;
      m_gridStartDate = m_gridStartDate.subtract(1, DATE_UNIT.DAY);
      visibleStartDate = dayjs(selectedDate).subtract(Math.ceil(visibleDatesCount / 3 + 1), DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
      break;
    }
  }
  const allDates = dates.getDatesInRange(m_gridStartDate, m_gridEndDate, unit);
  const { visibleEndDate, overScanStartDate, overScanEndDate } = getGridDatesBoundaries(visibleStartDate, visibleDatesCount, overScanDates, unit);
  return {visibleStartDate, visibleEndDate, overScanStartDate, overScanEndDate, allDates};
};

export const getGridDatesBoundaries = (visibleStartDate, visibleDatesCount, overScanDates, unit) => {
  let overScanStartDate = dayjs(visibleStartDate).add(-overScanDates, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let visibleEndDate = dayjs(visibleStartDate).add(visibleDatesCount, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let overScanEndDate = dayjs(visibleEndDate).add(overScanDates, unit).format(DATE_FORMAT.YEAR_MONTH_DAY);
  return {visibleEndDate, overScanStartDate, overScanEndDate};
};

export const getCompareDate = (selectedGridView, visibleStartDate, visibleDatesCount) => {
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      return dayjs(visibleStartDate).add(5, DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY);
    }
    case GRID_VIEWS.QUARTER: {
      return dayjs(visibleStartDate).add(4, DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
    }
    case GRID_VIEWS.MONTH: {
      return dayjs(visibleStartDate).add(15, DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
    }
    default: {
      // default view: Day.
      return dayjs(visibleStartDate).add(Math.ceil(visibleDatesCount / 3), DATE_UNIT.DAY).format(DATE_FORMAT.YEAR_MONTH_DAY);
    }
  }
};

export const canUpdateSelectedDate = (dateA, dateB, selectedGridView) => {
  let formattedDateA = dayjs(dateA);
  let formattedDateB = dayjs(dateB);
  let yearOfDateA = formattedDateA.year();
  let yearOfDateB = formattedDateB.year();
  if (selectedGridView === GRID_VIEWS.YEAR) {
    return yearOfDateA !== yearOfDateB;
  } else if (selectedGridView === GRID_VIEWS.QUARTER) {
    const quarterOfDateA = formattedDateA.quarter();
    const quarterOfDateB = formattedDateB.quarter();
    return yearOfDateA !== yearOfDateB || quarterOfDateA !== quarterOfDateB;
  } else {
    let monthOfDateA = formattedDateA.month();
    let monthOfDateB = formattedDateB.month();
    return yearOfDateA !== yearOfDateB || monthOfDateA !== monthOfDateB;
  }
};

export const getScanDates = (selectedGridView) => {
  switch (selectedGridView) {
    case GRID_VIEWS.QUARTER:
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
    case GRID_VIEWS.QUARTER: {
      return QUARTER_COLUMN_WIDTH;
    }
    case GRID_VIEWS.MONTH: {
      return MONTH_COLUMN_WIDTH;
    }
    default: {
      return GENERAL_COLUMN_WIDTH;
    }
  }
};

export const getRenderedDates = (selectedGridView, overScanDates) => {
  switch (selectedGridView) {
    case GRID_VIEWS.YEAR: {
      return dates.getUniqueDates(overScanDates, DATE_UNIT.YEAR, DATE_FORMAT.YEAR);
    }
    case GRID_VIEWS.QUARTER: {
      return dates.getUniqueDates(overScanDates, DATE_UNIT.QUARTER, DATE_FORMAT.YEAR_MONTH_DAY);
    }
    case GRID_VIEWS.MONTH: {
      return dates.getUniqueDates(overScanDates, DATE_UNIT.MONTH, DATE_FORMAT.YEAR_MONTH_DAY);
    }
    case GRID_VIEWS.DAY: {
      return overScanDates;
    }
    // no default
  }
};
