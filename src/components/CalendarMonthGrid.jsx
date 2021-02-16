import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import { forbidExtraProps, mutuallyExclusiveProps, nonNegativeInteger } from 'airbnb-prop-types';
import moment from 'moment';
import { addEventListener } from 'consolidated-events';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

import { CalendarDayPhrases } from '../defaultPhrases';
import getPhrasePropTypes from '../utils/getPhrasePropTypes';
import noflip from '../utils/noflip';

import CalendarMonth from './CalendarMonth';

import isTransitionEndSupported from '../utils/isTransitionEndSupported';
import getTransformStyles from '../utils/getTransformStyles';
import getCalendarMonthWidth from '../utils/getCalendarMonthWidth';
import toISOMonthString from '../utils/toISOMonthString';
import isPrevMonth from '../utils/isPrevMonth';
import isNextMonth from '../utils/isNextMonth';

import ModifiersShape from '../shapes/ModifiersShape';
import ScrollableOrientationShape from '../shapes/ScrollableOrientationShape';
import DayOfWeekShape from '../shapes/DayOfWeekShape';
import ChevronUp from './ChevronUp';
import ChevronDown from './ChevronDown';

import {
  CALENDAR_SYSTEM_GREGORIAN,
  CALENDAR_SYSTEM_JALALI,
  DAY_SIZE,
  HORIZONTAL_ORIENTATION,
  VERTICAL_ORIENTATION,
  VERTICAL_SCROLLABLE,
} from '../constants';
import { getMonthUnit, getYearUnit } from '../utils/calendarSystem';

const propTypes = forbidExtraProps({
  classes: PropTypes.object.isRequired,
  CalendarMonthClasses: PropTypes.object,
  CalendarDayClasses: PropTypes.object,
  enableOutsideDays: PropTypes.bool,
  firstVisibleMonthIndex: PropTypes.number,
  horizontalMonthPadding: nonNegativeInteger,
  initialMonth: momentPropTypes.momentObj,
  isAnimating: PropTypes.bool,
  numberOfMonths: PropTypes.number,
  modifiers: PropTypes.objectOf(PropTypes.objectOf(ModifiersShape)),
  orientation: ScrollableOrientationShape,
  onDayClick: PropTypes.func,
  onDayMouseEnter: PropTypes.func,
  onDayMouseLeave: PropTypes.func,
  onMonthTransitionEnd: PropTypes.func,
  onMonthChange: PropTypes.func,
  onYearChange: PropTypes.func,
  renderMonthText: mutuallyExclusiveProps(PropTypes.func, 'renderMonthText', 'renderMonthElement'),
  renderCalendarDay: PropTypes.func,
  renderDayContents: PropTypes.func,
  translationValue: PropTypes.number,
  renderMonthElement: mutuallyExclusiveProps(PropTypes.func, 'renderMonthText', 'renderMonthElement'),
  daySize: nonNegativeInteger,
  focusedDate: momentPropTypes.momentObj, // indicates focusable day
  isFocused: PropTypes.bool, // indicates whether or not to move focus to focusable day
  firstDayOfWeek: DayOfWeekShape,
  setMonthTitleHeight: PropTypes.func,
  isRTL: PropTypes.bool,
  transitionDuration: nonNegativeInteger,
  verticalBorderSpacing: nonNegativeInteger,

  // i18n
  monthFormat: PropTypes.string,
  phrases: PropTypes.shape(getPhrasePropTypes(CalendarDayPhrases)),
  dayAriaLabelFormat: PropTypes.string,

  calendarSystem: PropTypes.oneOf([CALENDAR_SYSTEM_GREGORIAN, CALENDAR_SYSTEM_JALALI]),

  selectableMonth: PropTypes.bool,
  selectableYear: PropTypes.bool,
  selectableMonthFormat: PropTypes.string,
  selectableYearFormat: PropTypes.string,
});

const defaultProps = {
  CalendarMonthClasses: undefined,
  CalendarDayClasses: undefined,
  enableOutsideDays: false,
  firstVisibleMonthIndex: 0,
  horizontalMonthPadding: 13,
  initialMonth: moment(),
  isAnimating: false,
  numberOfMonths: 1,
  modifiers: {},
  orientation: HORIZONTAL_ORIENTATION,
  onDayClick() {
  },
  onDayMouseEnter() {
  },
  onDayMouseLeave() {
  },
  onMonthChange() {
  },
  onYearChange() {
  },
  onMonthTransitionEnd() {
  },
  renderMonthText: null,
  renderCalendarDay: undefined,
  renderDayContents: null,
  translationValue: null,
  renderMonthElement: null,
  daySize: DAY_SIZE,
  focusedDate: null,
  isFocused: false,
  firstDayOfWeek: null,
  setMonthTitleHeight: null,
  isRTL: false,
  transitionDuration: 200,
  verticalBorderSpacing: undefined,

  // i18n
  monthFormat: 'MMMM YYYY', // english locale
  phrases: CalendarDayPhrases,
  dayAriaLabelFormat: undefined,

  calendarSystem: CALENDAR_SYSTEM_GREGORIAN,
  selectableMonth: false,
  selectableYear: false,
  selectableMonthFormat: 'MMMM',
  selectableYearFormat: 'YYYY',
};

