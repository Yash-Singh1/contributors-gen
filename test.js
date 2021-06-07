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
    t.deepEqual(
      value,
      'person <person@gmail.com>\n',
      'only one contributor is given'
    );
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
    t.deepEqual(
      value,
      'person <person@gmail.com>\nperson2 <person2@example.com>\n',
      'only two contributors are given'
    );
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
      .forEach((person, index) => {
        t.true(nString.split('\n').includes(person), `person${index} is given`);
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
    t.deepEqual(
      value,
      '\n',
      'there are no contributors because bots are removed'
    );
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
      .forEach((person, index) => {
        t.true(
          nString.split('\n').includes(person),
          `person${index}[bot] is given`
        );
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
      .forEach((person, index) => {
        t.true(
          nString.split('\n').includes(person),
          `person${index} is included in return value`
        );
      });
    fs.readFileSync('CONTRIBUTORS', 'utf-8')
      .slice(0, -1)
      .split('\n')
      .forEach((person, index) => {
        t.true(
          nString.split('\n').includes(person),
          `person${index} is included in the CONTRIBUTORS file`
        );
      });
  });
});

test('writes to CONTRIBUTORS by default including bots', async (t) => {
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
  return run({
    write: true,
    includeBots: true
  }).then((value) => {
    value
      .slice(0, -1)
      .split('\n')
      .forEach((person, index) => {
        t.true(
          nString.split('\n').includes(person),
          `person${index} is included in return value`
        );
      });
    fs.readFileSync('CONTRIBUTORS', 'utf-8')
      .slice(0, -1)
      .split('\n')
      .forEach((person, index) => {
        t.true(
          nString.split('\n').includes(person),
          `person${index} is included in the CONTRIBUTORS file`
        );
      });
  });
});

test("changing filename doesn't write", async (t) => {
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, '', undefined);
      }
    }
  });
  return run({
    fileName: 'changename'
  }).then(() => {
    t.false(fs.existsSync('changename'), "filename doesn't exist");
  });
});

test.afterEach(() => {
  if (fs.existsSync('CONTRIBUTORS')) {
    fs.unlinkSync('CONTRIBUTORS');
  }
});

test('defaults for write, comments, and includeBots work', async (t) => {
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
    write: 'some other stuff',
    includeBots: 'also invalid',
    comments: 5
  }).then((value) => {
    t.deepEqual(
      value,
      '\n',
      'there are no contributors because bots are removed'
    );
  });
});

test('comments takes a string', async (t) => {
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, 'person <person@anything.com>', undefined);
      }
    }
  });
  run({
    comments: 'comment'
  }).then((value) => {
    t.deepEqual(
      value,
      '# comment\nperson <person@anything.com>\n',
      '1 comment and the contributor'
    );
  });
});

test('comments takes an array', async (t) => {
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, 'person <person@anything.com>', undefined);
      }
    }
  });
  run({
    comments: ['comment1', 'comment2']
  }).then((value) => {
    t.deepEqual(
      value,
      '# comment1\n# comment2\n\nperson <person@anything.com>\n',
      '2 comments and the contributor'
    );
  });
});

test('duplicates are removed', async (t) => {
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(
          undefined,
          'person <person@anything.com>\nperson <person@anything.com>',
          undefined
        );
      }
    }
  });
  run().then((value) => {
    t.deepEqual(
      value,
      'person <person@anything.com>\n',
      'duplicates are removed from the input commits'
    );
  });
});

test('sort order cba', async (t) => {
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(
          undefined,
          'person1 <person1@anything.com>\nperson2 <person2@anything.com>',
          undefined
        );
      }
    }
  });
  run({
    sort: 'cba'
  }).then((value) => {
    t.deepEqual(
      value,
      'person2 <person2@anything.com>\nperson1 <person1@anything.com>\n',
      'reverse order'
    );
  });
});

test('sort order recent', async (t) => {
  const nString = [...new Array(100).keys()]
    .map((v, i) => `person${i} <person${i}@anything.com>`)
    .join('\n');
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, nString, undefined);
      }
    }
  });
  run({
    sort: 'recent'
  }).then((value) => {
    t.deepEqual(value, nString + '\n', 'recent order');
  });
});

test('sort order oldest', async (t) => {
  const nString = [...new Array(100).keys()].map(
    (v, i) => `person${i} <person${i}@anything.com>`
  );
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, nString.join('\n'), undefined);
      }
    }
  });
  run({
    sort: 'oldest'
  }).then((value) => {
    t.deepEqual(
      value.split('\n').slice(0, -1),
      nString.reverse(),
      'oldest order'
    );
  });
});

test('fails on unknown sorting order', async (t) => {
  const nString = [...new Array(100).keys()].map(
    (v, i) => `person${i} <person${i}@anything.com>`
  );
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, nString.join('\n'), undefined);
      }
    }
  });
  run({
    sort: 'random'
  }).catch((value) => {
    t.is(value.message, 'Unknown sorting type: random');
  });
});

test('sort order custom', async (t) => {
  const abc = 'abcdefghijklmnopqrstuvwxyz';
  const nString = [...new Array(100).keys()].map(
    (v, i) =>
      `${abc[i % abc.length]}erson${i} <${
        abc[i % abc.length]
      }erson${i}@anything.com>`
  );
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, nString.join('\n'), undefined);
      }
    }
  });
  run({
    sort: (a, b) => (a.startsWith('p') ? -1 : 1)
  }).then((value) => {
    t.is(value[0], 'p');
  });
});

test('rejects on cmd error', async (t) => {
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb('error', undefined, undefined);
      }
    }
  });
  run().catch((value) => {
    t.is(value, 'error');
  });
});

test('rejects on std error', async (t) => {
  const run = requireInject('./index.js', {
    child_process: {
      exec(command, cb) {
        return cb(undefined, undefined, 'stderr');
      }
    }
  });
  run().catch((value) => {
    t.is(value, 'stderr');
  });
});
