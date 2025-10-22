# Copilot Instructions for @dan-schel/js-utils

## Project Overview

This is a TypeScript utility library for common code used across multiple NodeJS/Browser projects. It provides general-purpose functions for arrays, strings, integers, time, encoding, fetch utilities, and more. The package is published to npm as `@dan-schel/js-utils`.

## Tech Stack

- **Language**: TypeScript 5.8.3
- **Runtime**: Node.js 22.17.1
- **Module System**: ES Modules (ESM)
- **Build Tool**: TypeScript Compiler (tsc)
- **Test Framework**: Vitest 3.2.4
- **Linting**: ESLint 9.31.0 with TypeScript ESLint
- **Formatting**: Prettier 3.6.2
- **Package Manager**: npm

## Repository Structure

```
js-utils/
├── src/                    # Source TypeScript files
│   ├── index.ts           # Main export file
│   ├── arrays.ts          # Array utility functions
│   ├── strings.ts         # String utility functions
│   ├── integers.ts        # Integer utility functions
│   ├── time.ts            # Time-related utilities
│   ├── encoding.ts        # Encoding/decoding utilities
│   ├── clamp.ts           # Number clamping utilities
│   ├── scope.ts           # Scoping utilities
│   ├── seeded-random.ts   # Seeded random number generation
│   ├── uuid.ts            # UUID utilities
│   ├── zod.ts             # Zod schema utilities
│   ├── bump-check.ts      # Version bump checking utility
│   └── fetch/             # Fetch-related utilities
│       ├── index.ts
│       ├── cached.ts
│       └── polled.ts
├── tests/                  # Test files (mirrors src structure)
│   ├── *.test.ts          # Vitest test files
├── bin/                    # CLI executables
│   └── bump-check         # Version bump check script
├── dist/                   # Compiled output (generated)
├── coverage/               # Test coverage reports (generated)
└── node_modules/           # Dependencies (generated)
```

## Development Setup

### Installation

```bash
npm ci
```

### Common Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in `dist/`
- **Test**: `npm run test` - Runs all tests with Vitest
- **Test with Coverage**: `npm run test-coverage` - Runs tests with coverage report
- **Lint**: `npm run lint` - Runs ESLint and TypeScript type checking
- **Format**: `npm run format` - Formats all files with Prettier
- **Format Check**: `npm run format-check` - Checks if files are properly formatted
- **Bump Check**: `npm run bump-check` - Verifies version bump in package.json
- **Package**: `npm run package` - Builds and creates npm package

### Build Process

The build process uses TypeScript compiler (`tsc`) with the following configuration:

- Target: ES2022
- Module: NodeNext (ESM)
- Outputs to `dist/` directory
- Generates source maps and declaration files
- Strict mode enabled

## Code Style and Conventions

### TypeScript Configuration

- Strict mode enabled
- ES2022 target
- ESM modules with `.js` file extensions in imports
- Isolated modules
- Verbatim module syntax

### ESLint Rules

- No unused variables (except prefixed with `_`)
- Require `===` and `!==` (except when comparing to null)
- No `console.log` (warn) - use `console.warn` or `console.error`
- Prettier violations result in warnings

### Code Patterns

1. **Exports**: All exports use `.js` extension for ESM compatibility

   ```typescript
   export * from "./arrays.js";
   ```

2. **Function Documentation**: Use JSDoc comments for public APIs

   ```typescript
   /**
    * Returns an array of numbers from start to end.
    * @param start The starting number (inclusive).
    * @param end The ending number (exclusive).
    */
   export function range(start: number, end: number): number[] {
     // implementation
   }
   ```

3. **Function Overloads**: Use TypeScript overloads for type-specific behavior

   ```typescript
   export function unique(array: readonly string[]): string[];
   export function unique(array: readonly number[]): number[];
   export function unique<T>(
     array: readonly T[],
     equalsFunc?: EqualsFunc<T>,
   ): T[];
   ```

4. **Immutability**: Prefer `readonly` for array parameters that aren't modified
   ```typescript
   export function arraysMatch(
     a: readonly string[],
     b: readonly string[],
   ): boolean;
   ```

