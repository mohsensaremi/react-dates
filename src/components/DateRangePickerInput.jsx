import React from 'react';
import PropTypes from 'prop-types';
import { forbidExtraProps, nonNegativeInteger } from 'airbnb-prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

import { DateRangePickerInputPhrases } from '../defaultPhrases';
import getPhrasePropTypes from '../utils/getPhrasePropTypes';
import noflip from '../utils/noflip';
import openDirectionShape from '../shapes/OpenDirectionShape';

import DateInput from './DateInput';
import IconPositionShape from '../shapes/IconPositionShape';
import DisabledShape from '../shapes/DisabledShape';

import RightArrow from './RightArrow';
import LeftArrow from './LeftArrow';
import CloseButton from './CloseButton';
import CalendarIcon from './CalendarIcon';

import {
  START_DATE,
  END_DATE,
  ICON_BEFORE_POSITION,
  ICON_AFTER_POSITION,
  OPEN_DOWN,
} from '../constants';

const propTypes = forbidExtraProps({
  classes: PropTypes.object.isRequired,

  children: PropTypes.node,

  startDateId: PropTypes.string,
  startDatePlaceholderText: PropTypes.string,
  startDateAriaLabel: PropTypes.string,
  startDateTitleText: PropTypes.string,
  screenReaderMessage: PropTypes.string,

  endDateId: PropTypes.string,
  endDatePlaceholderText: PropTypes.string,
  endDateAriaLabel: PropTypes.string,
  endDateTitleText: PropTypes.string,

  onStartDateFocus: PropTypes.func,
  onEndDateFocus: PropTypes.func,
  onStartDateChange: PropTypes.func,
  onEndDateChange: PropTypes.func,
  onStartDateShiftTab: PropTypes.func,
  onEndDateTab: PropTypes.func,
  onClearDates: PropTypes.func,
  onKeyDownArrowDown: PropTypes.func,
  onKeyDownQuestionMark: PropTypes.func,

  startDate: PropTypes.string,
  endDate: PropTypes.string,

  isStartDateFocused: PropTypes.bool,
  isEndDateFocused: PropTypes.bool,
  showClearDates: PropTypes.bool,
  disabled: DisabledShape,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  openDirection: openDirectionShape,
  showCaret: PropTypes.bool,
  showDefaultInputIcon: PropTypes.bool,
  inputIconPosition: IconPositionShape,
  customInputIcon: PropTypes.node,
  customArrowIcon: PropTypes.node,
  customCloseIcon: PropTypes.node,
  noBorder: PropTypes.bool,
  block: PropTypes.bool,
  small: PropTypes.bool,
  regular: PropTypes.bool,
  verticalSpacing: nonNegativeInteger,

  // accessibility
  isFocused: PropTypes.bool, // describes actual DOM focus

  // i18n
  phrases: PropTypes.shape(getPhrasePropTypes(DateRangePickerInputPhrases)),

  isRTL: PropTypes.bool,
});

const defaultProps = {
  children: null,
  startDateId: START_DATE,
  endDateId: END_DATE,
  startDatePlaceholderText: 'Start Date',
  endDatePlaceholderText: 'End Date',
  startDateAriaLabel: undefined,
  endDateAriaLabel: undefined,
  startDateTitleText: undefined,
  endDateTitleText: undefined,
  screenReaderMessage: '',
  onStartDateFocus() {
  },
  onEndDateFocus() {
  },
  onStartDateChange() {
  },
  onEndDateChange() {
  },
  onStartDateShiftTab() {
  },
  onEndDateTab() {
  },
  onClearDates() {
  },
  onKeyDownArrowDown() {
  },
  onKeyDownQuestionMark() {
  },

  startDate: '',
  endDate: '',

  isStartDateFocused: false,
  isEndDateFocused: false,
  showClearDates: false,
  disabled: false,
  required: false,
  readOnly: false,
  openDirection: OPEN_DOWN,
  showCaret: false,
  showDefaultInputIcon: false,
  inputIconPosition: ICON_BEFORE_POSITION,
  customInputIcon: null,
  customArrowIcon: null,
  customCloseIcon: null,
  noBorder: true,
  block: false,
  small: false,
  regular: false,
  verticalSpacing: undefined,

  // accessibility
  isFocused: false,

  // i18n
  phrases: DateRangePickerInputPhrases,

  isRTL: false,
};

