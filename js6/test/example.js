import {D,B,H} from '../consts';
describe("Sample test", () => {
  describe("basics", () => {
    it("is working", () => {
      expect(true).to.equal(true);
    });
    it("can import", () => {
      expect(D.EAST).not.to.be(undefined);
    });
  });
  describe("hooks", () =>{
    var a=0;
    before(() => {
      a+=1;
    });
    it("run before block", () => {
      expect(a).to.be(1);
    })
    it("run before block twice", () => {
      expect(a).to.be(1);
    })
  })
});

