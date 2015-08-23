
export function applyDirection({x,y},d){
  switch(d){
  case D_NORTH: y-=1; break;
  case D_SOUTH: y+=1; break;
  case D_WEST: x-=1; break;
  case D_EAST: x+=1; break;
  default: break;
  }
  return {x,y};
}
