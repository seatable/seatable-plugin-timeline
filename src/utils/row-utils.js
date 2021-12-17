import moment from 'moment';
import { DATE_FORMAT, DATE_UNIT, GRID_VIEWS } from '../constants';

export const getEventWidth = (selectedGridView, columnWidth, eventStartDate, eventEndDate) => {
  let duration;
  if (selectedGridView === GRID_VIEWS.YEAR) {
    duration = moment(eventEndDate).diff(eventStartDate, DATE_UNIT.MONTH);
  } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
    duration = moment(eventEndDate).diff(eventStartDate, DATE_UNIT.DAY);
  }
  return (duration || 0) * columnWidth;
};

export const getEventLeft = (selectedGridView, columnWidth, overScanStartDate, startDate) => {
  let duration;
  if (selectedGridView === GRID_VIEWS.YEAR) {
    let formattedOverScanStartDate = moment(overScanStartDate).format(DATE_FORMAT.YEAR_MONTH);
    let formattedStartDate = moment(startDate).format(DATE_FORMAT.YEAR_MONTH);
    duration = moment(formattedStartDate).diff(formattedOverScanStartDate, DATE_UNIT.MONTH);
  } else if (selectedGridView === GRID_VIEWS.MONTH || selectedGridView === GRID_VIEWS.DAY) {
    duration = moment(startDate).diff(overScanStartDate, DATE_UNIT.DAY);
  }
  return (duration || 0) * columnWidth;
};