# `contributors-gen`

`contributors-gen` generates a `CONTRIBUTORS` file and can be used on GitHub repositories.

## API

Install:

```sh
npm install --save contributors-gen
```

Importing:

```javascript
const contributorsGen = require('contributors-gen');
```

Using:

```javascript
contributorsGen({
  write /* boolean: Whether to write to the file or not (default: false) */
  includeBots /* boolean: Whether to include bots in the results or not (default: false) */
  comments /* array|string: The comments to prepended at the top (default: []) */
  fileName /* string: The filename to write to, if writing enabled (default: 'CONTRIBUTORS') */
});
```

## CLI

Install

```sh
npm install -g contributors-gen
```

Using:

```sh
# Read the man page
man contributors-gen
```
