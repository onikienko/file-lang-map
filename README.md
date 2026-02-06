# file-lang-map

**Fast, zero-dependency way to identify programming languages from paths, filenames, and extensions.**

## Why

Some language detectors can be heavy or rely on linear scans. `file-lang-map` pre-indexes GitHub
Linguist [languages.yml](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml) into compact lookup
maps, giving near-instant lookups, a small bundle size, and zero runtime dependencies.

## Features

- **O(1) (average-case) Performance:** Lookups are instant, regardless of how many languages exist.
- **Browser Ready:** Zero runtime dependencies. Works in browser and Node.js.
- **TypeScript Support:** Includes built-in type definitions.
- **Flexible:** Works with full and relative paths, filenames, or just extensions for all platforms.
- **Tiny:** Tree-shakable. Only load what you use. (Use named imports and a bundler that supports tree-shaking)
- **Collision Aware:** Correctly handles ambiguous extensions (e.g., `.h` returns "C", "C++" and "Objective-C").
- **Auto-Updated:** Data is fetched directly from GitHub Linguist sources using GitHub actions weekly.

## Installation

```bash
npm install file-lang-map
```

## Quick Start

```typescript
import {getLanguageByFileName, getLanguage, getLanguagesByType} from 'file-lang-map';

// Get all possible languages from filename (may return null if unknown)
const languages = getLanguageByFileName('path/to/file.js');
if (languages === null) {
  console.log('not found')
} else {
  console.log(languages)
  // ['JavaScript']
}

// Get language metadata by name. Case-insensitive lookup ("javascript" or "JavaScript").
const language = getLanguage('JavaScript');
/*
{
  name: 'JavaScript',
  type: 'programming',
  extensions: ['.js', '.cjs', '.mjs', ... ], // list of all know extensions
  filenames: ['Jakefile'] // list of all known filenames
}
*/

// You can optionally filter results by type (e.g., only 'programming')
const prog = getLanguageByFileName('data.json', 'programming');
// prog === null because JSON is a 'data' type

// Get list of all known "programming" languages (also available - 'data', 'markup', 'prose')
const programmingLanguages = getLanguagesByType('programming');
// ['JavaScript', 'Python', 'TypeScript', 'Rust', ...]
```

## Examples

### 1. Identify Language by Filename

Handles full paths (absolute or relative), exact filenames, and extensions. Returns an array of language names.

```typescript
import {getLanguageByFileName} from 'file-lang-map';

// Standard extensions
const langs = getLanguageByFileName('src/app/main.js');
console.log(langs); // ["JavaScript"]

// Exact filenames
const docker = getLanguageByFileName('Dockerfile');
console.log(docker); // ["Dockerfile"]

// Ambiguous extensions (Collision handling)
const candidates = getLanguageByFileName('lib.rs');
// Returns: ['RenderScript', 'Rust', 'XML']
```

### 2. Filter by Type

You can pass a second argument to filter results immediately (e.g., only "programming" languages).

```typescript
// .h can be C, C++, or Objective-C (all 'programming')
const headers = getLanguageByFileName('header.h', 'programming');
// Returns: [ 'C', 'C++', 'Objective-C' ]

// .ts can be TypeScript and XML (XML is "data" type)
const typescript = getLanguageByFileName('path/to/index.ts', 'programming');
// Returns: [ 'TypeScript' ]

// .json is 'data', so filtering by 'programming' returns null
const json = getLanguageByFileName('data.json', 'programming');
// Returns: null
```

### 3. Get Language Metadata

Lookup full language details by name (case-insensitive).
Language object includes all possible extensions for the language, name, possible filenames, and type.

```typescript
import {getLanguage} from 'file-lang-map';

// Case-insensitive lookup. 
// Returns language object which includes all possible extensions for the language, name...
const lang = getLanguage('javascript');
/*
{
  name: 'JavaScript',
  type: 'programming',
  extensions: [
    '.js',         '._js',   '.bones',
    '.cjs',        '.es',    '.es6',
    '.frag',       '.gs',    '.jake',
    '.javascript', '.jsb',   '.jscad',
    '.jsfl',       '.jslib', '.jsm',
    '.jspre',      '.jss',   '.jsx',
    '.mjs',        '.njs',   '.pac',
    '.sjs',        '.ssjs',  '.xsjs',
    '.xsjslib'
  ],
  filenames: [ 'Jakefile' ]
}
*/
```

### 4. Get All Languages by Type

Useful for filtering lists or building dropdowns. Returns an array of language names (strings).

```typescript
import {getLanguagesByType} from 'file-lang-map';

const programmingLangs = getLanguagesByType('programming');
// Returns: ['JavaScript', 'Python', 'TypeScript', 'Rust', ...]

const dataLangs = getLanguagesByType('data');
// Returns: ['JSON', 'YAML', 'CSV', 'TOML', ...]
```

## API Reference

### `getLanguageByFileName(fileName: string, typeFilter?: LanguageType): string[] | null`

Returns an **array of strings** (names).

- **fileName**: Can be a full path, a relative path, or just a filename.
- **typeFilter**: (Optional) Filter by `'programming' | 'data' | 'markup' | 'prose'`.
- **Returns**: Array of names or `null` if not found.

### `getLanguage(name: string): Language | null`

Look up a full language object by name. Case-insensitive (`"python"`, `"Python"` work).

- **name**: language name
- **Returns**: language object

### `getLanguagesByType(type: LanguageType): string[]`

Get all language names belonging to a specific type.

- **type**: `'programming' | 'data' | 'markup' | 'prose'`.
- **Returns**: Array of language names (strings).

## Contributing and Development

This package is **self-updating**. The data is fetched from GitHub Linguist automatically.
To refresh the data locally:

```bash
npm run generate
```

### Running Tests

The project has two test commands:

- **`npm test`**: Uses native Node.js glob patterns (`test/**/*.test.ts`). Requires Node.js 20.11+ or 22+.
- **`npm run test:ci`**: Uses shell `find` command for file discovery. Compatible with Node.js 18+.

The CI pipeline tests on Node 18 and 24, so `test:ci` ensures compatibility with older Node versions that don't support
glob patterns in the `--test` flag.

### How Self-Updating Works

The project creates and uses a `linguist-lock.json` file to track the state of the upstream `linguist.yml`.

- When the CI/CD run `npm run generate`, it downloads the latest data and calculates a hash.
- If the hash differs from `linguist-lock.json`, the lock file is updated.
- The CI/CD pipeline (`.github/workflows/update-and-publish.yml)` checks for changes in `linguist-lock.json` to decide
  whether to release a new version.

## License

MIT
