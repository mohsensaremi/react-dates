import React from 'react';
import PropTypes from 'prop-types';
import { forbidExtraProps, nonNegativeInteger } from 'airbnb-prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

import { SingleDatePickerInputPhrases } from '../defaultPhrases';
import getPhrasePropTypes from '../utils/getPhrasePropTypes';
import noflip from '../utils/noflip';

import DateInput from './DateInput';
import IconPositionShape from '../shapes/IconPositionShape';

import CloseButton from './CloseButton';
import CalendarIcon from './CalendarIcon';

import openDirectionShape from '../shapes/OpenDirectionShape';
import { ICON_BEFORE_POSITION, ICON_AFTER_POSITION, OPEN_DOWN } from '../constants';

const propTypes = forbidExtraProps({
  classes: PropTypes.object.isRequired,
  DateInputClasses: PropTypes.object,
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  ariaLabel: PropTypes.string,
  titleText: PropTypes.string,
  displayValue: PropTypes.string,
  screenReaderMessage: PropTypes.string,
  focused: PropTypes.bool,
  isFocused: PropTypes.bool, // describes actual DOM focus
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  openDirection: openDirectionShape,
  showCaret: PropTypes.bool,
  showClearDate: PropTypes.bool,
  customCloseIcon: PropTypes.node,
  showDefaultInputIcon: PropTypes.bool,
  inputIconPosition: IconPositionShape,
  customInputIcon: PropTypes.node,
  isRTL: PropTypes.bool,
  noBorder: PropTypes.bool,
  block: PropTypes.bool,
  small: PropTypes.bool,
  regular: PropTypes.bool,
  verticalSpacing: nonNegativeInteger,

  onChange: PropTypes.func,
  onClearDate: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDownShiftTab: PropTypes.func,
  onKeyDownTab: PropTypes.func,
  onKeyDownArrowDown: PropTypes.func,
  onKeyDownQuestionMark: PropTypes.func,

  // i18n
  phrases: PropTypes.shape(getPhrasePropTypes(SingleDatePickerInputPhrases)),
});

const defaultProps = {
  DateInputClasses: undefined,
  children: null,
  placeholder: 'Select Date',
  label: undefined,
  ariaLabel: undefined,
  titleText: undefined,
  displayValue: '',
  screenReaderMessage: '',
  focused: false,
  isFocused: false,
  disabled: false,
  required: false,
  readOnly: false,
  openDirection: OPEN_DOWN,
  showCaret: false,
  showClearDate: false,
  showDefaultInputIcon: false,
  inputIconPosition: ICON_BEFORE_POSITION,
  customCloseIcon: null,
  customInputIcon: null,
  isRTL: false,
  noBorder: true,
  block: false,
  small: false,
  regular: false,
  verticalSpacing: undefined,

  onChange() {
  },
  onClearDate() {
  },
  onFocus() {
  },
  onKeyDownShiftTab() {
  },
  onKeyDownTab() {
  },
  onKeyDownArrowDown() {
  },
  onKeyDownQuestionMark() {
  },

  // i18n
  phrases: SingleDatePickerInputPhrases,
};

