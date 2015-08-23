"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _constsJs = require('./consts.js');

var C = _interopRequireWildcard(_constsJs);

exports["default"] = function (param) {
  var size = param.width * param.height;
  var grid = [];
  for (var t = 0; t < size; t++) {
    grid[t] = [C.BT_EMPTY, {}];
  }
  var game = {
    "version": 1,
    "width": param.width,
    "height": param.height,
    "grid": grid,
    "snakes": []
  };
  return { game: game };
};

module.exports = exports["default"];
//# sourceMappingURL=map.js.map