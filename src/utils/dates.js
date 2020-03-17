import moment from 'moment';
import { DATE_UNIT } from '../constants';

export function getToday(format) {
  return moment().format(format);
}

export function getDateWithUnit(date, unit) {
  let formattedDate = moment(date);
  if (!formattedDate.isValid()) return '';
  switch(unit) {
    case DATE_UNIT.YEAR: {
      return formattedDate.year();
    }
    case DATE_UNIT.MONTH: {
      return formattedDate.format('MM'); 
    }
    case DATE_UNIT.DAY: {
      return formattedDate.format('D');
    }
    default: {
      return '';
    }
  }
}

export function getDaysInMonth(date) {
  let formattedDate = moment(date, 'YYYY-MM-DD', true);
  if (!formattedDate.isValid()) {
    return [];
  }
  let daysCount = formattedDate.daysInMonth();
  let startDate = formattedDate.startOf(DATE_UNIT.MONTH);
  let days = [startDate.format('YYYY-MM-DD')];
  for (let i = 1; i < daysCount; i++) {
    startDate = startDate.add(1, DATE_UNIT.DAY);
    days.push(startDate.format('YYYY-MM-DD'));
  }
  return days;
}

export function getDaysInRange(startDate, endDate) {
  let formattedStartDate = moment(startDate);
  let formattedEndDate = moment(endDate);
  if (!formattedStartDate.isValid() || !formattedEndDate.isValid()) return [];
  let daysCount = formattedEndDate.diff(formattedStartDate, 'days');
  let days = [];
  for (let i = 0; i < daysCount; i++) {
    days.push(formattedStartDate.format('YYYY-MM-DD'));
    formattedStartDate.add(1, 'day');
  }
  return days;
}

export function getDate2Week(date) {
  let weekNumber = moment(date).format('e');
  switch(weekNumber) {
    case '0': {
      return 'S';
    }
    case '1': {
      return 'M';
    }
    case '2': {
      return 'T';
    }
    case '3': {
      return 'W';
    }
    case '4': {
      return 'T';
    }
    case '5': {
      return 'F';
    }
    case '6': {
      return 'S'
    }
    default: {
      return '';
    }
  }
}