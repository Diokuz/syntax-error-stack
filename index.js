const fs = require('fs')
const path = require('path')
const Module = require('module')
const chalk = require('chalk')
const minimatch = require('minimatch')

let singleton = false
let errors = []
let loads = 0
const filesSet = new Set()

const hook = ({ exclude = [], verbose = false }) => {
  if (singleton === true) {
    throw new Error(`You could use ses only one time - in the root file`)
  }

  singleton = true
  let i = 1
  const absExclude = exclude.map(e => path.join(process.cwd(), e))

  Module._extensions['.js'] = (module, filename) => {
    if (verbose) {
      console.log('filename', filename)
    }

    filesSet.add(filename)
    const stack = ['']
    let parent = module
    loads++

    while (parent) {
      stack.push(parent.id)
      parent = parent.parent
    }

    const realAbsPath = fs.realpathSync(path.resolve(filename))
    const source = fs.readFileSync(realAbsPath, 'utf8')
    const isExcluded = absExclude.find(ex => minimatch(realAbsPath, ex))

    try {
      if (!isExcluded) {
        module._compile(source, filename)
      }
    } catch (e) {
      // Only first three lines, we dont need stacktrace with `cjs/loader.js:721:30`-like filenames
      const originErr = e.stack.split('\n').slice(0, 3).join('\n')

      errors.push(
        chalk.red(`\nBad require chain #${i++}`) +
        chalk.blue(stack.join('\n  → ') + '\n\n') +
        chalk.grey(originErr) + '\n'
      )

      delete require.cache[filename]
    }
  }
}

hook.errors = () => errors

module.exports = (absPath, options = {}) => {
  if (options.verbose) {
    console.log('entry: ', absPath)
  }

  hook(options)

  require(absPath)

  const errors = hook.errors()

  console.log('Total files number: ', filesSet.size)
  console.log('Total loads:        ', loads)

  if (!errors.length) {
    console.log('SES OK!')
  } else {
    console.log(errors.join(''))
    console.error(`Failed to 'require(${absPath})'`)
    throw new Error(`Failed to check!`)
  }
}
