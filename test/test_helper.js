
module.exports = {
  validateNonNegativeInteger(value){
    expect(value).to.be.within(0,Infinity);
    expect(value).to.eql(Math.floor(value));
  },
  when(v, k, cases){
    expect(_.keys(cases)).to.contain(v);
    cases[v](k);
  },
  validateKVPair(pair, cases){
    expect(pair).to.be.an('array');
    expect(pair).to.have.length(2);
    helper.when(pair[0],pair[1],cases);
  },
  validateEmptyHash(hash){
    expect(hash).to.eql({});
  },
  validateString(string){
    expect(string).to.be.a('string');
  }
};

