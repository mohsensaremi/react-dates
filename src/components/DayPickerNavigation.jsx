import React from 'react';
import PropTypes from 'prop-types';
import { forbidExtraProps } from 'airbnb-prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

import { DayPickerNavigationPhrases } from '../defaultPhrases';
import getPhrasePropTypes from '../utils/getPhrasePropTypes';
import noflip from '../utils/noflip';

import LeftArrow from './LeftArrow';
import RightArrow from './RightArrow';
import ChevronUp from './ChevronUp';
import ChevronDown from './ChevronDown';
import NavPositionShape from '../shapes/NavPositionShape';
import ScrollableOrientationShape from '../shapes/ScrollableOrientationShape';

import {
  HORIZONTAL_ORIENTATION,
  NAV_POSITION_BOTTOM,
  NAV_POSITION_TOP,
  VERTICAL_SCROLLABLE,
} from '../constants';

const propTypes = forbidExtraProps({
  classes: PropTypes.object.isRequired,
  disablePrev: PropTypes.bool,
  disableNext: PropTypes.bool,
  inlineStyles: PropTypes.object,
  isRTL: PropTypes.bool,
  navPosition: NavPositionShape,
  navPrev: PropTypes.node,
  navNext: PropTypes.node,
  orientation: ScrollableOrientationShape,

  onPrevMonthClick: PropTypes.func,
  onNextMonthClick: PropTypes.func,

  // internationalization
  phrases: PropTypes.shape(getPhrasePropTypes(DayPickerNavigationPhrases)),

  renderNavPrevButton: PropTypes.func,
  renderNavNextButton: PropTypes.func,
  showNavPrevButton: PropTypes.bool,
  showNavNextButton: PropTypes.bool,
});

const defaultProps = {
  disablePrev: false,
  disableNext: false,
  inlineStyles: null,
  isRTL: false,
  navPosition: NAV_POSITION_TOP,
  navPrev: null,
  navNext: null,
  orientation: HORIZONTAL_ORIENTATION,

  onPrevMonthClick() {
  },
  onNextMonthClick() {
  },

  // internationalization
  phrases: DayPickerNavigationPhrases,

  renderNavPrevButton: null,
  renderNavNextButton: null,
  showNavPrevButton: true,
  showNavNextButton: true,
};

