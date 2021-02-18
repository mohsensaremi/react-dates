import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import { mutuallyExclusiveProps, nonNegativeInteger } from 'airbnb-prop-types';

import { SingleDatePickerPhrases } from '../defaultPhrases';
import getPhrasePropTypes from '../utils/getPhrasePropTypes';

import IconPositionShape from './IconPositionShape';
import OrientationShape from './OrientationShape';
import anchorDirectionShape from './AnchorDirectionShape';
import openDirectionShape from './OpenDirectionShape';
import DayOfWeekShape from './DayOfWeekShape';
import CalendarInfoPositionShape from './CalendarInfoPositionShape';
import NavPositionShape from './NavPositionShape';
import { CALENDAR_SYSTEM_GREGORIAN, CALENDAR_SYSTEM_JALALI } from '../constants';

export default {
  classes: PropTypes.object.isRequired,
  SingleDatePickerInputClasses: PropTypes.object,
  DateInputClasses: PropTypes.object,
  DayPickerClasses: PropTypes.object,
  CalendarMonthGridClasses: PropTypes.object,
  CalendarDayClasses: PropTypes.object,
  CalendarMonthClasses: PropTypes.object,
  DayPickerNavigationClasses: PropTypes.object,
  theme: PropTypes.object.isRequired,
  // required props for a functional interactive SingleDatePicker
  date: momentPropTypes.momentObj,
  onDateChange: PropTypes.func.isRequired,

  focused: PropTypes.bool,
  onFocusChange: PropTypes.func.isRequired,

  // input related props
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  ariaLabel: PropTypes.string,
  titleText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  screenReaderInputMessage: PropTypes.string,
  showClearDate: PropTypes.bool,
  customCloseIcon: PropTypes.node,
  showDefaultInputIcon: PropTypes.bool,
  inputIconPosition: IconPositionShape,
  customInputIcon: PropTypes.node,
  noBorder: PropTypes.bool,
  block: PropTypes.bool,
  small: PropTypes.bool,
  regular: PropTypes.bool,
  verticalSpacing: nonNegativeInteger,
  keepFocusOnInput: PropTypes.bool,

  // calendar presentation and interaction related props
  renderMonthText: mutuallyExclusiveProps(PropTypes.func, 'renderMonthText', 'renderMonthElement'),
  renderMonthElement: mutuallyExclusiveProps(PropTypes.func, 'renderMonthText', 'renderMonthElement'),
  renderWeekHeaderElement: PropTypes.func,
  orientation: OrientationShape,
  anchorDirection: anchorDirectionShape,
  openDirection: openDirectionShape,
  horizontalMargin: PropTypes.number,
  withPortal: PropTypes.bool,
  withFullScreenPortal: PropTypes.bool,
  appendToBody: PropTypes.bool,
  disableScroll: PropTypes.bool,
  initialVisibleMonth: PropTypes.func,
  defaultInitialVisibleMonth: momentPropTypes.momentObj,
  firstDayOfWeek: DayOfWeekShape,
  numberOfMonths: PropTypes.number,
  keepOpenOnDateSelect: PropTypes.bool,
  reopenPickerOnClearDate: PropTypes.bool,
  renderCalendarInfo: PropTypes.func,
  calendarInfoPosition: CalendarInfoPositionShape,
  hideKeyboardShortcutsPanel: PropTypes.bool,
  daySize: nonNegativeInteger,
  isRTL: PropTypes.bool,
  verticalHeight: nonNegativeInteger,
  transitionDuration: nonNegativeInteger,
  horizontalMonthPadding: nonNegativeInteger,

  // navigation related props
  dayPickerNavigationInlineStyles: PropTypes.object,
  navPosition: NavPositionShape,
  navPrev: PropTypes.node,
  navNext: PropTypes.node,
  renderNavPrevButton: PropTypes.func,
  renderNavNextButton: PropTypes.func,

  onPrevMonthClick: PropTypes.func,
  onNextMonthClick: PropTypes.func,
  onClose: PropTypes.func,

  // day presentation and interaction related props
  renderCalendarDay: PropTypes.func,
  renderDayContents: PropTypes.func,
  enableOutsideDays: PropTypes.bool,
  isDayBlocked: PropTypes.func,
  isOutsideRange: PropTypes.func,
  isDayHighlighted: PropTypes.func,
  minDate: momentPropTypes.momentObj,
  maxDate: momentPropTypes.momentObj,

  // internationalization props
  displayFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  monthFormat: PropTypes.string,
  weekDayFormat: PropTypes.string,
  phrases: PropTypes.shape(getPhrasePropTypes(SingleDatePickerPhrases)),
  dayAriaLabelFormat: PropTypes.string,

  calendarSystem: PropTypes.oneOf([CALENDAR_SYSTEM_GREGORIAN, CALENDAR_SYSTEM_JALALI]),

  usePopper: PropTypes.bool,
  usePopover: PropTypes.bool,
  PopperProps: PropTypes.object,
  PopoverProps: PropTypes.object,

  selectableMonth: PropTypes.bool,
  selectableYear: PropTypes.bool,
  selectableMonthFormat: PropTypes.string,
  selectableYearFormat: PropTypes.string,

  appendToInput: PropTypes.bool,
};
