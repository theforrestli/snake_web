exports.B = {
  EAST   : 0,
  SOUTH  : 1,
  WEST   : 2,
  NORTH  : 3,
  OTHER  : 4,
  OTHER_T: 6,
  OP_MASK: 2,

  setTD(box,type,data){
    box[0] = type;
    box[1] = data;
  },
  getT(box){
    return box[0];
  },
  getD(box){
    return box[1];
  }
};
