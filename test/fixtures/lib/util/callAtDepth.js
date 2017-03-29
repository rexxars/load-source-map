"use strict";

module.exports = function callAtDepth(depth, fn) {
  var current = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (current < depth) {
    return callAtDepth(depth, fn, current + 1);
  }

  return fn();
};
//# sourceMappingURL=callAtDepth.js.map