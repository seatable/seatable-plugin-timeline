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

export function getDatesInMonth(date) {
  let formattedDate = moment(date, 'YYYY-MM-DD', true);
  if (!formattedDate.isValid()) {
    return [];
  }
  let daysCount = formattedDate.daysInMonth();
  let startDate = formattedDate.startOf(DATE_UNIT.MONTH);
  let dates = [startDate.format('YYYY-MM-DD')];
  for (let i = 1; i < daysCount; i++) {
    startDate = startDate.add(1, DATE_UNIT.DAY);
    dates.push(startDate.format('YYYY-MM-DD'));
  }
  return dates;
}

export function getDatesInRange(startDate, endDate, unit = 'day') {
  let formattedStartDate = moment(startDate);
  let formattedEndDate = moment(endDate);
  if (!formattedStartDate.isValid() || !formattedEndDate.isValid()) return [];
  let dates = [];
  while(formattedStartDate.isSameOrBefore(formattedEndDate)) {
    dates.push(formattedStartDate.format('YYYY-MM-DD'));
    formattedStartDate.add(1, unit);
  }
  return dates;
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

export function getDate2Month(date) {
  return moment(date).format('MMM');
}

export function isDateInRange(targetDate, startDate, endDate) {
  return moment(targetDate).isBetween(startDate, endDate) || 
    targetDate === startDate || targetDate === endDate;
}