var {B,D} = require('consts')
var Box = {}
var Box = module.exports = {
  proto: {
    getType(){
      return this[0];
    },
    getData(){
      return this[1];
    },
  },
  generate: {
    empty(){
      return [B.EMPTY,{}];
    },
    snake(snakeId, headDirection=D.OTHER, tailDirection=D.OTHER_T){
      return [B.SNAKE,{h:headDirection, s:snakeId, t:tailDirection}]
    },
    food(quantity){
      return [B.FOOD, {q: quantity}]
    },
    block(){
      return [B.BLOCK, {}]
    }
  },
};
