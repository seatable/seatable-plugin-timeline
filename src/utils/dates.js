import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { DATE_UNIT, DATE_FORMAT } from '../constants';

dayjs.extend(quarterOfYear);

export function getToday(format) {
  return dayjs().format(format);
}

export function getDateWithUnit(date, unit) {
  let formattedDate = dayjs(date);
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
  let formattedDate = dayjs(date, DATE_FORMAT.YEAR_MONTH_DAY, true);
  if (!formattedDate.isValid()) {
    return [];
  }
  let daysCount = formattedDate.daysInMonth();
  let startDate = formattedDate.startOf(DATE_UNIT.MONTH);
  let dates = [startDate.format(DATE_FORMAT.YEAR_MONTH_DAY)];
  for (let i = 1; i < daysCount; i++) {
    startDate = startDate.add(1, DATE_UNIT.DAY);
    dates.push(startDate.format(DATE_FORMAT.YEAR_MONTH_DAY));
  }
  return dates;
}

export function getDatesInRange(startDate, endDate, unit = 'day') {
  let formattedStartDate = dayjs(startDate);
  let formattedEndDate = dayjs(endDate);
  if (!formattedStartDate.isValid() || !formattedEndDate.isValid()) return [];
  let dates = [];
  while(formattedStartDate.isSame(formattedEndDate) || formattedStartDate.isBefore(formattedEndDate)) {
    dates.push(formattedStartDate.format(DATE_FORMAT.YEAR_MONTH_DAY));
    formattedStartDate = formattedStartDate.add(1, unit);
  }
  return dates;
}

export function getDate2Month(date) {
  return dayjs(date).format('MMM');
}

export function isDateInRange(targetDate, startDate, endDate) {
  return (dayjs(targetDate).isAfter(startDate) && dayjs(targetDate).isBefore(endDate)) ||
    targetDate === startDate || targetDate === endDate;
}

export function getUniqueDates(dates, unit, format) {
  let existFormattedDate, uniqueDates = [];
  Array.isArray(dates) && dates.forEach((d) => {
    let formattedDate = dayjs(d);
    if (unit === DATE_UNIT.YEAR) {
      formattedDate = formattedDate.format(format);
    } else {
      formattedDate = formattedDate.startOf(unit).format(format);
    }
    if (existFormattedDate !== formattedDate) {
      uniqueDates.push(d);
      existFormattedDate = formattedDate;
    }
  });
  return uniqueDates;
}
