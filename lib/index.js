'use strict'

var fs = require('fs')
var path = require('path')
var debug = require('debug')
var semver = require('semver')
var SourceMapConsumer = require('source-map').SourceMapConsumer

var log = debug('load-source-map')
var INLINE_SOURCEMAP_REGEX = /^data:application\/json[^,]+base64,/
var SOURCEMAP_REGEX = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^*]+?)[ \t]*(?:\*\/)[ \t]*$)/
var READ_FILE_OPTS = semver.lt(process.version, '0.9.11') ? 'utf8' : {encoding: 'utf8'}

module.exports = function readSourceMap (filename, cb) {
  fs.readFile(filename, READ_FILE_OPTS, function (err, sourceFile) {
    if (err) {
      return cb(err)
    }

    // Look for a sourcemap URL
    var sourceMapUrl = resolveSourceMapUrl(sourceFile, path.dirname(filename))
    if (!sourceMapUrl) {
      log('File "%s" does not contain a sourcemap URL, skipping', filename)
      return cb()
    }

    // If it's an inline map, decode it and pass it through the same consumer factory
    if (isInlineMap(sourceMapUrl)) {
      log('File %s contains an inline sourcemap, attempting to decode', filename)
      return onMapRead(null, decodeInlineMap(sourceMapUrl))
    }

    // Load actual source map from given path
    log('File %s contains an external sourcemap, attempting to read it', filename)
    fs.readFile(sourceMapUrl, READ_FILE_OPTS, onMapRead)

    function onMapRead (readErr, sourceMap) {
      if (readErr) {
        log('Error reading sourcemap "%s", referenced from "%s": %s', sourceMapUrl, filename, readErr.message)
        readErr.message = 'Error reading sourcemap for file "' + filename + '":\n' + readErr.message
        return cb(readErr)
      }

      var consumer
      try {
        consumer = new SourceMapConsumer(sourceMap)
      } catch (parseErr) {
        log('Error parsing sourcemap "%s", referenced from "%s": %s', sourceMapUrl, filename, parseErr.message)
        parseErr.message = 'Error parsing sourcemap for file "' + filename + '":\n' + parseErr.message
        return cb(parseErr)
      }

      return cb(null, consumer)
    }
  })
}

function resolveSourceMapUrl (sourceFile, sourcePath) {
  var lines = sourceFile.split(/\r?\n/)
  var sourceMapUrl = null
  for (var i = lines.length - 1; i >= 0 && !sourceMapUrl; i--) {
    sourceMapUrl = lines[i].match(SOURCEMAP_REGEX)
  }

  if (!sourceMapUrl) {
    return null
  }

  return isInlineMap(sourceMapUrl[1])
    ? sourceMapUrl[1]
    : path.resolve(sourcePath, sourceMapUrl[1])
}

function isInlineMap (url) {
  return INLINE_SOURCEMAP_REGEX.test(url)
}

function decodeInlineMap (data) {
  var rawData = data.slice(data.indexOf(',') + 1)
  return new Buffer(rawData, 'base64').toString()
}
