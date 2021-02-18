import React from 'react';
import moment from 'moment';
import { Portal } from 'react-portal';
import { forbidExtraProps } from 'airbnb-prop-types';
import { addEventListener } from 'consolidated-events';
import isTouchDevice from 'is-touch-device';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Popper from '@material-ui/core/Popper';
import Popover from '@material-ui/core/Popover';
import { darken } from 'color2k';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

import DateRangePickerShape from '../shapes/DateRangePickerShape';
import { DateRangePickerPhrases } from '../defaultPhrases';
import getResponsiveContainerStyles from '../utils/getResponsiveContainerStyles';
import getDetachedContainerStyles from '../utils/getDetachedContainerStyles';
import getInputHeight from '../utils/getInputHeight';
import isInclusivelyAfterDay from '../utils/isInclusivelyAfterDay';
import disableScroll from '../utils/disableScroll';
import noflip from '../utils/noflip';

import DateRangePickerInputController from './DateRangePickerInputController';
import DayPickerRangeController from './DayPickerRangeController';
import CloseButton from './CloseButton';

import {
  ANCHOR_LEFT,
  ANCHOR_RIGHT,
  CALENDAR_SYSTEM_GREGORIAN,
  DAY_SIZE,
  DEFAULT_VERTICAL_SPACING,
  END_DATE,
  FANG_HEIGHT_PX,
  HORIZONTAL_ORIENTATION,
  ICON_BEFORE_POSITION,
  INFO_POSITION_BOTTOM,
  NAV_POSITION_TOP,
  OPEN_DOWN,
  OPEN_UP,
  START_DATE,
  VERTICAL_ORIENTATION,
} from '../constants';
import getDaySize from '../utils/getDaySize';

const propTypes = forbidExtraProps({
  ...DateRangePickerShape,
});

const defaultProps = {
  DateRangePickerInputClasses: undefined,
  StartDateInputClasses: undefined,
  EndDateInputClasses: undefined,
  DayPickerClasses: undefined,
  CalendarMonthGridClasses: undefined,
  DayPickerNavigationClasses: undefined,
  CalendarMonthClasses: undefined,
  CalendarDayClasses: undefined,
  // required props for a functional interactive DateRangePicker
  startDate: null,
  endDate: null,
  focusedInput: null,

  // input related props
  startDatePlaceholderText: 'Start Date',
  endDatePlaceholderText: 'End Date',
  startDateLabelText: undefined,
  endDateLabelText: undefined,
  startDateAriaLabel: undefined,
  endDateAriaLabel: undefined,
  startDateTitleText: undefined,
  endDateTitleText: undefined,
  startDateOffset: undefined,
  endDateOffset: undefined,
  disabled: false,
  required: false,
  variant: 'outlined',
  margin: undefined,
  readOnly: false,
  screenReaderInputMessage: '',
  showClearDates: false,
  showDefaultInputIcon: false,
  inputIconPosition: ICON_BEFORE_POSITION,
  customInputIcon: null,
  customArrowIcon: null,
  customCloseIcon: null,
  noBorder: true,
  block: false,
  small: false,
  regular: false,
  keepFocusOnInput: false,

  // calendar presentation and interaction related props
  renderMonthText: null,
  renderWeekHeaderElement: null,
  orientation: HORIZONTAL_ORIENTATION,
  anchorDirection: ANCHOR_LEFT,
  openDirection: OPEN_DOWN,
  horizontalMargin: 0,
  withPortal: false,
  withFullScreenPortal: false,
  appendToBody: false,
  disableScroll: false,
  initialVisibleMonth: null,
  defaultInitialVisibleMonth: null,
  numberOfMonths: 2,
  keepOpenOnDateSelect: false,
  reopenPickerOnClearDates: false,
  renderCalendarInfo: null,
  calendarInfoPosition: INFO_POSITION_BOTTOM,
  hideKeyboardShortcutsPanel: false,
  daySize: DAY_SIZE,
  isRTL: false,
  firstDayOfWeek: null,
  verticalHeight: null,
  transitionDuration: undefined,
  verticalSpacing: DEFAULT_VERTICAL_SPACING,
  horizontalMonthPadding: 13,

  // navigation related props
  dayPickerNavigationInlineStyles: null,
  navPosition: NAV_POSITION_TOP,
  navPrev: null,
  navNext: null,
  renderNavPrevButton: null,
  renderNavNextButton: null,

  onPrevMonthClick() {
  },
  onNextMonthClick() {
  },

  onClose() {
  },

  // day presentation and interaction related props
  renderCalendarDay: undefined,
  renderDayContents: null,
  renderMonthElement: null,
  minimumNights: 1,
  enableOutsideDays: false,
  isDayBlocked: () => false,
  isOutsideRange: (day) => !isInclusivelyAfterDay(day, moment()),
  isDayHighlighted: () => false,
  minDate: undefined,
  maxDate: undefined,

  // internationalization
  displayFormat: () => moment.localeData()
    .longDateFormat('L'),
  monthFormat: 'MMMM YYYY',
  weekDayFormat: 'dd',
  phrases: DateRangePickerPhrases,
  dayAriaLabelFormat: undefined,

  calendarSystem: CALENDAR_SYSTEM_GREGORIAN,

  usePopper: false,
  usePopover: false,
  PopperProps: undefined,
  PopoverProps: undefined,

  appendToInput: false,
};

