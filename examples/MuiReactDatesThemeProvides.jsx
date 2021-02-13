import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import defaultTheme from '../src/theme/DefaultTheme';

const theme = createMuiTheme({
  reactDates: defaultTheme.reactDates,
});

const propTypes = {
  children: PropTypes.node.isRequired,
};

const MuiReactDatesThemeProvides = (props) => {
  const {
    children,
  } = props;

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

MuiReactDatesThemeProvides.propTypes = propTypes;

export default MuiReactDatesThemeProvides;
