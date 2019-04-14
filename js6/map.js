var {B} = require('consts');

module.exports = function(param){
  var size=param.width * param.height;
  var grid = [];
  for(var t=0;t<size;t++){
    grid[t]=[B.EMPTY,{}];
  }
  for(var t=0;t<param.width;t++) {
    grid[t] = [B.BLOCK, {}]
    grid[size-1-t] = [B.BLOCK, {}]
  }
  for(var t=0;t<param.height;t++) {
    grid[t*param.width] = [B.BLOCK, {}]
    grid[size-1-t*param.width] = [B.BLOCK, {}]
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
