const fs = require('fs');
const test = require('ava');
const requireInject = require('require-inject');

test('works with one contributor', async (t) => {
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, 'person <person@gmail.com>', undefined);
      }
    }
  });
  run().then((value) => {
    t.is(value, 'person <person@gmail.com>\n');
  });
});

test('works with two contributors', async (t) => {
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(
          undefined,
          'person <person@gmail.com>\nperson2 <person2@example.com>',
          undefined
        );
      }
    }
  });
  run().then((value) => {
    t.is(value, 'person <person@gmail.com>\nperson2 <person2@example.com>\n');
  });
});

test('works with n contributors', async (t) => {
  const n = Math.floor(Math.random() * 100) + 1;
  const nString = [...new Array(n).keys()]
    .map((v, i) => `person${i} <person${i}@anything.com>`)
    .join('\n');
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, nString, undefined);
      }
    }
  });
  run().then((value) => {
    value
      .slice(0, -1)
      .split('\n')
      .forEach((person) => {
        t.true(nString.split('\n').includes(person));
      });
  });
});

test("doesn't include bots by default", async (t) => {
  const n = Math.floor(Math.random() * 100) + 1;
  const nString = [...new Array(n).keys()]
    .map((v, i) => `person${i}[bot] <person${i}@anything.com>`)
    .join('\n');
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, nString, undefined);
      }
    }
  });
  run().then((value) => {
    t.is(value, '\n');
  });
});

test('includes bots when specified', async (t) => {
  const n = Math.floor(Math.random() * 100) + 1;
  const nString = [...new Array(n).keys()]
    .map((v, i) => `person${i}[bot] <person${i}@anything.com>`)
    .join('\n');
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, nString, undefined);
      }
    }
  });
  run({
    includeBots: true
  }).then((value) => {
    value
      .slice(0, -1)
      .split('\n')
      .forEach((person) => {
        t.true(nString.split('\n').includes(person));
      });
  });
});

test('writes to CONTRIBUTORS by default', async (t) => {
  const n = Math.floor(Math.random() * 100) + 1;
  const nString = [...new Array(n).keys()]
    .map((v, i) => `person${i} <person${i}@anything.com>`)
    .join('\n');
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, nString, undefined);
      }
    }
  });
  return run({
    write: true
  }).then((value) => {
    value
      .slice(0, -1)
      .split('\n')
      .forEach((person) => {
        t.true(nString.split('\n').includes(person));
      });
    fs.readFileSync('CONTRIBUTORS', 'utf-8')
      .slice(0, -1)
      .split('\n')
      .forEach((person) => {
        t.true(nString.split('\n').includes(person));
      });
  });
});
