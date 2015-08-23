"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyDirection = applyDirection;

function applyDirection(_ref, d) {
  var x = _ref.x;
  var y = _ref.y;

  switch (d) {
    case D_NORTH:
      y -= 1;break;
    case D_SOUTH:
      y += 1;break;
    case D_WEST:
      x -= 1;break;
    case D_EAST:
      x += 1;break;
    default:
      break;
  }
  return { x: x, y: y };
}
//# sourceMappingURL=helper.js.map