var {B,D} = require('consts')
var Box = {

}
var Box = exports.modules = {
  EAST   : 0,
  SOUTH  : 1,
  WEST   : 2,
  NORTH  : 3,
  OTHER  : 4,
  OTHER_T: 6,
  OP_MASK: 2,

  proto: {
    getType(){
      return this[0];
    },
    getData(){
      return this[1];
    },
  },
  g: {
    empty(){
      return [B.EMPTY,{}];
    },
    snake(headDirection=D.OTHER, tailDirection=D.OTHER_T){
      return [B.SNAKE,{h:headDirection, t:tailDirection}]
    },
    food(quantity){
      return [B.FOOD, {q: quantity}]
    },
    block(){
      return [B.BLOCK, {}]
    }
  }
};
