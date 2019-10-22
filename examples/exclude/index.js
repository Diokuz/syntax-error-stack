const ses = require('../../')

ses(
  require.resolve('./excluded'),
  {
    exclude: ['./examples/exclude/excluded.js']
  }
)
