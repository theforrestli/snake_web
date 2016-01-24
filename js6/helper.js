module.exports = {
  get(object, key){
    (!_.contains(Object.keys(object), key)){
      return undefined;
    }
    return object[key];
  }
};
