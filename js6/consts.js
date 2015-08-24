
export var D_EAST  = 0;
export var D_SOUTH = 1;
export var D_WEST  = 2;
export var D_NORTH = 3;
export var D_OTHER = 4;
export var D_OP_MASK = 2;

export var BT_EMPTY = 0;
export var BT_SNAKE = 1;
export var D = {
  EAST   : 0,
  SOUTH  : 1,
  WEST   : 2,
  NORTH  : 3,
  OTHER  : 4,
  OTHER_T: 6,
  OP_MASK: 2,
}
export var B = {
  EMPTY: 0,
  SNAKE: 1,
  FOOD : 2,
}
export var H = {
  applyDirection({x,y},d){
    switch(d){
      case D_NORTH: y-=1; break;
      case D_SOUTH: y+=1; break;
      case D_WEST: x-=1; break;
      case D_EAST: x+=1; break;
      default: break;
    }
    return {x,y};
  }
}