function getMonths(initialMonth, numberOfMonths, withoutTransitionMonths, calendarSystem) {
  const monthUnit = getMonthUnit(calendarSystem);
  let month = initialMonth.clone();
  if (!withoutTransitionMonths) month = month.subtract(1, monthUnit);

  const months = [];
  for (let i = 0; i < (withoutTransitionMonths ? numberOfMonths : numberOfMonths + 2); i += 1) {
    months.push(month);
    month = month.clone()
      .add(1, monthUnit);
  }

  return months;
}

class CalendarMonthGrid extends React.PureComponent {
  constructor(props) {
    super(props);
    const withoutTransitionMonths = props.orientation === VERTICAL_SCROLLABLE;
    this.state = {
      months: getMonths(
        props.initialMonth,
        props.numberOfMonths,
        withoutTransitionMonths,
        props.calendarSystem,
      ),
      yearSelectOpen: false,
      monthSelectOpen: false,
    };

    this.isTransitionEndSupported = isTransitionEndSupported();
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.setContainerRef = this.setContainerRef.bind(this);

    this.locale = moment.locale();
    this.onMonthSelect = this.onMonthSelect.bind(this);
    this.onSelectableMonthSelect = this.onSelectableMonthSelect.bind(this);
    this.onYearSelect = this.onYearSelect.bind(this);
    this.renderSelectableMonthElement = this.renderSelectableMonthElement.bind(this);
    this.onOpenMonthSelect = this.onOpenMonthSelect.bind(this);
    this.onCloseMonthSelect = this.onCloseMonthSelect.bind(this);
    this.onOpenYearSelect = this.onOpenYearSelect.bind(this);
    this.onCloseYearSelect = this.onCloseYearSelect.bind(this);
    this.getSelectableMonths = this.getSelectableMonths.bind(this);
    this.getSelectableYears = this.getSelectableYears.bind(this);
  }

  componentDidMount() {
    this.removeEventListener = addEventListener(
      this.container,
      'transitionend',
      this.onTransitionEnd,
    );
  }

  componentWillReceiveProps(nextProps) {
    const {
      initialMonth,
      numberOfMonths,
      orientation,
      calendarSystem,
    } = nextProps;
    const { months } = this.state;

    const {
      initialMonth: prevInitialMonth,
      numberOfMonths: prevNumberOfMonths,
    } = this.props;
    const hasMonthChanged = !prevInitialMonth.isSame(initialMonth, 'month');
    const hasNumberOfMonthsChanged = prevNumberOfMonths !== numberOfMonths;
    let newMonths = months;

    if (hasMonthChanged && !hasNumberOfMonthsChanged) {
      if (isNextMonth(prevInitialMonth, initialMonth)) {
        newMonths = months.slice(1);
        newMonths.push(months[months.length - 1].clone()
          .add(1, 'month'));
      } else if (isPrevMonth(prevInitialMonth, initialMonth)) {
        newMonths = months.slice(0, months.length - 1);
        newMonths.unshift(months[0].clone()
          .subtract(1, 'month'));
      } else {
        const withoutTransitionMonths = orientation === VERTICAL_SCROLLABLE;
        newMonths = getMonths(
          initialMonth,
          numberOfMonths,
          withoutTransitionMonths,
          calendarSystem,
        );
      }
    }

    if (hasNumberOfMonthsChanged) {
      const withoutTransitionMonths = orientation === VERTICAL_SCROLLABLE;
      newMonths = getMonths(
        initialMonth,
        numberOfMonths,
        withoutTransitionMonths,
        calendarSystem,
      );
    }

    const momentLocale = moment.locale();
    if (this.locale !== momentLocale) {
      this.locale = momentLocale;
      newMonths = newMonths.map((m) => m.locale(this.locale));
    }

    this.setState({
      months: newMonths,
    });
  }