class DateRangePicker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dayPickerContainerStyles: {},
      isDateRangePickerInputFocused: false,
      isDayPickerFocused: false,
      showKeyboardShortcuts: false,
    };

    this.isTouchDevice = false;

    this.onOutsideClick = this.onOutsideClick.bind(this);
    this.onDateRangePickerInputFocus = this.onDateRangePickerInputFocus.bind(this);
    this.onDayPickerFocus = this.onDayPickerFocus.bind(this);
    this.onDayPickerFocusOut = this.onDayPickerFocusOut.bind(this);
    this.onDayPickerBlur = this.onDayPickerBlur.bind(this);
    this.showKeyboardShortcutsPanel = this.showKeyboardShortcutsPanel.bind(this);

    this.responsivizePickerPosition = this.responsivizePickerPosition.bind(this);
    this.disableScroll = this.disableScroll.bind(this);

    this.setDayPickerContainerRef = this.setDayPickerContainerRef.bind(this);
    this.setContainerRef = this.setContainerRef.bind(this);
  }

  componentDidMount() {
    this.removeEventListener = addEventListener(
      window,
      'resize',
      this.responsivizePickerPosition,
      { passive: true },
    );
    this.responsivizePickerPosition();
    this.disableScroll();

    const { focusedInput } = this.props;
    if (focusedInput) {
      this.setState({
        isDateRangePickerInputFocused: true,
      });
    }

    this.isTouchDevice = isTouchDevice();
  }

  componentDidUpdate(prevProps) {
    const { focusedInput } = this.props;
    if (!prevProps.focusedInput && focusedInput && this.isOpened()) {
      // The date picker just changed from being closed to being open.
      this.responsivizePickerPosition();
      this.disableScroll();
    } else if (prevProps.focusedInput && !focusedInput && !this.isOpened()) {
      // The date picker just changed from being open to being closed.
      if (this.enableScroll) this.enableScroll();
    }
  }

  componentWillUnmount() {
    this.removeDayPickerEventListeners();
    if (this.removeEventListener) this.removeEventListener();
    if (this.enableScroll) this.enableScroll();
  }

  onOutsideClick(event) {
    const {
      onFocusChange,
      onClose,
      startDate,
      endDate,
      appendToBody,
      usePopper,
    } = this.props;

    if (!this.isOpened()) return;
    if (
      (appendToBody || usePopper)
      && this.dayPickerContainer.contains(event.target)
    ) return;

    this.setState({
      isDateRangePickerInputFocused: false,
      isDayPickerFocused: false,
      showKeyboardShortcuts: false,
    });

    onFocusChange(null);
    onClose({
      startDate,
      endDate,
    });
  }

  onDateRangePickerInputFocus(focusedInput) {
    const {
      onFocusChange,
      readOnly,
      withPortal,
      withFullScreenPortal,
      keepFocusOnInput,
    } = this.props;

    if (focusedInput) {
      const withAnyPortal = withPortal || withFullScreenPortal;
      const moveFocusToDayPicker = withAnyPortal
        || (readOnly && !keepFocusOnInput)
        || (this.isTouchDevice && !keepFocusOnInput);

      if (moveFocusToDayPicker) {
        this.onDayPickerFocus();
      } else {
        this.onDayPickerBlur();
      }
    }

    onFocusChange(focusedInput);
  }

  onDayPickerFocus() {
    const { focusedInput, onFocusChange } = this.props;
    if (!focusedInput) onFocusChange(START_DATE);

    this.setState({
      isDateRangePickerInputFocused: false,
      isDayPickerFocused: true,
      showKeyboardShortcuts: false,
    });
  }

  onDayPickerFocusOut(event) {
    // In cases where **relatedTarget** is not null, it points to the right
    // element here. However, in cases where it is null (such as clicking on a
    // specific day) or it is **document.body** (IE11), the appropriate value is **event.target**.
    //
    // We handle both situations here by using the ` || ` operator to fallback
    // to *event.target** when **relatedTarget** is not provided.
    const relatedTarget = event.relatedTarget === document.body
      ? event.target
      : (event.relatedTarget || event.target);
    if (this.dayPickerContainer.contains(relatedTarget)) return;
    this.onOutsideClick(event);
  }

  onDayPickerBlur() {
    this.setState({
      isDateRangePickerInputFocused: true,
      isDayPickerFocused: false,
      showKeyboardShortcuts: false,
    });
  }

  setDayPickerContainerRef(ref) {
    if (ref === this.dayPickerContainer) return;
    if (this.dayPickerContainer) this.removeDayPickerEventListeners();

    this.dayPickerContainer = ref;
    if (!ref) return;

    this.addDayPickerEventListeners();
  }

  setContainerRef(ref) {
    this.container = ref;
  }

  addDayPickerEventListeners() {
    // NOTE: We are using a manual event listener here, because React doesn't
    // provide FocusOut, while blur and keydown don't provide the information
    // needed in order to know whether we have left focus or not.
    //
    // For reference, this issue is further described here:
    // - https://github.com/facebook/react/issues/6410
    this.removeDayPickerFocusOut = addEventListener(
      this.dayPickerContainer,
      'focusout',
      this.onDayPickerFocusOut,
    );
  }

  removeDayPickerEventListeners() {
    if (this.removeDayPickerFocusOut) this.removeDayPickerFocusOut();
  }

  isOpened() {
    const { focusedInput } = this.props;
    return focusedInput === START_DATE || focusedInput === END_DATE;
  }

  disableScroll() {
    const { appendToBody, disableScroll: propDisableScroll } = this.props;
    if (!appendToBody && !propDisableScroll) return;
    if (!this.isOpened()) return;

    // Disable scroll for every ancestor of this DateRangePicker up to the
    // document level. This ensures the input and the picker never move. Other
    // sibling elements or the picker itself can scroll.
    this.enableScroll = disableScroll(this.container);
  }

  responsivizePickerPosition() {
    // It's possible the portal props have been changed in response to window resizes
    // So let's ensure we reset this back to the base state each time
    const { dayPickerContainerStyles } = this.state;

    if (Object.keys(dayPickerContainerStyles).length > 0) {
      this.setState({ dayPickerContainerStyles: {} });
    }

    const {
      usePopper,
      usePopover,
    } = this.props;

    if (!this.isOpened() || usePopper || usePopover) {
      return;
    }

    const {
      openDirection,
      anchorDirection,
      horizontalMargin,
      withPortal,
      withFullScreenPortal,
      appendToBody,
    } = this.props;

    const isAnchoredLeft = anchorDirection === ANCHOR_LEFT;
    if (!withPortal && !withFullScreenPortal) {
      const containerRect = this.dayPickerContainer.getBoundingClientRect();
      const currentOffset = dayPickerContainerStyles[anchorDirection] || 0;
      const containerEdge = isAnchoredLeft
        ? containerRect[ANCHOR_RIGHT]
        : containerRect[ANCHOR_LEFT];

      this.setState({
        dayPickerContainerStyles: {
          ...getResponsiveContainerStyles(
            anchorDirection,
            currentOffset,
            containerEdge,
            horizontalMargin,
          ),
          ...(appendToBody && getDetachedContainerStyles(
            openDirection,
            anchorDirection,
            this.container,
          )),
        },
      });
    }
  }

  showKeyboardShortcutsPanel() {
    this.setState({
      isDateRangePickerInputFocused: false,
      isDayPickerFocused: true,
      showKeyboardShortcuts: true,
    });
  }

  maybeRenderDayPickerWithPortal() {
    const {
      withPortal,
      withFullScreenPortal,
      appendToBody,
      usePopper,
      usePopover,
      PopperProps,
      PopoverProps,
    } = this.props;

    if (usePopper) {
      return (
        <Popper
          open={this.isOpened()}
          anchorEl={this.container}
          {...PopperProps}
        >
          {this.renderDayPicker()}
        </Popper>
      );
    }
    if (usePopover) {
      return (
        <Popover
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={this.isOpened()}
          anchorEl={this.container}
          onClose={this.onOutsideClick}
          disableRestoreFocus
          {...PopoverProps}
        >
          {this.renderDayPicker()}
        </Popover>
      );
    }

    if (!this.isOpened()) {
      return null;
    }

    if (withPortal || withFullScreenPortal || appendToBody) {
      return (
        <Portal>
          {this.renderDayPicker()}
        </Portal>
      );
    }

    return this.renderDayPicker();
  }

  renderDayPicker() {
    const {
      DayPickerClasses,
      CalendarMonthGridClasses,
      DayPickerNavigationClasses,
      CalendarMonthClasses,
      CalendarDayClasses,
      anchorDirection,
      openDirection,
      isDayBlocked,
      isDayHighlighted,
      isOutsideRange,
      numberOfMonths,
      orientation,
      monthFormat,
      renderMonthText,
      renderWeekHeaderElement,
      dayPickerNavigationInlineStyles,
      navPosition,
      navPrev,
      navNext,
      renderNavPrevButton,
      renderNavNextButton,
      onPrevMonthClick,
      onNextMonthClick,
      onDatesChange,
      onFocusChange,
      withPortal,
      withFullScreenPortal,
      daySize,
      enableOutsideDays,
      focusedInput,
      startDate,
      startDateOffset,
      endDate,
      endDateOffset,
      minDate,
      maxDate,
      minimumNights,
      keepOpenOnDateSelect,
      renderCalendarDay,
      renderDayContents,
      renderCalendarInfo,
      renderMonthElement,
      calendarInfoPosition,
      firstDayOfWeek,
      initialVisibleMonth,
      defaultInitialVisibleMonth,
      hideKeyboardShortcutsPanel,
      customCloseIcon,
      onClose,
      phrases,
      dayAriaLabelFormat,
      isRTL,
      weekDayFormat,
      classes: styles,
      verticalHeight,
      noBorder,
      transitionDuration,
      verticalSpacing,
      horizontalMonthPadding,
      small,
      disabled,
      theme: { reactDates },
      calendarSystem,
      usePopper,
      usePopover,
      appendToInput,
    } = this.props;

    const calculatedDaySize = getDaySize(
      daySize,
      horizontalMonthPadding,
      appendToInput,
      this.container,
      reactDates,
    );

    const { dayPickerContainerStyles, isDayPickerFocused, showKeyboardShortcuts } = this.state;

    const onOutsideClick = (!withFullScreenPortal && withPortal)
      ? this.onOutsideClick
      : undefined;
    const initialVisibleMonthThunk = initialVisibleMonth || (
      () => (startDate || endDate || defaultInitialVisibleMonth || moment())
    );

    const closeIcon = customCloseIcon || (
      <CloseButton className={styles.DateRangePicker_closeButton_svg} />
    );

    const inputHeight = getInputHeight(reactDates, small);

    const withAnyPortal = withPortal || withFullScreenPortal;

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    /* eslint-disable jsx-a11y/click-events-have-key-events */
    return (
      <div
        ref={this.setDayPickerContainerRef}
        className={clsx(styles.DateRangePicker_picker, {
          [styles.DateRangePicker_pickerAbsolute]: !usePopper && !usePopover && !appendToInput,
          [styles.DateRangePicker_pickerAppendToInput]: appendToInput,
          [styles.DateRangePicker_picker__directionLeft]: anchorDirection === ANCHOR_LEFT,
          [styles.DateRangePicker_picker__directionRight]: anchorDirection === ANCHOR_RIGHT,
          [styles.DateRangePicker_picker__horizontal]: orientation === HORIZONTAL_ORIENTATION,
          [styles.DateRangePicker_picker__vertical]: orientation === VERTICAL_ORIENTATION,
          [styles.DateRangePicker_picker__portal]: withAnyPortal,
          [styles.DateRangePicker_picker__fullScreenPortal]: withFullScreenPortal,
          [styles.DateRangePicker_picker__rtl]: isRTL,
        })}
        style={{
          ...(!withAnyPortal && openDirection === OPEN_DOWN && {
            top: (appendToInput ? 0 : inputHeight) + verticalSpacing - (appendToInput ? 11 : 0),
          }),
          ...(!withAnyPortal && openDirection === OPEN_UP && {
            bottom: (appendToInput ? 0 : inputHeight) + verticalSpacing - (appendToInput ? 11 : 0),
          }),
          ...dayPickerContainerStyles,
        }}
        onClick={onOutsideClick}
      >
        <DayPickerRangeController
          DayPickerClasses={DayPickerClasses}
          CalendarMonthGridClasses={CalendarMonthGridClasses}
          DayPickerNavigationClasses={DayPickerNavigationClasses}
          CalendarMonthClasses={CalendarMonthClasses}
          CalendarDayClasses={CalendarDayClasses}
          orientation={orientation}
          enableOutsideDays={enableOutsideDays}
          numberOfMonths={numberOfMonths}
          onPrevMonthClick={onPrevMonthClick}
          onNextMonthClick={onNextMonthClick}
          onDatesChange={onDatesChange}
          onFocusChange={onFocusChange}
          onClose={onClose}
          focusedInput={focusedInput}
          startDate={startDate}
          startDateOffset={startDateOffset}
          endDate={endDate}
          endDateOffset={endDateOffset}
          minDate={minDate}
          maxDate={maxDate}
          monthFormat={monthFormat}
          renderMonthText={renderMonthText}
          renderWeekHeaderElement={renderWeekHeaderElement}
          withPortal={withAnyPortal}
          daySize={calculatedDaySize}
          initialVisibleMonth={initialVisibleMonthThunk}
          hideKeyboardShortcutsPanel={hideKeyboardShortcutsPanel}
          dayPickerNavigationInlineStyles={dayPickerNavigationInlineStyles}
          navPosition={navPosition}
          navPrev={navPrev}
          navNext={navNext}
          renderNavPrevButton={renderNavPrevButton}
          renderNavNextButton={renderNavNextButton}
          minimumNights={minimumNights}
          isOutsideRange={isOutsideRange}
          isDayHighlighted={isDayHighlighted}
          isDayBlocked={isDayBlocked}
          keepOpenOnDateSelect={keepOpenOnDateSelect}
          renderCalendarDay={renderCalendarDay}
          renderDayContents={renderDayContents}
          renderCalendarInfo={renderCalendarInfo}
          renderMonthElement={renderMonthElement}
          calendarInfoPosition={calendarInfoPosition}
          isFocused={isDayPickerFocused}
          showKeyboardShortcuts={showKeyboardShortcuts}
          onBlur={this.onDayPickerBlur}
          phrases={phrases}
          dayAriaLabelFormat={dayAriaLabelFormat}
          isRTL={isRTL}
          firstDayOfWeek={firstDayOfWeek}
          weekDayFormat={weekDayFormat}
          verticalHeight={verticalHeight}
          noBorder={noBorder}
          transitionDuration={transitionDuration}
          disabled={disabled}
          horizontalMonthPadding={horizontalMonthPadding}
          calendarSystem={calendarSystem}
          appendToInput={appendToInput}
        />

        {withFullScreenPortal && (
          <button
            className={styles.DateRangePicker_closeButton}
            type="button"
            onClick={this.onOutsideClick}
            aria-label={phrases.closeDatePicker}
          >
            {closeIcon}
          </button>
        )}
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
    /* eslint-enable jsx-a11y/click-events-have-key-events */
  }

  render() {
    const {
      DateRangePickerInputClasses,
      StartDateInputClasses,
      EndDateInputClasses,
      startDate,
      startDateId,
      startDatePlaceholderText,
      startDateLabelText,
      startDateAriaLabel,
      startDateTitleText,
      endDate,
      endDateId,
      endDatePlaceholderText,
      endDateLabelText,
      endDateAriaLabel,
      endDateTitleText,
      focusedInput,
      screenReaderInputMessage,
      showClearDates,
      showDefaultInputIcon,
      inputIconPosition,
      customInputIcon,
      customArrowIcon,
      customCloseIcon,
      disabled,
      required,
      variant,
      margin,
      readOnly,
      openDirection,
      phrases,
      isOutsideRange,
      isDayBlocked,
      minimumNights,
      withPortal,
      withFullScreenPortal,
      displayFormat,
      reopenPickerOnClearDates,
      keepOpenOnDateSelect,
      onDatesChange,
      onClose,
      isRTL,
      noBorder,
      block,
      verticalSpacing,
      small,
      regular,
      classes: styles,
      usePopper,
      usePopover,
    } = this.props;

    const { isDateRangePickerInputFocused } = this.state;

    const enableOutsideClick = (!withPortal && !withFullScreenPortal);

    const hideFang = verticalSpacing < FANG_HEIGHT_PX;

    const input = (
      <DateRangePickerInputController
        DateRangePickerInputClasses={DateRangePickerInputClasses}
        StartDateInputClasses={StartDateInputClasses}
        EndDateInputClasses={EndDateInputClasses}
        startDate={startDate}
        startDateId={startDateId}
        startDatePlaceholderText={startDatePlaceholderText}
        startDateLabelText={startDateLabelText}
        isStartDateFocused={focusedInput === START_DATE}
        startDateAriaLabel={startDateAriaLabel}
        startDateTitleText={startDateTitleText}
        endDate={endDate}
        endDateId={endDateId}
        endDatePlaceholderText={endDatePlaceholderText}
        endDateLabelText={endDateLabelText}
        isEndDateFocused={focusedInput === END_DATE}
        endDateAriaLabel={endDateAriaLabel}
        endDateTitleText={endDateTitleText}
        displayFormat={displayFormat}
        showClearDates={showClearDates}
        showCaret={!usePopper && !usePopover && !withPortal && !withFullScreenPortal && !hideFang}
        showDefaultInputIcon={showDefaultInputIcon}
        inputIconPosition={inputIconPosition}
        customInputIcon={customInputIcon}
        customArrowIcon={customArrowIcon}
        customCloseIcon={customCloseIcon}
        disabled={disabled}
        required={required}
        variant={variant}
        margin={margin}
        readOnly={readOnly}
        openDirection={openDirection}
        reopenPickerOnClearDates={reopenPickerOnClearDates}
        keepOpenOnDateSelect={keepOpenOnDateSelect}
        isOutsideRange={isOutsideRange}
        isDayBlocked={isDayBlocked}
        minimumNights={minimumNights}
        withFullScreenPortal={withFullScreenPortal}
        onDatesChange={onDatesChange}
        onFocusChange={this.onDateRangePickerInputFocus}
        onKeyDownArrowDown={this.onDayPickerFocus}
        onKeyDownQuestionMark={this.showKeyboardShortcutsPanel}
        onClose={onClose}
        phrases={phrases}
        screenReaderMessage={screenReaderInputMessage}
        isFocused={isDateRangePickerInputFocused}
        isRTL={isRTL}
        noBorder={noBorder}
        block={block}
        small={small}
        regular={regular}
        verticalSpacing={verticalSpacing}
      >
        {this.maybeRenderDayPickerWithPortal()}
      </DateRangePickerInputController>
    );

    return (
      <div
        ref={this.setContainerRef}
        className={clsx(styles.DateRangePicker, {
          [styles.DateRangePicker__block]: block,
        })}
      >
        {
          usePopover ? input : (
            <>
              {enableOutsideClick && (
                <ClickAwayListener onClickAway={this.onOutsideClick}>
                  <div>
                    {input}
                  </div>
                </ClickAwayListener>
              )}
              {enableOutsideClick || input}
            </>
          )
        }
      </div>
    );
  }
}