function DateRangePickerInput({
  children,
  startDate,
  startDateId,
  startDatePlaceholderText,
  screenReaderMessage,
  isStartDateFocused,
  onStartDateChange,
  onStartDateFocus,
  onStartDateShiftTab,
  startDateAriaLabel,
  startDateTitleText,
  endDate,
  endDateId,
  endDatePlaceholderText,
  isEndDateFocused,
  onEndDateChange,
  onEndDateFocus,
  onEndDateTab,
  endDateAriaLabel,
  endDateTitleText,
  onKeyDownArrowDown,
  onKeyDownQuestionMark,
  onClearDates,
  showClearDates,
  disabled,
  required,
  readOnly,
  showCaret,
  openDirection,
  showDefaultInputIcon,
  inputIconPosition,
  customInputIcon,
  customArrowIcon,
  customCloseIcon,
  isFocused,
  phrases,
  isRTL,
  noBorder,
  block,
  verticalSpacing,
  small,
  regular,
  classes: styles,
}) {
  const calendarIcon = customInputIcon || (
    <CalendarIcon className={styles.DateRangePickerInput_calendarIcon_svg} />
  );

  // eslint-disable-next-line max-len
  let arrowIcon = customArrowIcon || <RightArrow className={styles.DateRangePickerInput_arrow_svg} />;
  if (isRTL) arrowIcon = <LeftArrow className={styles.DateRangePickerInput_arrow_svg} />;
  if (small) arrowIcon = '-';

  const closeIcon = customCloseIcon || (
    <CloseButton
      className={clsx(styles.DateRangePickerInput_clearDates_svg, {
        [styles.DateRangePickerInput_clearDates_svg__small]: small,
      })}
    />
  );

  const screenReaderStartDateText = screenReaderMessage
    || phrases.keyboardForwardNavigationInstructions;
  const screenReaderEndDateText = screenReaderMessage
    || phrases.keyboardBackwardNavigationInstructions;

  const inputIcon = (showDefaultInputIcon || customInputIcon !== null) && (
    <button
      className={styles.DateRangePickerInput_calendarIcon}
      type="button"
      disabled={disabled}
      aria-label={phrases.focusStartDate}
      onClick={onKeyDownArrowDown}
    >
      {calendarIcon}
    </button>
  );

  const startDateDisabled = disabled === START_DATE || disabled === true;
  const endDateDisabled = disabled === END_DATE || disabled === true;

  return (
    <div
      className={clsx(styles.DateRangePickerInput, {
        [styles.DateRangePickerInput__disabled]: disabled,
        [styles.DateRangePickerInput__rtl]: isRTL,
        [styles.DateRangePickerInput__withBorder]: !noBorder,
        [styles.DateRangePickerInput__block]: block,
        [styles.DateRangePickerInput__showClearDates]: showClearDates,
      })}
    >
      <DateInput
        id={startDateId}
        placeholder={startDatePlaceholderText}
        label={startDateLabelText}
        ariaLabel={startDateAriaLabel}
        titleText={startDateTitleText}
        displayValue={startDate}
        screenReaderMessage={screenReaderStartDateText}
        focused={isStartDateFocused}
        isFocused={isFocused}
        disabled={startDateDisabled}
        required={required}
        readOnly={readOnly}
        showCaret={showCaret}
        openDirection={openDirection}
        onChange={onStartDateChange}
        onFocus={onStartDateFocus}
        onKeyDownShiftTab={onStartDateShiftTab}
        onKeyDownArrowDown={onKeyDownArrowDown}
        onKeyDownQuestionMark={onKeyDownQuestionMark}
        verticalSpacing={verticalSpacing}
        small={small}
        regular={regular}
        isStartDate
        startAdornment={inputIconPosition === ICON_BEFORE_POSITION && inputIcon}
        endAdornment={(
          <div
            className={styles.DateRangePickerInput_arrow}
            aria-hidden="true"
            role="presentation"
          >
            {arrowIcon}
          </div>
        )}
      />

      {children}

      <DateInput
        id={endDateId}
        placeholder={endDatePlaceholderText}
        label={endDateLabelText}
        ariaLabel={endDateAriaLabel}
        titleText={endDateTitleText}
        displayValue={endDate}
        screenReaderMessage={screenReaderEndDateText}
        focused={isEndDateFocused}
        isFocused={isFocused}
        disabled={endDateDisabled}
        required={required}
        readOnly={readOnly}
        showCaret={showCaret}
        openDirection={openDirection}
        onChange={onEndDateChange}
        onFocus={onEndDateFocus}
        onKeyDownArrowDown={onKeyDownArrowDown}
        onKeyDownQuestionMark={onKeyDownQuestionMark}
        onKeyDownTab={onEndDateTab}
        verticalSpacing={verticalSpacing}
        small={small}
        regular={regular}
        isEndDate
        endAdornment={showClearDates && (
          <>
            <button
              type="button"
              aria-label={phrases.clearDates}
              className={clsx(styles.DateRangePickerInput_clearDates, {
                [styles.DateRangePickerInput_clearDates__small]: small,
                [styles.DateRangePickerInput_clearDates_default]: !customCloseIcon,
                [styles.DateRangePickerInput_clearDates__hide]: !(startDate || endDate),
              })}
              onClick={onClearDates}
              disabled={disabled}
            >
              {closeIcon}
            </button>
            {inputIconPosition === ICON_AFTER_POSITION && inputIcon}
          </>
        )}
      />

    </div>
  );
}

