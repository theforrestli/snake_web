var {B} = require('consts');

module.exports = function(param){
  var size=param.width * param.height;
  var grid = [];
  for(var t=0;t<size;t++){
    grid[t]=[B.EMPTY,{}];
  }
  var game = {
    version:1,
    config: {
      startRemain: 5,
    },
    seed: {
      x: 1,
      y: 2,
      z: 3,
      w: 4,
    },
    width: param.width,
    height: param.height,
    grid: grid,
    snakes: [],
    tick: 0,
  };
  return {game};
};
