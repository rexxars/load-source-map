# load-source-map

[![Version npm](http://img.shields.io/npm/v/load-source-map.svg?style=flat-square)](https://www.npmjs.com/package/load-source-map)

Given a source file location, will load any referenced (or inline) source map.  
Result is a [SourceMapConsumer](https://github.com/mozilla/source-map#sourcemapconsumer).

## Installation

```bash
$ npm install --save load-source-map
```

## Usage

```js
var loadSourceMap = require('load-source-map')

loadSourceMap(__filename, function (err, sourcemap) {
  if (err) {
    throw err
  }

  if (!sourcemap) {
    // No source map found
    return
  }

  console.log(sourcemap.originalPositionFor({
    line: 3,
    column: 10,
  }))

  // { source: 'some-file.js',
  //   line: 2,
  //   column: 2,
  //   name: null }
})
```

## License

MIT-licensed. See LICENSE.
