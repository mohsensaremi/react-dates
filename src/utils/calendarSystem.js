import { CALENDAR_SYSTEM_JALALI } from '../constants';

export function getMonthUnit(calendarSystem) {
  return calendarSystem === CALENDAR_SYSTEM_JALALI ? 'jMonth' : 'month';
}

export function getDateFormat(calendarSystem) {
  return calendarSystem === CALENDAR_SYSTEM_JALALI ? 'jYYYY-jMM-jDD' : 'YYYY-MM-DD';
}

export function getMonthFormat(calendarSystem) {
  return calendarSystem === CALENDAR_SYSTEM_JALALI ? 'jYYYY-jMM' : 'YYYY-MM';
}
