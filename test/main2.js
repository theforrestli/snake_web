var test = require("tape");

test('fibwibblers and xyrscawlers', function (t) {
  t.test('ibwibblers and xyrscawlers2', function (t) {
    t.plan(1);

    t.equal(22, 22);
  });
  t.test('ibwibblers and xyrscawlers3', function (t) {
    t.plan(1);

    setTimeout(() =>{
      t.equal(22, 22);
    },1000);
  });
});

