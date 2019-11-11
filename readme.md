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

### CLI

> it is ignoring ts, tsx, jsx and css file extensions by default

```
yarn ses examples/simple/a.js
yarn run v1.17.3
$ bin/ses.js examples/simple/a.js
entry:  /Users/d.o.kuznetsov/github/syntax-error-stack/examples/simple/a.js
filename /Users/d.o.kuznetsov/github/syntax-error-stack/examples/simple/a.js
filename /Users/d.o.kuznetsov/github/syntax-error-stack/examples/simple/b.js
Total files number:  2
Total loads:         2

Bad require chain #1
  → /Users/d.o.kuznetsov/github/syntax-error-stack/examples/simple/b.js
...
```

### JS API

> is not ignoring any extensions by default, use require-hacker or something else

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

Also, you could easily count the total number of files in your dependency tree, and list them all via CLI.