  componentDidUpdate() {
    const {
      isAnimating,
      transitionDuration,
      onMonthTransitionEnd,
    } = this.props;

    // For IE9, immediately call onMonthTransitionEnd instead of
    // waiting for the animation to complete. Similarly, if transitionDuration
    // is set to 0, also immediately invoke the onMonthTransitionEnd callback
    if ((!this.isTransitionEndSupported || !transitionDuration) && isAnimating) {
      onMonthTransitionEnd();
    }
  }

  componentWillUnmount() {
    if (this.removeEventListener) this.removeEventListener();
  }

  onTransitionEnd() {
    const { onMonthTransitionEnd } = this.props;
    onMonthTransitionEnd();
  }

  onMonthSelect(currentMonth, newMonthVal) {
    const newMonth = currentMonth.clone();
    const { onMonthChange, orientation, calendarSystem } = this.props;
    const { months } = this.state;
    const monthUnit = getMonthUnit(calendarSystem);
    const withoutTransitionMonths = orientation === VERTICAL_SCROLLABLE;
    let initialMonthSubtraction = months.indexOf(currentMonth);
    if (!withoutTransitionMonths) {
      initialMonthSubtraction -= 1;
    }
    newMonth[monthUnit](newMonthVal)
      .subtract(initialMonthSubtraction, `${monthUnit}s`);
    onMonthChange(newMonth);
  }

  onSelectableMonthSelect(currentMonth, newMonthVal) {
    this.onCloseMonthSelect();
    setImmediate(() => {
      this.onMonthSelect(currentMonth, newMonthVal);
    });
  }

  onSelectableYearSelect(currentMonth, newYearVal) {
    this.onCloseYearSelect();
    setImmediate(() => {
      this.onYearSelect(currentMonth, newYearVal);
    });
  }

  onYearSelect(currentMonth, newYearVal) {
    const newMonth = currentMonth.clone();
    const { onYearChange, orientation, calendarSystem } = this.props;
    const { months } = this.state;
    const monthUnit = getMonthUnit(calendarSystem);
    const yearUnit = getYearUnit(calendarSystem);
    const withoutTransitionMonths = orientation === VERTICAL_SCROLLABLE;
    let initialMonthSubtraction = months.indexOf(currentMonth);
    if (!withoutTransitionMonths) {
      initialMonthSubtraction -= 1;
    }
    newMonth[yearUnit](newYearVal)
      .subtract(initialMonthSubtraction, `${monthUnit}s`);
    onYearChange(newMonth);
  }

  onOpenMonthSelect() {
    this.setState({
      monthSelectOpen: true,
    });
  }

  onCloseMonthSelect() {
    this.setState({
      monthSelectOpen: false,
    });
  }

  onOpenYearSelect() {
    this.setState({
      yearSelectOpen: true,
    });
  }

  onCloseYearSelect() {
    this.setState({
      yearSelectOpen: false,
    });
  }

  setContainerRef(ref) {
    this.container = ref;
  }

  getSelectableMonths(currentMonth) {
    const {
      calendarSystem,
      selectableMonthFormat,
    } = this.props;

    const yearUnit = getYearUnit(calendarSystem);
    const monthUnit = getMonthUnit(calendarSystem);

    const month = currentMonth.clone()
      .startOf(yearUnit);
    const selectableMonths = [];
    for (let i = 0; i < 12; i += 1) {
      selectableMonths.push({
        title: month.format(selectableMonthFormat),
        value: i,
      });
      month.add(1, monthUnit);
    }

    return selectableMonths;
  }

  getSelectableYears(currentMonth) {
    const {
      calendarSystem,
      selectableYearFormat,
    } = this.props;

    const yearUnit = getYearUnit(calendarSystem);

    const year = currentMonth.clone()
      .startOf(yearUnit)
      .add(30, yearUnit);
    const selectableMonths = [];
    for (let i = 200; i >= 0; i -= 1) {
      selectableMonths.push({
        title: year.format(selectableYearFormat),
        value: year[yearUnit](),
      });
      year.add(-1, yearUnit);
    }

    return selectableMonths;
  }

