import React from 'react';
import PropTypes from 'prop-types';
import { forbidExtraProps, nonNegativeInteger } from 'airbnb-prop-types';
import throttle from 'lodash/throttle';
import TextField from '@material-ui/core/TextField';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

import isTouchDevice from 'is-touch-device';
import noflip from '../utils/noflip';
import getInputHeight from '../utils/getInputHeight';
import openDirectionShape from '../shapes/OpenDirectionShape';

import {
  OPEN_DOWN,
  OPEN_UP,
  FANG_HEIGHT_PX,
  FANG_WIDTH_PX,
  DEFAULT_VERTICAL_SPACING,
  MODIFIER_KEY_NAMES,
} from '../constants';

const FANG_PATH_TOP = `M0,${FANG_HEIGHT_PX} ${FANG_WIDTH_PX},${FANG_HEIGHT_PX} ${FANG_WIDTH_PX / 2},0z`;
const FANG_STROKE_TOP = `M0,${FANG_HEIGHT_PX} ${FANG_WIDTH_PX / 2},0 ${FANG_WIDTH_PX},${FANG_HEIGHT_PX}`;
const FANG_PATH_BOTTOM = `M0,0 ${FANG_WIDTH_PX},0 ${FANG_WIDTH_PX / 2},${FANG_HEIGHT_PX}z`;
const FANG_STROKE_BOTTOM = `M0,0 ${FANG_WIDTH_PX / 2},${FANG_HEIGHT_PX} ${FANG_WIDTH_PX},0`;

const propTypes = forbidExtraProps({
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  displayValue: PropTypes.string,
  ariaLabel: PropTypes.string,
  titleText: PropTypes.string,
  screenReaderMessage: PropTypes.string,
  focused: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  openDirection: openDirectionShape,
  showCaret: PropTypes.bool,
  verticalSpacing: nonNegativeInteger,
  small: PropTypes.bool,
  block: PropTypes.bool,
  regular: PropTypes.bool,

  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDownShiftTab: PropTypes.func,
  onKeyDownTab: PropTypes.func,

  onKeyDownArrowDown: PropTypes.func,
  onKeyDownQuestionMark: PropTypes.func,

  // accessibility
  isFocused: PropTypes.bool, // describes actual DOM focus

  isStartDate: PropTypes.bool,
  isEndDate: PropTypes.bool,
  startAdornment: PropTypes.node,
  endAdornment: PropTypes.node,
});

