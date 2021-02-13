import DefaultTheme from '../../src/theme/DefaultTheme';

const createMuiTheme = require('@material-ui/core/styles/createMuiTheme');
const muiDefaultTheme = createMuiTheme.default();

import sinon from 'sinon-sandbox';

sinon.stub(createMuiTheme, 'default')
  .returns({
    ...muiDefaultTheme,
    reactDates: DefaultTheme.reactDates,
  });
