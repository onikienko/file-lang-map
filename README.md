# file-lang-map

**Fast, zero-dependency way to identify programming languages from filenames and extensions.**

### Why

Most language detection libraries are either too heavy or too slow (looping over arrays).
`file-lang-map` pre-indexes GitHub
Linguist [languages.yml](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml) data into optimized
hash maps, ensuring instant lookups with a tiny footprint.

## Features

- **O(1) Performance:** Lookups are instant, regardless of how many languages exist.
- **Browser Ready:** Zero dependencies (no `fs`, no `path`). Works in Vite, Next.js, React, Vue.
- **Collision Aware:** Correctly handles ambiguous extensions (e.g., `.rs` returns both "Rust" and "RenderScript").
- **Auto-Updated:** Data is fetched directly from GitHub Linguist sources.
- **Tiny:** Tree-shakable. Only load what you use.

## Installation

```bash
npm install file-lang-map
```

## Usage

### 1. Identify Language by Filename

Handles full paths, exact filenames, and extensions. Returns an array of language names.

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

```typescript
import {getLanguage} from 'file-lang-map';

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

Useful for filtering lists or building dropdowns.

```typescript
import {getLanguagesByType} from 'file-lang-map';

const programmingLangs = getLanguagesByType('programming');
// Returns: [ { name: "JavaScript", type: "programming", ... }, { name: "Python"... }, ... ]
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

### `getLanguagesByType(type: LanguageType): Language[]`

Get all full language objects belonging to a specific type.

- **type**: `'programming' | 'data' | 'markup' | 'prose'`.
- **Returns**: Array of language objects.

## Contributing

This package is **self-updating**. The data is fetched from GitHub Linguist automatically.
To refresh the data locally:

```bash
npm run generate
```

## License

MIT
