import dayjs from 'dayjs';
import { DATE_FORMAT, DATE_UNIT, GRID_VIEWS } from '../constants';

export const getEventWidth = (selectedGridView, columnWidth, eventStartDate, eventEndDate) => {
  const formattedStartDate = dayjs(eventStartDate).format(DATE_FORMAT.YEAR_MONTH_DAY);
  const formattedEndDate = dayjs(eventEndDate).format(DATE_FORMAT.YEAR_MONTH_DAY);
  let duration;
  if (selectedGridView === GRID_VIEWS.YEAR) {
    // `true` as the third argument: return a floating point number, instead of an integer
    duration = dayjs(formattedEndDate).diff(formattedStartDate, DATE_UNIT.MONTH, true);
    // for duration less than 1 month
    if (duration < 1) {
      return Math.max(duration * columnWidth, 10); // 10: set the minimum width '10px' for durations which are very short
    }
  } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
    duration = dayjs(formattedEndDate).diff(formattedStartDate, DATE_UNIT.DAY);
  }
  return ((duration || 0) + 1) * columnWidth;
};

export const getEventLeft = (selectedGridView, columnWidth, overScanStartDate, eventStartDate) => {
  let duration;
  if (selectedGridView === GRID_VIEWS.YEAR) {
    let formattedOverScanStartDate = dayjs(overScanStartDate).format(DATE_FORMAT.YEAR_MONTH);
    let formattedStartDate = dayjs(eventStartDate).format(DATE_FORMAT.YEAR_MONTH);
    duration = dayjs(formattedStartDate).diff(formattedOverScanStartDate, DATE_UNIT.MONTH);
  } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
    const formattedOverScanStartDate = dayjs(overScanStartDate).format(DATE_FORMAT.YEAR_MONTH_DAY);
    const startDate = dayjs(eventStartDate).format(DATE_FORMAT.YEAR_MONTH_DAY);
    duration = dayjs(startDate).diff(formattedOverScanStartDate, DATE_UNIT.DAY);
  }
  return (duration || 0) * columnWidth;
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
