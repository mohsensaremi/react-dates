import React from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import { create } from 'jss';
import rtl from 'jss-rtl';
import { StylesProvider, jssPreset } from '@material-ui/core/styles';

// Configure JSS
const jss = create({ plugins: [...jssPreset().plugins, rtl()] });

function RTL(props) {
  const {
    children,
  } = props;

  return (
    <StylesProvider jss={jss}>
      {children}
    </StylesProvider>
  );
}

RTL.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RTL;
