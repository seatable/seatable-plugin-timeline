import dayjs from 'dayjs';
import { DATE_FORMAT, DATE_UNIT, GRID_VIEWS } from '../constants';

export const getEventWidth = (selectedGridView, columnWidth, eventStartDate, eventEndDate) => {
  const formattedStartDate = dayjs(eventStartDate).format(DATE_FORMAT.YEAR_MONTH_DAY);
  const formattedEndDate = dayjs(eventEndDate).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let duration;
  if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
    duration = dayjs(formattedEndDate).diff(formattedStartDate, DATE_UNIT.DAY);
  }
  return ((duration || 0) + 1) * columnWidth;
};

export const getEventLeft = (selectedGridView, columnWidth, overScanStartDate, eventStartDate) => {
  let duration;
  if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
    const formattedOverScanStartDate = dayjs(overScanStartDate).format(DATE_FORMAT.YEAR_MONTH_DAY);
    const startDate = dayjs(eventStartDate).format(DATE_FORMAT.YEAR_MONTH_DAY);
    duration = dayjs(startDate).diff(formattedOverScanStartDate, DATE_UNIT.DAY);
  }
  return (duration || 0) * columnWidth;
};

export const getEventPosition = (startDate, endDate, gridStartDate, columnWidth, viewType) => {
  if (viewType === GRID_VIEWS.YEAR) {
    const left = getEventLeft4YearView(startDate, gridStartDate, columnWidth);
    const right = getEventRight4YearView(endDate, gridStartDate, columnWidth);
    const width = Math.max(right - left, 10);
    return { left, width };
  }
  return {
    left: getEventLeft(viewType, columnWidth, gridStartDate, startDate),
    width: getEventWidth(viewType, columnWidth, startDate, endDate),
  };
};

// not display content if event width is too narrow
export const getEventLabel = (width, label) => {
  return width < 30 || typeof label === 'object' ? null : label;
};

export const getEventDaysByDisplacement = (selectedGridView, eventStartDate, number) => {
  if (selectedGridView !== GRID_VIEWS.YEAR) return number;
  const formattedStartDate = dayjs(eventStartDate).format(DATE_FORMAT.YEAR_MONTH_DAY);
  const formattedEndDate = dayjs(formattedStartDate).add(Number(number), DATE_UNIT.MONTH).format(DATE_FORMAT.YEAR_MONTH_DAY);
  return dayjs(formattedEndDate).diff(formattedStartDate, DATE_UNIT.DAY);
};

function getDurationsFromGridStartDate(date, gridStartDate) {
  const monthStart = dayjs(date).startOf(DATE_UNIT.MONTH);
  const monthEnd = dayjs(date).endOf(DATE_UNIT.MONTH);
  const monthDays = monthEnd.diff(monthStart, DATE_UNIT.DAY);
  const months = monthStart.diff(gridStartDate, DATE_UNIT.MONTH);
  const restDays = dayjs(date).diff(monthStart, DATE_UNIT.DAY);
  return {
    monthStart,
    monthEnd,
    monthDays,
    months,
    restDays,
  };
}

/**
 * @param {String} date start date of event
 * @param {String} gridStartDate start date of year view
 * @param {number} columnWidth width of each month
 * returns the left of the date in the year view
 */
function getEventLeft4YearView(date, gridStartDate, columnWidth) {
  let { monthStart, monthDays, months, restDays } = getDurationsFromGridStartDate(date, gridStartDate);
  if (!monthStart.isSame(date, DATE_UNIT.DAY)) {
    // contains the date if not the end of the month
    restDays--;
  }
  return (months + (restDays / monthDays)) * columnWidth;
}

/**
 * @param {String} date end date of event
 * @param {String} gridStartDate start date of year view
 * @param {number} columnWidth width of each month
 * returns the left of the date in the year view
 */
function getEventRight4YearView(date, gridStartDate, columnWidth) {
  let { monthEnd, monthDays, months, restDays } = getDurationsFromGridStartDate(date, gridStartDate);
  if (!monthEnd.isSame(date, DATE_UNIT.DAY)) {
    restDays++;
  }
  return (months + (restDays / monthDays)) * columnWidth;
}