function SingleDatePickerInput({
  DateInputClasses,
  id,
  children,
  placeholder,
  label,
  ariaLabel,
  titleText,
  displayValue,
  focused,
  isFocused,
  disabled,
  required,
  readOnly,
  showCaret,
  showClearDate,
  showDefaultInputIcon,
  inputIconPosition,
  phrases,
  onClearDate,
  onChange,
  onFocus,
  onKeyDownShiftTab,
  onKeyDownTab,
  onKeyDownArrowDown,
  onKeyDownQuestionMark,
  screenReaderMessage,
  customCloseIcon,
  customInputIcon,
  openDirection,
  isRTL,
  noBorder,
  block,
  small,
  regular,
  verticalSpacing,
  classes: styles,
}) {
  const calendarIcon = customInputIcon || (
    <CalendarIcon className={styles.SingleDatePickerInput_calendarIcon_svg} />
  );
  const closeIcon = customCloseIcon || (
    <CloseButton
      className={clsx(styles.SingleDatePickerInput_clearDate_svg, {
        [styles.SingleDatePickerInput_clearDate_svg__small]: small,
      })}
    />
  );

  const screenReaderText = screenReaderMessage || phrases.keyboardForwardNavigationInstructions;
  const inputIcon = (showDefaultInputIcon || customInputIcon !== null) && (
    <button
      className={styles.SingleDatePickerInput_calendarIcon}
      type="button"
      disabled={disabled}
      aria-label={phrases.focusStartDate}
      onClick={onFocus}
    >
      {calendarIcon}
    </button>
  );

  return (
    <div
      className={clsx(styles.SingleDatePickerInput, {
        [styles.SingleDatePickerInput__disabled]: disabled,
        [styles.SingleDatePickerInput__rtl]: isRTL,
        [styles.SingleDatePickerInput__withBorder]: !noBorder,
        [styles.SingleDatePickerInput__block]: block,
        [styles.SingleDatePickerInput__showClearDate]: showClearDate,
      })}
    >
      {inputIconPosition === ICON_BEFORE_POSITION && inputIcon}

      <DateInput
        classes={DateInputClasses}
        id={id}
        placeholder={placeholder}
        label={label}
        ariaLabel={ariaLabel}
        titleText={titleText}
        displayValue={displayValue}
        screenReaderMessage={screenReaderText}
        focused={focused}
        isFocused={isFocused}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        showCaret={showCaret}
        onChange={onChange}
        onFocus={onFocus}
        onKeyDownShiftTab={onKeyDownShiftTab}
        onKeyDownTab={onKeyDownTab}
        onKeyDownArrowDown={onKeyDownArrowDown}
        onKeyDownQuestionMark={onKeyDownQuestionMark}
        openDirection={openDirection}
        verticalSpacing={verticalSpacing}
        small={small}
        regular={regular}
        block={block}
      />

      {children}

      {showClearDate && (
        <button
          className={clsx(styles.SingleDatePickerInput_clearDate, {
            [styles.SingleDatePickerInput_clearDate__small]: small,
            [styles.SingleDatePickerInput_clearDate__default]: !customCloseIcon,
            [styles.SingleDatePickerInput_clearDate__hide]: !displayValue,
          })}
          type="button"
          aria-label={phrases.clearDate}
          disabled={disabled}
          onClick={onClearDate}
        >
          {closeIcon}
        </button>
      )}

      {inputIconPosition === ICON_AFTER_POSITION && inputIcon}

    </div>
  );
}

SingleDatePickerInput.propTypes = propTypes;
SingleDatePickerInput.defaultProps = defaultProps;

export default withStyles(({ reactDates: { border, color } }) => ({
  SingleDatePickerInput: {
    display: 'inline-block',
    backgroundColor: color.background,
  },

  SingleDatePickerInput__withBorder: {
    borderColor: color.border,
    borderWidth: border.pickerInput.borderWidth,
    borderStyle: border.pickerInput.borderStyle,
    borderRadius: border.pickerInput.borderRadius,
  },

  SingleDatePickerInput__rtl: {
    direction: noflip('rtl'),
  },

  SingleDatePickerInput__disabled: {
    backgroundColor: color.disabled,
  },

  SingleDatePickerInput__block: {
    display: 'block',
  },

  SingleDatePickerInput__showClearDate: {
    paddingRight: 30, // TODO: should be noflip wrapped and handled by an isRTL prop
  },

  SingleDatePickerInput_clearDate: {
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

  SingleDatePickerInput_clearDate__default: {
    ':focus': {
      background: color.core.border,
      borderRadius: '50%',
    },

    ':hover': {
      background: color.core.border,
      borderRadius: '50%',
    },
  },

  SingleDatePickerInput_clearDate__small: {
    padding: 6,
  },

  SingleDatePickerInput_clearDate__hide: {
    visibility: 'hidden',
  },

  SingleDatePickerInput_clearDate_svg: {
    fill: color.core.grayLight,
    height: 12,
    width: 15,
    verticalAlign: 'middle',
  },

  SingleDatePickerInput_clearDate_svg__small: {
    height: 9,
  },

  SingleDatePickerInput_calendarIcon: {
    background: 'none',
    border: 0,
    color: 'inherit',
    font: 'inherit',
    lineHeight: 'normal',
    overflow: 'visible',

    cursor: 'pointer',
    display: 'inline-block',
    verticalAlign: 'middle',
    padding: 10,
    margin: '0 5px 0 10px', // TODO: should be noflip wrapped and handled by an isRTL prop
  },

  SingleDatePickerInput_calendarIcon_svg: {
    fill: color.core.grayLight,
    height: 15,
    width: 14,
    verticalAlign: 'middle',
  },
}), { pureComponent: typeof React.PureComponent !== 'undefined' })(SingleDatePickerInput);
