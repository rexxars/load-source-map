module.exports = function callAtDepth (depth, fn, current = 0) {
  if (current < depth) {
    return callAtDepth(depth, fn, current + 1)
  }

  return fn()
}
