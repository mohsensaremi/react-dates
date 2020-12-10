import moment from 'moment';

import toMomentObject from './toMomentObject';
import {
  getDateFormat,
} from './calendarSystem';

export default function toISODateString(date, currentFormat, calendarSystem) {
  const dateObj = moment.isMoment(date) ? date : toMomentObject(date, currentFormat);
  if (!dateObj) return null;

  return dateObj.format(getDateFormat(calendarSystem));
  // Template strings compiled in strict mode uses concat, which is slow. Since
  // this code is in a hot path and we want it to be as fast as possible, we
  // want to use old-fashioned +.
  // eslint-disable-next-line prefer-template,max-len
  // return dateObj.year() + '-' + String(dateObj.month() + 1).padStart(2, '0') + '-' + String(dateObj.date()).padStart(2, '0');
}