const defaultProps = {
  placeholder: 'Select Date',
  label: undefined,
  displayValue: '',
  ariaLabel: undefined,
  titleText: undefined,
  screenReaderMessage: '',
  focused: false,
  disabled: false,
  required: false,
  readOnly: null,
  openDirection: OPEN_DOWN,
  showCaret: false,
  verticalSpacing: DEFAULT_VERTICAL_SPACING,
  small: false,
  block: false,
  regular: false,

  onChange() {
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

  // accessibility
  isFocused: false,

  isStartDate: false,
  isEndDate: false,
  startAdornment: undefined,
  endAdornment: undefined,
};

class DateInput extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dateString: '',
      isTouchDevice: false,
    };

    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.setInputRef = this.setInputRef.bind(this);
    this.throttledKeyDown = throttle(this.onFinalKeyDown, 300, { trailing: false });
  }

  componentDidMount() {
    this.setState({ isTouchDevice: isTouchDevice() });
  }

  componentWillReceiveProps(nextProps) {
    const { dateString } = this.state;
    if (dateString && nextProps.displayValue) {
      this.setState({
        dateString: '',
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { focused, isFocused } = this.props;
    if (prevProps.focused === focused && prevProps.isFocused === isFocused) return;

    if (focused && isFocused) {
      this.inputRef.focus();
    }
  }

  onChange(e) {
    const { onChange, onKeyDownQuestionMark } = this.props;
    const dateString = e.target.value;

    // In Safari, onKeyDown does not consistently fire ahead of onChange. As a result, we need to
    // special case the `?` key so that it always triggers the appropriate callback, instead of
    // modifying the input value
    if (dateString[dateString.length - 1] === '?') {
      onKeyDownQuestionMark(e);
    } else {
      this.setState({ dateString }, () => onChange(dateString));
    }
  }

  onKeyDown(e) {
    e.stopPropagation();
    if (!MODIFIER_KEY_NAMES.has(e.key)) {
      this.throttledKeyDown(e);
    }
  }

  onFinalKeyDown(e) {
    const {
      onKeyDownShiftTab,
      onKeyDownTab,
      onKeyDownArrowDown,
      onKeyDownQuestionMark,
    } = this.props;
    const { key } = e;

    if (key === 'Tab') {
      if (e.shiftKey) {
        onKeyDownShiftTab(e);
      } else {
        onKeyDownTab(e);
      }
    } else if (key === 'ArrowDown') {
      onKeyDownArrowDown(e);
    } else if (key === '?') {
      e.preventDefault();
      onKeyDownQuestionMark(e);
    }
  }

  setInputRef(ref) {
    this.inputRef = ref;
  }

  render() {
    const {
      dateString,
      isTouchDevice: isTouch,
    } = this.state;
    const {
      id,
      placeholder,
      label,
      ariaLabel,
      titleText,
      displayValue,
      screenReaderMessage,
      focused,
      showCaret,
      onFocus,
      disabled,
      required,
      readOnly,
      openDirection,
      verticalSpacing,
      small,
      regular,
      block,
      classes: styles,
      theme: { reactDates },
      isStartDate,
      isEndDate,
      startAdornment,
      endAdornment,
    } = this.props;

    const value = dateString || displayValue || '';
    const screenReaderMessageId = `DateInput__screen-reader-message-${id}`;

    const withFang = showCaret && focused;

    const inputHeight = getInputHeight(reactDates, small);

    return (
      <div
        className={clsx(styles.DateInput, {
          [styles.DateInput__small]: small,
          [styles.DateInput__block]: block,
          [styles.DateInput__withFang]: withFang,
          [styles.DateInput__disabled]: disabled,
          [styles.DateInput__openDown]: withFang && openDirection === OPEN_DOWN,
          [styles.DateInput__openUp]: withFang && openDirection === OPEN_UP,
        })}
      >
        <TextField
          className={clsx(styles.DateInput_textField, {
            [styles.DateInput_textField__small]: small,
            [styles.DateInput_textField__regular]: regular,
            [styles.DateInput_textField__readOnly]: readOnly,
            [styles.DateInput_textField__focused]: focused,
            [styles.DateInput_textField__disabled]: disabled,
          })}
          InputProps={{
            className: clsx(styles.DateInput_input, {
              [styles.DateInput_input__small]: small,
              [styles.DateInput_input__regular]: regular,
              [styles.DateInput_input__readOnly]: readOnly,
              [styles.DateInput_input__focused]: focused,
              [styles.DateInput_input__disabled]: disabled,
              [styles.DateInput_input__isStartDate]: isStartDate,
              [styles.DateInput_input__isEndDate]: isEndDate,
            }),
            ref: this.setInputRef,
            name: id,
            onKeyDown: this.onKeyDown,
            onFocus,
            readOnly: typeof readOnly === 'boolean' ? readOnly : isTouch,
            startAdornment,
            endAdornment,
            inputProps: {
              'aria-label': ariaLabel === undefined ? placeholder : ariaLabel,
              'aria-describedby': screenReaderMessage && screenReaderMessageId,
              autoComplete: 'off',
              title: titleText,
            },
          }}
          focused={focused}
          id={id}
          value={value}
          onChange={this.onChange}
          label={label}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          variant="outlined"
          fullWidth
        />

        {withFang && (
          <svg
            role="presentation"
            focusable="false"
            className={styles.DateInput_fang}
            style={{
              ...(openDirection === OPEN_DOWN && {
                top: inputHeight + verticalSpacing - FANG_HEIGHT_PX - 1,
              }),
              ...(openDirection === OPEN_UP && {
                bottom: inputHeight + verticalSpacing - FANG_HEIGHT_PX - 1,
              }),
            }}
          >
            <path
              className={styles.DateInput_fangShape}
              d={openDirection === OPEN_DOWN ? FANG_PATH_TOP : FANG_PATH_BOTTOM}
            />
            <path
              className={styles.DateInput_fangStroke}
              d={openDirection === OPEN_DOWN ? FANG_STROKE_TOP : FANG_STROKE_BOTTOM}
            />
          </svg>
        )}

        {screenReaderMessage && (
          <p className={styles.DateInput_screenReaderMessage} id={screenReaderMessageId}>
            {screenReaderMessage}
          </p>
        )}
      </div>
    );
  }
}

DateInput.propTypes = propTypes;
DateInput.defaultProps = defaultProps;

export default withStyles(({
  reactDates: {
    color, sizing, spacing, font, zIndex,
  },
}) => ({
  DateInput: {
    margin: 0,
    padding: spacing.inputPadding,
    background: color.background,
    position: 'relative',
    display: 'inline-block',
    width: sizing.inputWidth,
    verticalAlign: 'middle',
  },

  DateInput__small: {
    width: sizing.inputWidth_small,
  },

  DateInput__block: {
    width: '100%',
  },

  DateInput__disabled: {
    background: color.disabled,
    color: color.textDisabled,
  },

  DateInput_textField: {},

  DateInput_textField__small: {},

  DateInput_textField__regular: {},

  DateInput_textField__readOnly: {},

  DateInput_textField__focused: {},

  DateInput_textField__disabled: {},

  DateInput_input: {},

  DateInput_input__small: {
    fontSize: font.input.size_small,
    lineHeight: font.input.lineHeight_small,
    letterSpacing: font.input.letterSpacing_small,
    padding: `${spacing.displayTextPaddingVertical_small}px ${spacing.displayTextPaddingHorizontal_small}px`,
    paddingTop: spacing.displayTextPaddingTop_small,
    paddingBottom: spacing.displayTextPaddingBottom_small,
    paddingLeft: noflip(spacing.displayTextPaddingLeft_small),
    paddingRight: noflip(spacing.displayTextPaddingRight_small),
  },

  DateInput_input__regular: {
    fontWeight: 'auto',
  },

  DateInput_input__readOnly: {
    userSelect: 'none',
  },

  DateInput_input__focused: {
    background: color.backgroundFocused,
  },

  DateInput_input__disabled: {
    background: color.disabled,
    fontStyle: font.input.styleDisabled,
  },

  DateInput_input__isStartDate: {
    '& > fieldset': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderRight: 'none',
    },
  },

  DateInput_input__isEndDate: {
    '& > fieldset': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderLeft: 'none',
    },
  },

  DateInput_screenReaderMessage: {
    border: 0,
    clip: 'rect(0, 0, 0, 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: 1,
  },

  DateInput_fang: {
    position: 'absolute',
    width: FANG_WIDTH_PX,
    height: FANG_HEIGHT_PX,
    left: 22, // TODO: should be noflip wrapped and handled by an isRTL prop
    zIndex: zIndex + 2,
  },

  DateInput_fangShape: {
    fill: color.background,
  },

  DateInput_fangStroke: {
    stroke: color.core.border,
    fill: 'transparent',
  },
}), {
  pureComponent: typeof React.PureComponent !== 'undefined',
  withTheme: true,
})(DateInput);
