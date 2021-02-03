#!/usr/bin/env node

const run = require('./index.js');
const meow = require('meow');

const cli = meow(
  `
Usage
  $ contributors-gen -[wfbc] <comments>

Options
  --write, -w            Write the output to the file
  --file, -f <filename>  The filename to write the output to (default: CONTRIBUTORS)
  --bots, -b             Whether to include bots or not

Examples
  $ contributors-gen -w
  $ contributors-gen -f AUTHORS -w "first line" "second line"
  $ contributors-gen -b
    person <person@gmail.com>
    ESLint Jenkins <eslint[bot]@users.noreply.github.com>
    ...
  $ contributors-gen
    person <person@gmail.com>
    ...
  $ contributors-gen "first comment"
    # first comment
    person <person@gmail.com>
    ...
  $ contributors-gen "first comment" "second comment"
    # first comment
    # second comment

    person <person@gmail.com>
    ...
`,
  {
    flags: {
      write: {
        type: 'boolean',
        alias: 'w',
        default: false,
      },
      file: {
        type: 'string',
        alias: 'f',
        default: 'CONTRIBUTORS',
      },
      bots: {
        type: 'boolean',
        alias: 'b',
        default: false,
      },
    },
  }
);

const results = run({
  write: cli.flags.write,
  file: cli.flags.file,
  bots: cli.flags.bots,
  comments: cli.input,
});

results.then((value) => {
  if (!cli.flags.write) {
    console.log(value);
  }
});
