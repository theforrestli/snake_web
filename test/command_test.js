
function validateCommand(command){
  th.vlidateKVPair(command, {
    [Command.server.id]: validateServerCommand,
    [Command.game.id]: validateGameCommand,

  }
  function validateSpecialCommand(data){
    const server = Command.server;
    th.validateKVPair(data, {
      [server.time.key]: th.validateNonNegativeInteger,
      [server.random.key]: th.validateString,
      [server.join.key]: (data) => {
        expect(data).to.be.an('array');
        expect(data).to.have.length(2);
        expect(data[0]).to.be.a('string');//id
        expect(data[1]).to.be.a('string');//socket id
      },
      [keys.LEAVE]: th.validateString,//id
    });
  }
  function validateGameCommand(data){
    const game = Command.game;
    th.validateKVPair(data, {
      [game.boost.key]: th.validateEmptyHash,
      [game.chat.key]: (text) => {
        expect(text).to.be.a('string');
      },
      [game.direction.key]: (d) => {
        th.validateNonNegativeInteger(d);
        expect(d).to.be.below(5);
      }
    });
  }
}