DateRangePicker.propTypes = propTypes;
DateRangePicker.defaultProps = defaultProps;

export { DateRangePicker as PureDateRangePicker };
export default withStyles(({ reactDates: { color, zIndex } }) => ({
  DateRangePicker: {
    position: 'relative',
    display: 'inline-block',
  },

  DateRangePicker__block: {
    display: 'block',
  },

  DateRangePicker_picker: {
    zIndex: zIndex + 1,
    backgroundColor: color.background,
  },

  DateRangePicker_pickerAbsolute: {
    position: 'absolute',
  },

  DateRangePicker_pickerAppendToInput: {
    position: 'relative',
  },

  DateRangePicker_picker__rtl: {
    direction: noflip('rtl'),
  },

  DateRangePicker_picker__directionLeft: {
    left: noflip(0),
  },

  DateRangePicker_picker__directionRight: {
    right: noflip(0),
  },

  DateRangePicker_picker__portal: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'fixed',
    top: 0,
    left: noflip(0),
    height: '100%',
    width: '100%',
  },

  DateRangePicker_picker__fullScreenPortal: {
    backgroundColor: color.background,
  },

  DateRangePicker_closeButton: {
    background: 'none',
    border: 0,
    color: 'inherit',
    font: 'inherit',
    lineHeight: 'normal',
    overflow: 'visible',
    cursor: 'pointer',

    position: 'absolute',
    top: 0,
    right: noflip(0),
    padding: 15,
    zIndex: zIndex + 2,

    ':hover': {
      color: darken(color.core.grayLighter, 0.1),
      textDecoration: 'none',
    },

    ':focus': {
      color: darken(color.core.grayLighter, 0.1),
      textDecoration: 'none',
    },
  },

  DateRangePicker_closeButton_svg: {
    height: 15,
    width: 15,
    fill: color.core.grayLighter,
  },
}), { pureComponent: typeof React.PureComponent !== 'undefined', withTheme: true })(DateRangePicker);
