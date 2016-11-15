const socket_io = require("socket.io");
const socket_io_client = require("socket.io-client");
const game = require("../game");
const _ = require("underscore");
var expect = require("expect.js");
const testPort = 3010;
const H = {
  emitPromise(socket, event, data){
    return new Promise((fulfill) => {
      socket.emit(event, data, fulfill);
    });
  }
};
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
    _.forEach(this.io.sockets.sockets, (socket, id) => {
      socket.disconnect();
    });
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
        H.emitPromise(ioc, "join", "should have been array").then((json) => {
          expect(json).to.eql({
            error: {
              key: "SJOIN.CLIENT.NOT_ARRAY",
              message: "input need to be an array of valid ids",
            }
          });
        }).then(done, done);
      });
      it("skips server id and taken id and return sets valid id", (done) => {
        const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
        const ioc1 = socket_io_client(`http://localhost:${testPort}/test`);
        const ioc2 = socket_io_client(`http://localhost:${testPort}/test`);
        H.emitPromise(ioc1, "join", ["ioc1","ioc2"]).then((json) => {
          expect(json).to.eql({new: 'ioc1'});
          return H.emitPromise(ioc2, "join", ["ioc1","ioc2"]);
        }).then((json) => {
          expect(json).to.eql({ new: "ioc2" });
          return H.emitPromise(ioc1, "join", ["ioc2","ioc3"]);
        }).then((json) => {
          expect(json).to.eql({ old: "ioc1", new: "ioc3" });
        }).then(done, done);
      });
    });
    describe("b", () => {
      it("does not do anything when socket hasn't joined", (done) => {
        const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
        const ioc1 = socket_io_client(`http://localhost:${testPort}/test`);
        new Promise((fulfill, reject) => {
          ioc1.on("err", fulfill);
          ioc1.on("b", reject);
          ioc1.emit("b", "data", () => {});
        }).then((json) => {
          expect(json).to.eql({
            event: "b",
            message: "does not have id yet",
          });
        }).then(done, done);
      });
      it("broadcasts correct data", (done) => {
        const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
        const ioc1 = socket_io_client(`http://localhost:${testPort}/test`);
        new Promise((fulfill, reject) => {
          ioc1.emit("join", ["ioc1"], () => {});
          ioc1.on("b", (json) => {
            if(json[0] == "ioc1"){
              expect(json).to.eql(["ioc1","data"]);
              fulfill();
            }
          });
          ioc1.emit("b", "data", () => {});
        }).then(done, done);
      });
    });
    describe("get", () => {
      it("gets my_id", (done) => {
        const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
        const ioc1 = socket_io_client(`http://localhost:${testPort}/test`);
        const ioc2 = socket_io_client(`http://localhost:${testPort}/test`);
        const ioc3 = socket_io_client(`http://localhost:${testPort}/test`);
        Promise.all([
            H.emitPromise(ioc1, "join", ["id1"]),
            H.emitPromise(ioc2, "join", ["id2"]),
        ]).then(() => {
          return Promise.all([
            H.emitPromise(ioc1, "get", "my_id"),
            H.emitPromise(ioc2, "get", "my_id"),
            H.emitPromise(ioc3, "get", "my_id"),
          ]);
        }).then(([json1, json2, json3]) => {
          expect(json1).to.eql({
            query: "my_id",
            result: "id1",
          });
          expect(json2).to.eql({
            query: "my_id",
            result: "id2",
          });
          expect(json3).to.eql({
            query: "my_id",
          });
        }).then(done,done);
      });

      it("get history", (done) => {
        const nsp = game.createNamespace(this.io, getGameOpt({name: "test"}));
        const ioc1 = socket_io_client(`http://localhost:${testPort}/test`);
        const ioc2 = socket_io_client(`http://localhost:${testPort}/test`);
        H.emitPromise(ioc1, "join", ["id1"]).then(() => {
          return H.emitPromise(ioc1, "b", "message");
        }).then(() => {
          return Promise.all([
            H.emitPromise(ioc1, "get", "history"),
            H.emitPromise(ioc2, "get", "history"),
          ]);
        }).then(([json1, json2]) => {
          const expected = {
            query: "history",
            result: [
              ["s", ["j", "id1"]],
              ["id1", "message"],
            ]
          };
          expect(json1).to.eql(expected);
          expect(json2).to.eql(expected);
        }).then(done, done);
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