## Testing Approach

### Test Framework

- Uses Vitest for testing
- Test files located in `tests/` directory
- Naming convention: `*.test.ts`
- Tests mirror source file structure

### Test Patterns

1. **Describe blocks**: Group related tests

   ```typescript
   describe("range", () => {
     it("works", () => {
       expect(range(0, 4)).toStrictEqual([0, 1, 2, 3]);
     });
   });
   ```

2. **Multiple assertions**: Tests typically include multiple cases

   ```typescript
   expect(range(0, 4)).toStrictEqual([0, 1, 2, 3]);
   expect(range(2, 6)).toStrictEqual([2, 3, 4, 5]);
   expect(range(0, 0)).toStrictEqual([]);
   ```

3. **Edge cases**: Always test edge cases (empty arrays, single elements, etc.)

### Coverage Requirements

- Coverage reports are generated and uploaded to Codecov
- Aim for comprehensive test coverage of all public APIs

## CI/CD Workflows

### Continuous Integration (`.github/workflows/ci.yml`)

Runs on every push with the following jobs:

1. **format**: Checks code formatting with Prettier
2. **lint**: Runs ESLint and TypeScript type checking
3. **test**: Runs unit tests with coverage
4. **build**: Verifies the project builds successfully
5. **bump**: Checks version bump (skips renovate branches)

### Publishing (`.github/workflows/publish.yml`)

Runs on push to `master` branch:

- Builds the project
- Publishes to npm registry

## Version Management

### Bump Check

This repository includes a custom `bump-check` utility that ensures feature branches bump the version in `package.json` before being merged. The check ignores branches matching the pattern `^renovate\/`.

### Publishing Process

1. Run `npm version patch|minor|major`
2. Commit and sync changes with GitHub
3. Package is automatically published when PR is merged to master

## Common Utilities

### Arrays (`arrays.ts`)

- `range(start, end)`: Generate array of numbers
- `repeat(something, amount)`: Repeat value in array
- `unique(array, equalsFunc?)`: Remove duplicates
- `areUnique(array, equalsFunc?)`: Check if all elements are unique
- `arraysMatch(a, b, equalsFunc?)`: Compare arrays (order-independent)
- `removeIf(array, predicate)`: In-place removal
- `groupBy(items, groupSelector)`: Group items by key
- `groupConsecutive(items, isSameGroup)`: Group consecutive items

### Strings (`strings.ts`)

String manipulation utilities

### Integers (`integers.ts`)

Integer-specific utilities

### Time (`time.ts`)

Time and date utilities

### Encoding (`encoding.ts`)

Encoding/decoding utilities

### Fetch (`fetch/`)

- `cached.ts`: Caching utilities for fetch
- `polled.ts`: Polling utilities for fetch

### Seeded Random (`seeded-random.ts`)

Deterministic random number generation

### UUID (`uuid.ts`)

UUID generation and utilities

### Zod (`zod.ts`)

Zod schema utilities

## Making Changes

### When Adding New Features

1. Create source file in `src/`
2. Add corresponding test file in `tests/`
3. Export from `src/index.ts` with `.js` extension
4. Add JSDoc documentation
5. Follow existing patterns for overloads and type safety
6. Write comprehensive tests including edge cases
7. Run `npm run lint` and `npm test` before committing
8. Bump version in `package.json`

### When Fixing Bugs

1. Add a failing test that reproduces the bug
2. Fix the bug
3. Ensure all tests pass
4. Run linting and formatting
5. Bump patch version in `package.json`

## Important Notes

1. **ESM Only**: This package uses ES Modules exclusively
2. **File Extensions**: Always use `.js` in imports (TypeScript ESM requirement)
3. **No Console Logs**: Avoid `console.log` in production code
4. **Version Bumps**: Always bump version when making changes
5. **Type Safety**: Maintain strict TypeScript type safety
6. **Test Coverage**: Maintain high test coverage
7. **Documentation**: Keep JSDoc comments up to date
8. **Prettier**: Code is auto-formatted, don't fight the formatter