  renderSelectableMonthElement({
    month,
  }) {
    const {
      selectableMonth,
      selectableYear,
      selectableMonthFormat,
      selectableYearFormat,
      classes: styles,
    } = this.props;

    const {
      monthSelectOpen,
      yearSelectOpen,
    } = this.state;

    const monthText = month.format(selectableMonthFormat);
    const yearText = month.format(selectableYearFormat);

    const IconMonth = monthSelectOpen ? ChevronUp : ChevronDown;
    const IconYear = yearSelectOpen ? ChevronUp : ChevronDown;

    return (
      <div className={styles.CalendarMonthGrid_selectableYearMonth_buttons}>
        <strong // eslint-disable-line jsx-a11y/no-static-element-interactions
          className={styles.CalendarMonthGrid_selectableYearMonth_button}
          onClick={yearSelectOpen ? this.onCloseYearSelect : this.onOpenYearSelect}
        >
          {yearText}
          {
            selectableYear && (
              <IconYear
                className={clsx({
                  [styles.CalendarMonthGrid_openSelectableYearMonth_svg]: false,
                  [styles.CalendarMonthGrid_closeSelectableYearMonth_svg]: true,
                })}
              />
            )
          }
        </strong>
        <strong // eslint-disable-line jsx-a11y/no-static-element-interactions
          className={styles.CalendarMonthGrid_selectableYearMonth_button}
          onClick={monthSelectOpen ? this.onCloseMonthSelect : this.onOpenMonthSelect}
        >
          {monthText}
          {
            selectableMonth && (
              <IconMonth
                className={clsx({
                  [styles.CalendarMonthGrid_openSelectableYearMonth_svg]: false,
                  [styles.CalendarMonthGrid_closeSelectableYearMonth_svg]: true,
                })}
              />
            )
          }
        </strong>
      </div>
    );
  }

  render() {
    const {
      CalendarMonthClasses,
      CalendarDayClasses,
      enableOutsideDays,
      firstVisibleMonthIndex,
      horizontalMonthPadding,
      isAnimating,
      modifiers,
      numberOfMonths,
      monthFormat,
      orientation,
      translationValue,
      daySize,
      onDayMouseEnter,
      onDayMouseLeave,
      onDayClick,
      renderMonthText,
      renderCalendarDay,
      renderDayContents,
      renderMonthElement,
      onMonthTransitionEnd,
      firstDayOfWeek,
      focusedDate,
      isFocused,
      isRTL,
      classes: styles,
      phrases,
      dayAriaLabelFormat,
      transitionDuration,
      verticalBorderSpacing,
      setMonthTitleHeight,
      calendarSystem,
      selectableMonth,
      selectableYear,
    } = this.props;

    const {
      months,
      monthSelectOpen,
      yearSelectOpen,
    } = this.state;

    const isVertical = orientation === VERTICAL_ORIENTATION;
    const isVerticalScrollable = orientation === VERTICAL_SCROLLABLE;
    const isHorizontal = orientation === HORIZONTAL_ORIENTATION;

    const calendarMonthWidth = getCalendarMonthWidth(
      daySize,
      horizontalMonthPadding,
    );

    const width = isVertical || isVerticalScrollable
      ? calendarMonthWidth
      : (numberOfMonths + 2) * calendarMonthWidth;

    const transformType = (isVertical || isVerticalScrollable) ? 'translateY' : 'translateX';
    const transformValue = `${transformType}(${translationValue}px)`;

    return (
      <>
        {
          monthSelectOpen && (
            <div
              className={styles.CalendarMonthGrid_selectableYearMonth_wrapper}
            >
              {this.getSelectableMonths(months[1])
                .map((month) => (
                  <div // eslint-disable-line jsx-a11y/no-static-element-interactions
                    key={month.value}
                    onClick={() => this.onSelectableMonthSelect(months[1], month.value)}
                  >
                    {month.title}
                  </div>
                ))}
            </div>
          )
        }
        {
          yearSelectOpen && (
            <div
              className={styles.CalendarMonthGrid_selectableYearMonth_wrapper}
            >
              {this.getSelectableYears(months[1])
                .map((year) => (
                  <div // eslint-disable-line jsx-a11y/no-static-element-interactions
                    key={year.value}
                    onClick={() => this.onSelectableYearSelect(months[1], year.value)}
                  >
                    {year.title}
                  </div>
                ))}
            </div>
          )
        }
        {
          !monthSelectOpen && !yearSelectOpen && (
            <div
              className={clsx(styles.CalendarMonthGrid, {
                [styles.CalendarMonthGrid__horizontal]: isHorizontal,
                [styles.CalendarMonthGrid__vertical]: isVertical,
                [styles.CalendarMonthGrid__vertical_scrollable]: isVerticalScrollable,
                [styles.CalendarMonthGrid__animating]: isAnimating,
              })}
              style={{
                ...(isAnimating && transitionDuration && {
                  transition: `transform ${transitionDuration}ms ease-in-out 0.1s`,
                }),
                ...({
                  ...getTransformStyles(transformValue),
                  width,
                }),
              }}
              ref={this.setContainerRef}
              onTransitionEnd={onMonthTransitionEnd}
            >
              {months.map((month, i) => {
                const isVisible = (i >= firstVisibleMonthIndex)
                  && (i < firstVisibleMonthIndex + numberOfMonths);
                const hideForAnimation = i === 0 && !isVisible;
                const showForAnimation = i === 0 && isAnimating && isVisible;
                const monthString = toISOMonthString(month, undefined, calendarSystem);
                return (
                  <div
                    key={monthString}
                    className={clsx({
                      [styles.CalendarMonthGrid_month__horizontal]: isHorizontal,
                      [styles.CalendarMonthGrid_month__hideForAnimation]: hideForAnimation,
                      [styles.CalendarMonthGrid_month__hidden]: !isVisible && !isAnimating,
                    })}
                    style={{
                      ...(showForAnimation && !isVertical && !isRTL && {
                        position: 'absolute',
                        left: -calendarMonthWidth,
                      }),
                      ...(showForAnimation && !isVertical && isRTL && {
                        position: 'absolute',
                        right: 0,
                      }),
                      ...(showForAnimation && isVertical && {
                        position: 'absolute',
                        top: -translationValue,
                      }),
                    }}
                  >
                    <CalendarMonth
                      classes={CalendarMonthClasses}
                      CalendarDayClasses={CalendarDayClasses}
                      month={month}
                      isVisible={isVisible}
                      enableOutsideDays={enableOutsideDays}
                      modifiers={modifiers[monthString]}
                      monthFormat={monthFormat}
                      orientation={orientation}
                      onDayMouseEnter={onDayMouseEnter}
                      onDayMouseLeave={onDayMouseLeave}
                      onDayClick={onDayClick}
                      onMonthSelect={this.onMonthSelect}
                      onYearSelect={this.onYearSelect}
                      renderMonthText={renderMonthText}
                      renderCalendarDay={renderCalendarDay}
                      renderDayContents={renderDayContents}
                      renderMonthElement={
                        (selectableMonth || selectableYear)
                          ? this.renderSelectableMonthElement
                          : renderMonthElement
                      }
                      firstDayOfWeek={firstDayOfWeek}
                      daySize={daySize}
                      focusedDate={isVisible ? focusedDate : null}
                      isFocused={isFocused}
                      phrases={phrases}
                      setMonthTitleHeight={setMonthTitleHeight}
                      dayAriaLabelFormat={dayAriaLabelFormat}
                      verticalBorderSpacing={verticalBorderSpacing}
                      horizontalMonthPadding={horizontalMonthPadding}
                      calendarSystem={calendarSystem}
                    />
                  </div>
                );
              })}
            </div>
          )
        }
      </>
    );
  }
}

