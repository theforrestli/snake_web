var D_EAST  = 0;
var D_SOUTH = 1;
var D_WEST  = 2;
var D_NORTH = 3;
var D_OTHER = 4;
var D_OP_MASK = 2;

var BT_EMPTY = 0;
var BT_SNAKE = 1;
exports.D = {
  EAST   : 0,
  SOUTH  : 1,
  WEST   : 2,
  NORTH  : 3,
  OTHER  : 4,
  OTHER_T: 6,
  OP_MASK: 2,
};
exports.B = {
  EMPTY: 0,
  SNAKE: 1,
  FOOD : 2,
  BLOCK: 3,
};
exports.H = {
  applyDirection({x,y},d){
    switch(d){
      case D_NORTH: y-=1; break;
      case D_SOUTH: y+=1; break;
      case D_WEST: x-=1; break;
      case D_EAST: x+=1; break;
      default: break;
    }
    return {x,y};
  },
  cloneBox(b){
    return [b[0],$.extend({},b[1])];
  }
};
