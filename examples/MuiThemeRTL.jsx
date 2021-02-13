import React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from '@material-ui/core/styles';
import RTL from './RTL';

const MuiThemeRTL = (props) => {
  const {
    children,
  } = props;

  return (
    <RTL>
      <ThemeProvider
        theme={(theme) => ({
          ...theme,
          direction: 'rtl',
        })}
      >
        {children}
      </ThemeProvider>
    </RTL>
  );
};

MuiThemeRTL.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MuiThemeRTL;