class DayPickerNavigation extends React.PureComponent {
  render() {
    const {
      inlineStyles,
      isRTL,
      disablePrev,
      disableNext,
      navPosition,
      navPrev,
      navNext,
      onPrevMonthClick,
      onNextMonthClick,
      orientation,
      phrases,
      renderNavPrevButton,
      renderNavNextButton,
      showNavPrevButton,
      showNavNextButton,
      classes: styles,
    } = this.props;

    if (!showNavNextButton && !showNavPrevButton) {
      return null;
    }

    const isHorizontal = orientation === HORIZONTAL_ORIENTATION;
    const isVertical = orientation !== HORIZONTAL_ORIENTATION;
    const isVerticalScrollable = orientation === VERTICAL_SCROLLABLE;
    const isBottomNavPosition = navPosition === NAV_POSITION_BOTTOM;
    const hasInlineStyles = !!inlineStyles;

    let navPrevIcon = navPrev;
    let navNextIcon = navNext;
    let isDefaultNavPrev = false;
    let isDefaultNavNext = false;
    let navPrevTabIndex = {};
    let navNextTabIndex = {};

    if (!navPrevIcon && !renderNavPrevButton && showNavPrevButton) {
      navPrevTabIndex = { tabIndex: '0' };
      isDefaultNavPrev = true;
      let Icon = isVertical ? ChevronUp : LeftArrow;
      if (isRTL && !isVertical) {
        Icon = RightArrow;
      }
      navPrevIcon = (
        <Icon
          className={clsx({
            [styles.DayPickerNavigation_svg__horizontal]: isHorizontal,
            [styles.DayPickerNavigation_svg__vertical]: isVertical,
            [styles.DayPickerNavigation_svg__disabled]: disablePrev,
          })}
        />
      );
    }

    if (!navNextIcon && !renderNavNextButton && showNavNextButton) {
      navNextTabIndex = { tabIndex: '0' };
      isDefaultNavNext = true;
      let Icon = isVertical ? ChevronDown : RightArrow;
      if (isRTL && !isVertical) {
        Icon = LeftArrow;
      }
      navNextIcon = (
        <Icon
          className={clsx({
            [styles.DayPickerNavigation_svg__horizontal]: isHorizontal,
            [styles.DayPickerNavigation_svg__vertical]: isVertical,
            [styles.DayPickerNavigation_svg__disabled]: disableNext,
          })}
        />
      );
    }

    const isDefaultNav = isDefaultNavNext || isDefaultNavPrev;

    return (
      <div
        className={clsx(styles.DayPickerNavigation, {
          [styles.DayPickerNavigation__horizontal]: isHorizontal,
          [styles.DayPickerNavigation__vertical]: isVertical,
          [styles.DayPickerNavigation__verticalDefault]: isVertical && isDefaultNav,
          [styles.DayPickerNavigation__verticalScrollable]: isVerticalScrollable,
          [styles.DayPickerNavigation__verticalScrollableDefault]: isVerticalScrollable && isDefaultNav,
          [styles.DayPickerNavigation__verticalScrollable_prevNav]: isVerticalScrollable && showNavPrevButton,
          [styles.DayPickerNavigation__bottom]: isBottomNavPosition,
          [styles.DayPickerNavigation__bottomDefault]: isBottomNavPosition && isDefaultNav,
        })}
        style={{
          ...(hasInlineStyles && inlineStyles),
        }}
      >
        {showNavPrevButton
        && (renderNavPrevButton ? (
          renderNavPrevButton({
            ariaLabel: phrases.jumpToPrevMonth,
            disabled: disablePrev,
            onClick: disablePrev ? undefined : onPrevMonthClick,
            onKeyUp: disablePrev ? undefined : (e) => {
              const { key } = e;
              if (key === 'Enter' || key === ' ') {
                onPrevMonthClick(e);
              }
            },
            onMouseUp: disablePrev ? undefined : (e) => {
              e.currentTarget.blur();
            },
          })
        ) : (
          <div // eslint-disable-line jsx-a11y/interactive-supports-focus
            role="button"
            {...navPrevTabIndex}
            className={clsx(styles.DayPickerNavigation_button, {
              [styles.DayPickerNavigation_button__default]: isDefaultNavPrev,
              [styles.DayPickerNavigation_button__disabled]: disablePrev,
              [styles.DayPickerNavigation_button__horizontal]: isHorizontal,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_button__horizontalDefault]: isHorizontal && isDefaultNavPrev,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_bottomButton__horizontalDefault]: isHorizontal && isDefaultNavPrev && isBottomNavPosition,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_leftButton__horizontalDefault]: isHorizontal && isDefaultNavPrev && !isRTL,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_rightButton__horizontalDefault]: isHorizontal && isDefaultNavPrev && isRTL,
              [styles.DayPickerNavigation_button__vertical]: isVertical,
              [styles.DayPickerNavigation_button__verticalDefault]: isVertical && isDefaultNavPrev,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_prevButton__verticalDefault]: isVertical && isDefaultNavPrev,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_prevButton__verticalScrollableDefault]: isVertical && isDefaultNavPrev && isVerticalScrollable,
            })}
            aria-disabled={disablePrev ? true : undefined}
            aria-label={phrases.jumpToPrevMonth}
            onClick={disablePrev ? undefined : onPrevMonthClick}
            onKeyUp={disablePrev ? undefined : (e) => {
              const { key } = e;
              if (key === 'Enter' || key === ' ') {
                onPrevMonthClick(e);
              }
            }}
            onMouseUp={disablePrev ? undefined : (e) => {
              e.currentTarget.blur();
            }}
          >
            {navPrevIcon}
          </div>
        ))}

        {showNavNextButton
        && (renderNavNextButton ? (
          renderNavNextButton({
            ariaLabel: phrases.jumpToNextMonth,
            disabled: disableNext,
            onClick: disableNext ? undefined : onNextMonthClick,
            onKeyUp: disableNext ? undefined : (e) => {
              const { key } = e;
              if (key === 'Enter' || key === ' ') {
                onNextMonthClick(e);
              }
            },
            onMouseUp: disableNext ? undefined : (e) => {
              e.currentTarget.blur();
            },
          })
        ) : (
          <div // eslint-disable-line jsx-a11y/interactive-supports-focus
            role="button"
            {...navNextTabIndex}
            className={clsx(styles.DayPickerNavigation_button, {
              [styles.DayPickerNavigation_button__default]: isDefaultNavNext,
              [styles.DayPickerNavigation_button__disabled]: disableNext,
              [styles.DayPickerNavigation_button__horizontal]: isHorizontal,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_button__horizontalDefault]: isHorizontal && isDefaultNavNext,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_bottomButton__horizontalDefault]: isHorizontal && isDefaultNavNext && isBottomNavPosition,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_leftButton__horizontalDefault]: isHorizontal && isDefaultNavNext && isRTL,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_rightButton__horizontalDefault]: isHorizontal && isDefaultNavNext && !isRTL,
              [styles.DayPickerNavigation_button__vertical]: isVertical,
              [styles.DayPickerNavigation_button__verticalDefault]: isVertical && isDefaultNavNext,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_nextButton__verticalDefault]: isVertical && isDefaultNavNext,
              // eslint-disable-next-line max-len
              [styles.DayPickerNavigation_nextButton__verticalScrollableDefault]: isVertical && isDefaultNavNext && isVerticalScrollable,
            })}
            aria-disabled={disableNext ? true : undefined}
            aria-label={phrases.jumpToNextMonth}
            onClick={disableNext ? undefined : onNextMonthClick}
            onKeyUp={disableNext ? undefined : (e) => {
              const { key } = e;
              if (key === 'Enter' || key === ' ') {
                onNextMonthClick(e);
              }
            }}
            onMouseUp={disableNext ? undefined : (e) => {
              e.currentTarget.blur();
            }}
          >
            {navNextIcon}
          </div>
        ))}
      </div>
    );
  }
}

