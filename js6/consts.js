exports.D = {
  EAST   : 0,
  SOUTH  : 1,
  WEST   : 2,
  NORTH  : 3,
  OTHER  : 4,
  OTHER_T: 6,
  OP_MASK: 2,
  isValidUserDirection(d){
    return 0<=d && d<4;
  }
}
exports.B = {
  EMPTY: 0,
  SNAKE: 1,
  FOOD : 2,
  BLOCK: 3,
}
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
}
exports.LOG = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5,
}
