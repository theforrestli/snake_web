"use strict";

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _testJs = require("./test.js");

var math = _interopRequireWildcard(_testJs);

console.log("2π = " + math.sum(math.pi, math.pi));
//# sourceMappingURL=main.js.map