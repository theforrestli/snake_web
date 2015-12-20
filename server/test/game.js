const socket_io = require("socket.io");
const socket_io_client = require("socket.io-client");
const game = require("../game");
const _ = require("underscore");
var expect = require("expect.js");
const testPort = 3010;
describe("sample_test", () => {
  it("test 1", () => {
    expect(1).to.eql(1);
  });
});
describe("Game", () => {
  beforeEach((done) => {
    this.io = socket_io();
    this.io.listen(testPort);
    setTimeout(done, 0);
  });
  afterEach((done) => {
    this.io.close();
    setTimeout(done, 0);
  });
  it("io client can connect", (done) => {
    this.io.on("connection", (socket) => {
      done();
    });
    const ioc = socket_io_client(`http://localhost:${testPort}`);
  });
  describe("createNamespace", () => {
    it("creates a namespace and client can connect", (done) => {
      const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
      nsp.on("connection", (socket) => {
        done();
      });
      const ioc = socket_io_client(`http://localhost:${testPort}/test`);
    });
    describe("join", () => {
      it("rejects input with error when input is string", (done) => {
        const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
        const ioc = socket_io_client(`http://localhost:${testPort}/test`);
        ioc.on("join", (json) => {
          expect(json).to.eql({
            error: "input need to be an array of valid ids",
          });
          done();
        });
        ioc.emit("join", "should have been array");
      });
      it("skips server id and taken id and return sets valid id", (done) => {
        const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
        const ioc1 = socket_io_client(`http://localhost:${testPort}/test`);
        new Promise((fulfill, reject) => {
          ioc1.on("b",(json) => {
            expect(json).to.eql(["s", ["j", "ioc1"]]);
            ioc1.off("b");
            fulfill();
          });
          ioc1.emit("join", ["ioc1","ioc2"]);
        }).then(() => {
          return new Promise((fulfill, reject) => {
            const ioc2 = socket_io_client(`http://localhost:${testPort}/test`);
            ioc2.on("join", (json) => {
              expect(json).to.eql({
                new: "ioc2",
              });
              fulfill();
            });
            ioc2.emit("join", ["s", "ioc1","ioc2"]);
          });
        }).then(done).catch((e) => {console.error(e.stack);});
      });
    });
    describe("b", () => {
      it("does not do anything when socket hasn't joined", (done) => {
        const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
        const ioc1 = socket_io_client(`http://localhost:${testPort}/test`);
        new Promise((fulfill, reject) => {
          ioc1.on("err", (json) => {
            expect(json).to.eql({
              event: "b",
              message: "does not have id yet",
            });
            fulfill();
          });
          ioc1.on("b", (json) => {
            reject("received");
          });
          ioc1.emit("b", "data");
        }).then(done).catch((e) => {console.error(e.stack);});
      });
      it("broadcasts correct data", (done) => {
        const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
        const ioc1 = socket_io_client(`http://localhost:${testPort}/test`);
        new Promise((fulfill, reject) => {
          ioc1.emit("join", ["ioc1"]);
          ioc1.on("b", (json) => {
            expect(json).to.eql(["ioc1","data"]);
            fulfill();
          });
          ioc1.emit("b", "data");
        }).then(done).catch((e) => {console.error(e.stack);});
      });
    });
  });
});

function getGameOpt(opt){
  return _.extend({
    name: "test",
    game: {},
    random_key_length: 128,
    period: 10000,
  }, opt);
}

