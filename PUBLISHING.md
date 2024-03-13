# Publishing and commits

## Committing to the repo

The `@commitlint/config-conventional` plugin enforces that the commit message must start with one of the following prefixes:

- build
- chore
- ci
- docs
- feat
- fix
- perf
- refactor
- revert
- style
- test

E.g. `fix: clean readme/publishing doc` or `feat: add array helper function`.

## Publishing the package

To publish a new release of this package to npm:

- Run `npm version patch`, `npm version minor`, or `npm version major`.
  - You can also provide a commit message with the `-m` flag, e.g. `npm version patch -m "Fix a major bug!"`
- Sync changes with GitHub.
