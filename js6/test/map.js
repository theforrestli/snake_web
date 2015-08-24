import map from '../map';
describe("map", () => {
  var input;
  beforeEach(() => {
    input = {
      version: 1,
      width: 10,
      height: 10,
    };
  });
  describe.skip("validation", () => {
    it("passes when input is good", () => {
      expect(map).withArgs(input).not.to.throwException();
    });
    it("varifies version", () => {
      input.version = -1;
      expect(map).withArgs(input).to.throwException();
    });
    it("varifies size", () => {
      input.width = 0;
      expect(map).withArgs(input).to.throwException();
      input.width = -1;
      expect(map).withArgs(input).to.throwException();
      input.width = 3.5;
      expect(map).withArgs(input).to.throwException();
      input.width = 1e10;
      expect(map).withArgs(input).to.throwException();

      input.width = 10;

      input.height = 0;
      expect(map).withArgs(input).to.throwException();
      input.height = -1;
      expect(map).withArgs(input).to.throwException();
      input.height = 3.5;
      expect(map).withArgs(input).to.throwException();
      input.height = 1e10;
      expect(map).withArgs(input).to.throwException();
    });
  })
  describe("game", () => {
  })
});
