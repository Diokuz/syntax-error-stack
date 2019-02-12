Just better syntax error log for nodejs.

## Example

a.js

```js
require('./b')
```

b.js

```js
! some invalid js, await async yield debugger
```

index.js

```js
const ses = require('syntax-error-stack')

ses(require.resolve('./a'))
```

The result log will be:

```
$ node examples/simple/index.js

Bad require chain #1
  → /Users/xxx/github/syntax-error-stack/examples/simple/b.js
  → /Users/xxx/github/syntax-error-stack/examples/simple/a.js
  → /Users/xxx/github/syntax-error-stack/index.js
  → .

/Users/xxx/github/syntax-error-stack/examples/simple/b.js:1
(function (exports, require, module, __filename, __dirname) { ! some invalid js, await async yield debugger
                                                                     ^^^^^^^
```

## Explanation

You can have a huge dependency tree, and only one bad file. It is important to extract not only filename, but full require chain.

`syntax-error-stack` uses non-stable API `Module._compile` and `Module._extensions` – same is used in `require-hacker` module. So, each js-file require is actually wrapped with custom function, which, in case of compile problems, stores errors and full require chains for log.

See `/index.js` for details – it is not too big/hard to read and understand.
