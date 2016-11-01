var JSNES_Utils = {}

JSNES_Utils.copyArrayElements = function (src, srcPos, dest, destPos, length) {
  for (var i = 0; i < length; ++i) {
    dest[destPos + i] = src[srcPos + i]
  }
}

JSNES_Utils.copyArray = function (src) {
  var dest = new Array(src.length)
  for (var i = 0; i < src.length; i++) {
    dest[i] = src[i]
  }
  return dest
}

JSNES_Utils.fromJSON = function (obj, state) {
  for (var i = 0; i < obj.JSON_PROPERTIES.length; i++) {
    obj[obj.JSON_PROPERTIES[i]] = state[obj.JSON_PROPERTIES[i]]
  }
}

JSNES_Utils.toJSON = function (obj) {
  var state = {}
  for (var i = 0; i < obj.JSON_PROPERTIES.length; i++) {
    state[obj.JSON_PROPERTIES[i]] = obj[obj.JSON_PROPERTIES[i]]
  }
  return state
}

JSNES_Utils.isIE = function () {
  return (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent))
}

module.exports = JSNES_Utils
