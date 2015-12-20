var Position = {
  EAST   : 0,
  SOUTH  : 1,
  WEST   : 2,
  NORTH  : 3,
  OTHER  : 4,
  OTHER_T: 6,
  MOVABLES: [0,1,2,3],
  next({x,y}, direction){
    let dp = {
      [Position.EAST]: {x:1,y:0},
      [Position.SOUTH]: {x:0,y:1},
      [Position.WEST]: {x:-1,y:0},
      [Position.NORTH]: {x:0,y:-1},
    }[direction] || {x: null, y: null};
    return {x: x+dp.x, y: y+dp.y};
  }
}
