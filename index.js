/**
 * @file Main Source code for contributors-gen
 */

const fs = require('fs');
const { version } = require('./package.json');
const childProcess = require('child_process');

/**
 * The configuration type
 * @typedef {Object} mainConfig
 * @property {boolean} [write=true] Whether to write the content to the file
 * @property {boolean} [usersOnly=true] Include users only inside the content (not bots, etc.)
 * @property {string|string[]} [comments=[]] The comments appended to the top of the file
 * @property {string} [fileName='CONTRIBUTORS'] The filename to write the content to
 * @property {string|function} [sort='abc'] The sorting technique
 */

/**
 * Generate the CONTRIBUTORS file
 * @function
 * @async
 * @module contributors-gen
 * @param {mainConfig} config
 * @returns {Promise<string>}
 */
const run = async ({
  write = false,
  includeBots = false,
  comments = [],
  fileName = 'CONTRIBUTORS',
  sort = 'abc'
} = {}) => {
  if (typeof write != 'boolean') {
    write = false;
  }
  if (typeof includeBots != 'boolean') {
    includeBots = false;
  }
  if (typeof comments === 'string') {
    comments = [comments];
  } else if (!Array.isArray(comments)) {
    comments = [];
  }
  completeComments = comments.map((comment) => `# ${comment}`).join('\n');
  if (completeComments != '') {
    if (comments.length == 1) {
      completeComments += '\n';
    } else {
      completeComments += '\n\n';
    }
  }
  let contributors = (
    await new Promise(function (resolve, reject) {
      childProcess.exec("git log --pretty=format:'%aN <%ae>'", function (
        error,
        standardOutput,
        standardError
      ) {
        if (error) {
          reject(error);
          return;
        }
        if (standardError) {
          reject(standardError);
          return;
        }
        resolve(standardOutput);
      });
    })
  )
    .split('\n')
    .map((line) => line.trim());
  contributors =
    contributors.length === 1 && contributors[0] === '' ? [] : contributors;
  contributors = [...new Set(contributors)];
  contributors = includeBots
    ? contributors
    : contributors.filter((entry) => !entry.split(' <')[0].endsWith('[bot]'));

  let loginsOfContributors = contributors
    .filter(
      (contributor) =>
        !contributor
          .split(' <')[1]
          .slice(0, -1)
          .endsWith('@users.noreply.github.com') &&
        !contributor.split(' <')[0].includes(' ')
    )
    .map((contributor) => contributor.split(' <')[0]);
  contributors = contributors.filter((value) => {
    let mail = value.split(' <')[1].slice(0, -1);
    let haveAlready;
    try {
      haveAlready = loginsOfContributors.includes(
        mail.split('+')[1].split('@')[0]
      );
    } catch {
      haveAlready = false;
    }
    return !(mail.endsWith('@users.noreply.github.com') && haveAlready);
  });
  let allMails = [];
  contributors = contributors.filter((value) => {
    let currentMail = value.split(' <')[1].slice(0, -1);
    if (allMails.includes(currentMail)) {
      return false;
    } else {
      allMails.push(currentMail);
      return true;
    }
  });
  if (typeof sort === 'function') {
    contributors = contributors.sort(sort);
  } else {
    switch (sort) {
      case 'abc':
        contributors = contributors.sort();
        break;
      case 'cba':
        contributors = contributors.sort().reverse();
        break;
      case 'recent':
        break;
      case 'oldest':
        contributors = contributors.reverse();
        break;
      default:
        throw new Error('Unknown sorting type: ' + sort);
    }
  }
  const finished =
    (contributors.length === 0 ? completeComments.trim() : completeComments) +
    contributors.join('\n') +
    '\n';
  if (write) {
    fs.writeFileSync(fileName, finished);
  }
  return finished;
};

module.exports = Object.assign(run, version);
