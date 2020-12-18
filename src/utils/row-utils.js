import moment from 'moment';
import { DATE_FORMAT, DATE_UNIT, GRID_VIEWS } from '../constants';

export const getEventWidth = (selectedGridView, columnWidth, eventStartDate, eventEndDate) => {
  let duration = 0;
  if (selectedGridView === GRID_VIEWS.YEAR) {
    duration = moment(eventEndDate).diff(eventStartDate, DATE_UNIT.MONTH) + 1;
  } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
    duration = moment(eventEndDate).diff(eventStartDate, DATE_UNIT.DAY) + 1;
  }
  return duration * columnWidth;
};

export const getEventLeft = (selectedGridView, columnWidth, overScanStartDate, startDate) => {
  if (selectedGridView === GRID_VIEWS.YEAR) {
    let formattedOverScanStartDate = moment(overScanStartDate).format(DATE_FORMAT.YEAR_MONTH);
    let formattedStartDate = moment(startDate).format(DATE_FORMAT.YEAR_MONTH);
    return moment(formattedStartDate).diff(formattedOverScanStartDate, DATE_UNIT.MONTH) * columnWidth;
  } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
    return moment(startDate).diff(overScanStartDate, DATE_UNIT.DAY) * columnWidth;
  }
};