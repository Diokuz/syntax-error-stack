const fs = require('fs')
const path = require('path')
const Module = require('module')
const chalk = require('chalk')

let singleton = false
let errors = []

const hook = ({ exclude = [] }) => {
  if (singleton === true) {
    throw new Error(`You could use ses only one time - in the root file`)
  }

  singleton = true
  let i = 1
  const excludeSet = new Set(exclude.map(f => path.resolve(f)))

  Module._extensions['.js'] = (module, filename) => {
    const stack = ['']
    let parent = module

    while (parent) {
      stack.push(parent.id)
      parent = parent.parent
    }

    const source = fs.readFileSync(filename, 'utf8')

    try {
      if (!excludeSet.has(filename)) {
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
  hook(options)

  require(absPath)

  const errors = hook.errors()

  if (!errors.length) {
    console.log('SES OK!')
  } else {
    console.log(errors.join(''))
    console.error(`Failed to 'require(${absPath})'`)
    throw new Error(`Failed to check!`)
  }
}
