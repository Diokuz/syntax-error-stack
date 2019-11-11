#!/usr/bin/env node

const path = require('path')
const Module = require('module')
const ses = require('..')

const noop = () => null

Module._extensions['.ts'] = noop
Module._extensions['.tsx'] = noop
Module._extensions['.jsx'] = noop
Module._extensions['.css'] = noop

ses(require.resolve(path.resolve(process.cwd(), process.argv[2])), {
  verbose: true,
})
