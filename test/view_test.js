var View = require('view');
var Game = require('game');
var map = require('map');
describe("View", () => {
  describe("on game box", () => {
    it("clears the original content", () => {
      var param = {
        width: 20,
        height: 20,
        version: 1,
      };
      var game = Object.create(game.proto, map(param));
      var svgEl = $('<svg></svg>')[0];
      var view = new View(svgEl, game);
      var box = view.grid[20];

      box.rect(1,1);
      game.emit('box',{x:0,y:1}, [],[0]);

      expect(box.children.length).to.be(0);
    });
  });
});
