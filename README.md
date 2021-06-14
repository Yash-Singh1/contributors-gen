# `contributors-gen`

`contributors-gen` generates a `CONTRIBUTORS` file and can be used on GitHub repositories.

## API

Install:

```sh
npm install contributors-gen
```

Importing:

```javascript
const contributorsGen = require('contributors-gen');
```

Using:

```javascript
contributorsGen({
  write /* boolean: Whether to write to the file or not (default: false) */,
  includeBots /* boolean: Whether to include bots in the results or not (default: false) */,
  comments /* array|string: The comments to prepended at the top (default: []) */,
  fileName /* string: The filename to write to, if writing enabled (default: 'CONTRIBUTORS') */,
  sort /* string|function: The method in which to sort the results (default: 'abc') */
});
```