CalendarMonthGrid.propTypes = propTypes;
CalendarMonthGrid.defaultProps = defaultProps;

export default withStyles(({
  reactDates: {
    color,
    spacing,
    zIndex,
  },
  spacing: themeSpacing,
}) => ({
  CalendarMonthGrid: {
    background: color.background,
    textAlign: noflip('left'),
    zIndex,
  },

  CalendarMonthGrid__animating: {
    zIndex: zIndex + 1,
  },

  CalendarMonthGrid__horizontal: {
    position: 'absolute',
    left: noflip(spacing.dayPickerHorizontalPadding),
  },

  CalendarMonthGrid__vertical: {
    margin: '0 auto',
  },

  CalendarMonthGrid__vertical_scrollable: {
    margin: '0 auto',
  },

  CalendarMonthGrid_month__horizontal: {
    display: 'inline-block',
    verticalAlign: 'top',
    minHeight: '100%',
  },

  CalendarMonthGrid_month__hideForAnimation: {
    position: 'absolute',
    zIndex: zIndex - 1,
    opacity: 0,
    pointerEvents: 'none',
  },

  CalendarMonthGrid_month__hidden: {
    visibility: 'hidden',
  },

  CalendarMonthGrid_selectableYearMonth_wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: color.background,
    zIndex: zIndex + 2,
    overflow: 'auto',
  },

  CalendarMonthGrid_selectableYearMonth_buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  CalendarMonthGrid_selectableYearMonth_button: {
    cursor: 'pointer',
    '&:not(:last-child)': {
      marginRight: themeSpacing(),
    },
  },

  CalendarMonthGrid_openSelectableYearMonth_svg: {
    marginLeft: 4,
    marginRight: 4,
    height: 15,
    width: 15,
  },

  CalendarMonthGrid_closeSelectableYearMonth_svg: {
    marginLeft: 4,
    marginRight: 4,
    height: 15,
    width: 15,
  },
}), { pureComponent: typeof React.PureComponent !== 'undefined' })(CalendarMonthGrid);
