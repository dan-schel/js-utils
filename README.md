# My JS Utils

[![codecov](https://codecov.io/gh/dan-schel/js-utils/graph/badge.svg?token=2PDJOCODS5)](https://codecov.io/gh/dan-schel/js-utils)

A library for code common to my various NodeJS/Browser projects.

## Bump check

This package includes a `bump-check` script which is useful if you're writing
an NPM package and you want your CI to ensure the feature branch bumps the
version in `package.json` before being merged.

To use it, include the following in your `package.json`:

```json
"scripts": {
  "bump-check": "bump-check"
}
```

You can also configure it to ignore branches based on regex, e.g.:

```json
"scripts": {
  "bump-check": "bump-check --ignore \"^renovate\\/\""
}
```

## TODO check

This package also includes a `todo-check` script for CI. It exits with code 1
when it finds a plain `TODO:` marker or a dated `TODO YYYY-MM-DD:` marker
which has expired (or expires today).

To use it, include the following in your `package.json`:

```json
"scripts": {
  "todo-check": "todo-check --tz Australia/Melbourne --extensions .ts .md --ignore \"^renovate\\/\""
}
```

It will ignore `.gitignored` files, and therefore expects to be run inside a git repository only.
