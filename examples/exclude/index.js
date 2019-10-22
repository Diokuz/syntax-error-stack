const ses = require('../../')

ses(
  require.resolve('./entry'),
  {
    exclude: ['**/examples/exclude/x-*']
  }
)
