/* eslint react/no-array-index-key: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import { forbidExtraProps, mutuallyExclusiveProps, nonNegativeInteger } from 'airbnb-prop-types';
import moment from 'moment';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

import { CalendarDayPhrases } from '../defaultPhrases';
import getPhrasePropTypes from '../utils/getPhrasePropTypes';

import CalendarWeek from './CalendarWeek';
import CalendarDay from './CalendarDay';

import calculateDimension from '../utils/calculateDimension';
import getCalendarMonthWeeks from '../utils/getCalendarMonthWeeks';
import isSameDay from '../utils/isSameDay';
import toISODateString from '../utils/toISODateString';

import ModifiersShape from '../shapes/ModifiersShape';
import ScrollableOrientationShape from '../shapes/ScrollableOrientationShape';
import DayOfWeekShape from '../shapes/DayOfWeekShape';

import {
  HORIZONTAL_ORIENTATION,
  VERTICAL_SCROLLABLE,
  DAY_SIZE, CALENDAR_SYSTEM_GREGORIAN, CALENDAR_SYSTEM_JALALI,
} from '../constants';
import { getMonthUnit } from '../utils/calendarSystem';

const propTypes = forbidExtraProps({
  classes: PropTypes.object.isRequired,
  CalendarDayClasses: PropTypes.object,
  month: momentPropTypes.momentObj,
  horizontalMonthPadding: nonNegativeInteger,
  isVisible: PropTypes.bool,
  enableOutsideDays: PropTypes.bool,
  modifiers: PropTypes.objectOf(ModifiersShape),
  orientation: ScrollableOrientationShape,
  daySize: nonNegativeInteger,
  onDayClick: PropTypes.func,
  onDayMouseEnter: PropTypes.func,
  onDayMouseLeave: PropTypes.func,
  onMonthSelect: PropTypes.func,
  onYearSelect: PropTypes.func,
  renderMonthText: mutuallyExclusiveProps(PropTypes.func, 'renderMonthText', 'renderMonthElement'),
  renderCalendarDay: PropTypes.func,
  renderDayContents: PropTypes.func,
  renderMonthElement: mutuallyExclusiveProps(PropTypes.func, 'renderMonthText', 'renderMonthElement'),
  firstDayOfWeek: DayOfWeekShape,
  setMonthTitleHeight: PropTypes.func,
  verticalBorderSpacing: nonNegativeInteger,

  focusedDate: momentPropTypes.momentObj, // indicates focusable day
  isFocused: PropTypes.bool, // indicates whether or not to move focus to focusable day

  // i18n
  monthFormat: PropTypes.string,
  phrases: PropTypes.shape(getPhrasePropTypes(CalendarDayPhrases)),
  dayAriaLabelFormat: PropTypes.string,

  calendarSystem: PropTypes.oneOf([CALENDAR_SYSTEM_GREGORIAN, CALENDAR_SYSTEM_JALALI]),
});

const defaultProps = {
  CalendarDayClasses: undefined,
  month: moment(),
  horizontalMonthPadding: 13,
  isVisible: true,
  enableOutsideDays: false,
  modifiers: {},
  orientation: HORIZONTAL_ORIENTATION,
  daySize: DAY_SIZE,
  onDayClick() {
  },
  onDayMouseEnter() {
  },
  onDayMouseLeave() {
  },
  onMonthSelect() {
  },
  onYearSelect() {
  },
  renderMonthText: null,
  renderCalendarDay: (props) => (<CalendarDay {...props} />),
  renderDayContents: null,
  renderMonthElement: null,
  firstDayOfWeek: null,
  setMonthTitleHeight: null,

  focusedDate: null,
  isFocused: false,

  // i18n
  monthFormat: 'MMMM YYYY', // english locale
  phrases: CalendarDayPhrases,
  dayAriaLabelFormat: undefined,
  verticalBorderSpacing: undefined,

  calendarSystem: CALENDAR_SYSTEM_GREGORIAN,
};

class CalendarMonth extends React.PureComponent {
  constructor(props) {
    super(props);

    const { calendarSystem } = this.props;

    this.state = {
      weeks: getCalendarMonthWeeks(
        props.month,
        props.enableOutsideDays,
        props.firstDayOfWeek == null ? moment.localeData()
          .firstDayOfWeek() : props.firstDayOfWeek,
        calendarSystem,
      ),
    };

    this.setCaptionRef = this.setCaptionRef.bind(this);
    this.setMonthTitleHeight = this.setMonthTitleHeight.bind(this);
  }

  componentDidMount() {
    this.setMonthTitleHeightTimeout = setTimeout(this.setMonthTitleHeight, 0);
  }

  componentWillReceiveProps(nextProps) {
    const { month, enableOutsideDays, firstDayOfWeek } = nextProps;
    const {
      month: prevMonth,
      enableOutsideDays: prevEnableOutsideDays,
      firstDayOfWeek: prevFirstDayOfWeek,
      calendarSystem,
    } = this.props;
    if (
      !month.isSame(prevMonth)
      || enableOutsideDays !== prevEnableOutsideDays
      || firstDayOfWeek !== prevFirstDayOfWeek
    ) {
      this.setState({
        weeks: getCalendarMonthWeeks(
          month,
          enableOutsideDays,
          firstDayOfWeek == null ? moment.localeData()
            .firstDayOfWeek() : firstDayOfWeek,
          calendarSystem,
        ),
      });
    }
  }

  componentWillUnmount() {
    if (this.setMonthTitleHeightTimeout) {
      clearTimeout(this.setMonthTitleHeightTimeout);
    }
  }

  setMonthTitleHeight() {
    const { setMonthTitleHeight } = this.props;
    if (setMonthTitleHeight) {
      const captionHeight = calculateDimension(this.captionRef, 'height', true, true);
      setMonthTitleHeight(captionHeight);
    }
  }

  setCaptionRef(ref) {
    this.captionRef = ref;
  }

  render() {
    const {
      CalendarDayClasses,
      dayAriaLabelFormat,
      daySize,
      focusedDate,
      horizontalMonthPadding,
      isFocused,
      isVisible,
      modifiers,
      month,
      monthFormat,
      onDayClick,
      onDayMouseEnter,
      onDayMouseLeave,
      onMonthSelect,
      onYearSelect,
      orientation,
      phrases,
      renderCalendarDay,
      renderDayContents,
      renderMonthElement,
      renderMonthText,
      classes: styles,
      verticalBorderSpacing,
      calendarSystem,
    } = this.props;

    const { weeks } = this.state;
    const monthTitle = renderMonthText ? renderMonthText(month) : month.format(monthFormat);

    const verticalScrollable = orientation === VERTICAL_SCROLLABLE;

    return (
      <div
        className={styles.CalendarMonth}
        style={{ padding: `0 ${horizontalMonthPadding}px` }}
        data-visible={isVisible}
      >
        <div
          ref={this.setCaptionRef}
          className={clsx(styles.CalendarMonth_caption, {
            [styles.CalendarMonth_caption__verticalScrollable]: verticalScrollable,
          })}
        >
          {renderMonthElement ? (
            renderMonthElement({
              month,
              onMonthSelect,
              onYearSelect,
              isVisible,
            })
          ) : (
            <strong>
              {monthTitle}
            </strong>
          )}
        </div>

        <table
          className={clsx({
            [styles.CalendarMonth_table]: !verticalBorderSpacing,
            [styles.CalendarMonth_verticalSpacing]: verticalBorderSpacing,
          })}
          style={{
            ...(verticalBorderSpacing && { borderSpacing: `0px ${verticalBorderSpacing}px` }),
          }}
          role="presentation"
        >
          <tbody>
            {weeks.map((week, i) => (
              <CalendarWeek key={i}>
                {week.map((day, dayOfWeek) => renderCalendarDay({
                  key: dayOfWeek,
                  day,
                  daySize,
                  // eslint-disable-next-line max-len
                  isOutsideDay: !day || day[getMonthUnit(calendarSystem)]() !== month[getMonthUnit(calendarSystem)](),
                  tabIndex: isVisible && isSameDay(day, focusedDate) ? 0 : -1,
                  isFocused,
                  onDayMouseEnter,
                  onDayMouseLeave,
                  onDayClick,
                  renderDayContents,
                  phrases,
                  modifiers: modifiers[toISODateString(day, undefined, calendarSystem)],
                  ariaLabelFormat: dayAriaLabelFormat,
                  classes: CalendarDayClasses,
                }))}
              </CalendarWeek>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

CalendarMonth.propTypes = propTypes;
CalendarMonth.defaultProps = defaultProps;

export default withStyles(({ reactDates: { color, font, spacing } }) => ({
  CalendarMonth: {
    background: color.background,
    textAlign: 'center',
    verticalAlign: 'top',
    userSelect: 'none',
  },

  CalendarMonth_table: {
    borderCollapse: 'collapse',
    borderSpacing: 0,
  },

  CalendarMonth_verticalSpacing: {
    borderCollapse: 'separate',
  },

  CalendarMonth_caption: {
    color: color.text,
    fontSize: font.captionSize,
    textAlign: 'center',
    paddingTop: spacing.captionPaddingTop,
    paddingBottom: spacing.captionPaddingBottom,
    captionSide: 'initial',
  },

  CalendarMonth_caption__verticalScrollable: {
    paddingTop: 12,
    paddingBottom: 7,
  },
}), { pureComponent: typeof React.PureComponent !== 'undefined' })(CalendarMonth);