DayPickerNavigation.propTypes = propTypes;
DayPickerNavigation.defaultProps = defaultProps;

export default withStyles(({ reactDates: { color, zIndex } }) => ({
  DayPickerNavigation: {
    position: 'relative',
    zIndex: zIndex + 2,
  },

  DayPickerNavigation__horizontal: {
    height: 0,
  },

  DayPickerNavigation__vertical: {},
  DayPickerNavigation__verticalScrollable: {},
  DayPickerNavigation__verticalScrollable_prevNav: {
    zIndex: zIndex + 1, // zIndex + 2 causes the button to show on top of the day of week headers
  },

  DayPickerNavigation__verticalDefault: {
    position: 'absolute',
    width: '100%',
    height: 52,
    bottom: 0,
    left: noflip(0),
  },

  DayPickerNavigation__verticalScrollableDefault: {
    position: 'relative',
  },

  DayPickerNavigation__bottom: {
    height: 'auto',
  },

  DayPickerNavigation__bottomDefault: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  DayPickerNavigation_button: {
    cursor: 'pointer',
    userSelect: 'none',
    border: 0,
    padding: 0,
    margin: 0,
  },

  DayPickerNavigation_button__default: {
    border: `1px solid ${color.core.borderLight}`,
    backgroundColor: color.background,
    color: color.placeholderText,

    ':focus': {
      border: `1px solid ${color.core.borderMedium}`,
    },

    ':hover': {
      border: `1px solid ${color.core.borderMedium}`,
    },

    ':active': {
      background: color.backgroundDark,
    },
  },

  DayPickerNavigation_button__disabled: {
    cursor: 'default',
    border: `1px solid ${color.disabled}`,

    ':focus': {
      border: `1px solid ${color.disabled}`,
    },

    ':hover': {
      border: `1px solid ${color.disabled}`,
    },

    ':active': {
      background: 'none',
    },
  },

  DayPickerNavigation_button__horizontal: {},

  DayPickerNavigation_button__horizontalDefault: {
    position: 'absolute',
    top: 18,
    lineHeight: 0.78,
    borderRadius: 3,
    padding: '6px 9px',
  },

  DayPickerNavigation_bottomButton__horizontalDefault: {
    position: 'static',
    marginLeft: 22,
    marginRight: 22,
    marginBottom: 30,
    marginTop: -10,
  },

  DayPickerNavigation_leftButton__horizontalDefault: {
    left: noflip(22),
  },

  DayPickerNavigation_rightButton__horizontalDefault: {
    right: noflip(22),
  },

  DayPickerNavigation_button__vertical: {},

  DayPickerNavigation_button__verticalDefault: {
    padding: 5,
    background: color.background,
    boxShadow: noflip('0 0 5px 2px rgba(0, 0, 0, 0.1)'),
    position: 'relative',
    display: 'inline-block',
    textAlign: 'center',
    height: '100%',
    width: '50%',
  },

  DayPickerNavigation_prevButton__verticalDefault: {},

  DayPickerNavigation_nextButton__verticalDefault: {
    borderLeft: noflip(0),
  },

  DayPickerNavigation_nextButton__verticalScrollableDefault: {
    width: '100%',
  },

  DayPickerNavigation_prevButton__verticalScrollableDefault: {
    width: '100%',
  },

  DayPickerNavigation_svg__horizontal: {
    height: 19,
    width: 19,
    fill: color.core.grayLight,
    display: 'block',
  },

  DayPickerNavigation_svg__vertical: {
    height: 42,
    width: 42,
    fill: color.text,
  },

  DayPickerNavigation_svg__disabled: {
    fill: color.disabled,
  },
}), { pureComponent: typeof React.PureComponent !== 'undefined' })(DayPickerNavigation);
