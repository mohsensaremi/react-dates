import React from 'react';
import PropTypes from 'prop-types';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import defaultTheme from '../src/theme/DefaultTheme';

const theme = createMuiTheme({
  reactDates: defaultTheme.reactDates,
});

const MuiTheme = (props) => {
  const {
    children,
  } = props;

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

MuiTheme.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MuiTheme;