DateRangePickerInput.propTypes = propTypes;
DateRangePickerInput.defaultProps = defaultProps;

export default withStyles(({ reactDates: { border, color, sizing } }) => ({
  DateRangePickerInput: {
    backgroundColor: color.background,
    display: 'inline-flex',
    alignItems: 'center',
  },

  DateRangePickerInput__disabled: {
    background: color.disabled,
  },

  DateRangePickerInput__withBorder: {
    borderColor: color.border,
    borderWidth: border.pickerInput.borderWidth,
    borderStyle: border.pickerInput.borderStyle,
    borderRadius: border.pickerInput.borderRadius,
  },

  DateRangePickerInput__rtl: {
    direction: noflip('rtl'),
  },

  DateRangePickerInput__block: {
    display: 'flex',
  },

  DateRangePickerInput__showClearDates: {},

  DateRangePickerInput_arrow: {
    display: 'inline-block',
    verticalAlign: 'middle',
    color: color.text,
  },

  DateRangePickerInput_arrow_svg: {
    verticalAlign: 'middle',
    fill: color.text,
    height: sizing.arrowWidth,
    width: sizing.arrowWidth,
  },

  DateRangePickerInput_clearDates: {
    background: 'none',
    border: 0,
    color: 'inherit',
    font: 'inherit',
    lineHeight: 'normal',
    overflow: 'visible',

    cursor: 'pointer',
    padding: 10,
    margin: '0 10px 0 5px', // TODO: should be noflip wrapped and handled by an isRTL prop
    position: 'absolute',
    right: 0, // TODO: should be noflip wrapped and handled by an isRTL prop
    top: '50%',
    transform: 'translateY(-50%)',
  },

  DateRangePickerInput_clearDates__small: {
    padding: 6,
  },

  DateRangePickerInput_clearDates_default: {
    ':focus': {
      background: color.core.border,
      borderRadius: '50%',
    },

    ':hover': {
      background: color.core.border,
      borderRadius: '50%',
    },
  },

  DateRangePickerInput_clearDates__hide: {
    visibility: 'hidden',
  },

  DateRangePickerInput_clearDates_svg: {
    fill: color.core.grayLight,
    height: 12,
    width: 15,
    verticalAlign: 'middle',
  },

  DateRangePickerInput_clearDates_svg__small: {
    height: 9,
  },

  DateRangePickerInput_calendarIcon: {
    background: 'none',
    border: 0,
    color: 'inherit',
    font: 'inherit',
    lineHeight: 'normal',
    overflow: 'visible',

    cursor: 'pointer',
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: 4,
  },

  DateRangePickerInput_calendarIcon_svg: {
    fill: color.core.grayLight,
    height: 15,
    width: 14,
    verticalAlign: 'middle',
  },
}), { pureComponent: typeof React.PureComponent !== 'undefined' })(DateRangePickerInput);
