import moment from 'moment';
import momentJalaali from 'moment-jalaali';
import { CALENDAR_SYSTEM_JALALI } from '../constants';
import { getMonthUnit } from './calendarSystem';

function getBlankDaysBeforeFirstDay(firstDayOfMonth, firstDayOfWeek) {
  const weekDayDiff = firstDayOfMonth.day() - firstDayOfWeek;
  return (weekDayDiff + 7) % 7;
}

export default function getNumberOfCalendarMonthWeeks(
  month,
  firstDayOfWeek = moment.localeData()
    .firstDayOfWeek(),
  calendarSystem,
) {
  const monthUnit = getMonthUnit(calendarSystem);
  const firstDayOfMonth = month.clone()
    .startOf(monthUnit);
  const numBlankDays = getBlankDaysBeforeFirstDay(firstDayOfMonth, firstDayOfWeek);
  const daysInMonth = calendarSystem === CALENDAR_SYSTEM_JALALI
    ? momentJalaali.jDaysInMonth(month.jYear(), month.jMonth())
    : month.daysInMonth();
  return Math.ceil((numBlankDays + daysInMonth) / 7);
}
