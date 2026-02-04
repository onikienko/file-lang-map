import _extensions from './generated/extensions.json';
import _filenames from './generated/filenames.json';
import _languages from './generated/languages.json';
import _types from './generated/types.json';
import { Language, LanguagesMap, LanguageType, LookUpMap, TypeMap } from './types';

const languagesData = _languages as LanguagesMap;
const extensionsData = _extensions as LookUpMap;
const filenamesData = _filenames as LookUpMap;
const typesData = _types as TypeMap;

/**
 * Browser-safe helper to get basename.
 * @param {string} fileName - "main.ts", "myApp/main.ts"
 */
function getBasename(fileName: string): string {
  // Find the last separator (forward slash or backslash)
  let lastSlash;
  const fwd = fileName.lastIndexOf('/');
  const back = fileName.lastIndexOf('\\');
  lastSlash = Math.max(fwd, back);

  return lastSlash === -1 ? fileName : fileName.slice(lastSlash + 1);
}

/**
 * Browser-safe helper to get file extension.
 * Handles edge cases like "Makefile" (no ext) or ".gitignore" (is dotfile).
 * @param {string} fileName - "main.ts", "myApp/main.ts"
 * @param {string} [knownBaseName] - Optional, if the filename is known to start with a known base name.
 */
function getExtension(fileName: string, knownBaseName?: string): string {
  const base = knownBaseName ?? getBasename(fileName);
  const lastDotIndex = base.lastIndexOf('.');

  // If dot is missing or is the first character (.gitignore), return empty
  if (lastDotIndex <= 0) return '';
  return base.slice(lastDotIndex);
}

// --- Public API ---
/**
 * Get full language metadata by name (case-insensitive)
 * Returns a Language object or null if not found
 * @param {string} languageName - the name of the language (e.g. "JavaScript", "python")
 */
export function getLanguage(languageName: string): Language | null {
  const key = languageName.toLowerCase();
  return languagesData[key] || null;
}

/**
 * Get all languages belonging to a specific type category.
 * @param {LanguageType} type - 'programming' | 'data' | 'markup' | 'prose'
 */
export function getLanguagesByType(type: LanguageType): Language[] {
  const keys = typesData[type];
  if (!keys) return [];
  const results: Language[] = [];
  for (let i = 0; i < keys.length; i++) {
    const lang = languagesData[keys[i]];
    if (lang) {
      results.push(lang);
    }
  }
  return results;
}

/**
 * Get potential language NAMES for a given file.
 * Returns an array of strings because of collisions (e.g. .rs -> ["Rust", "RenderScript"]).
 * @param {string} fileName - path or filename - "main.ts", "myApp/main.ts"
 * @param {LanguageType} [typeFilter]  - (Optional) 'programming' | 'data' | 'markup' | 'prose'
 */
export function getLanguageByFileName(fileName: string, typeFilter?: LanguageType): string[] | null {
  const base = getBasename(fileName);
  const ext = getExtension(fileName);

  let candidateKeys: string[] = [];

  // Check exact filename first (e.g. "Dockerfile"), then extension
  if (filenamesData[base]) {
    candidateKeys = filenamesData[base];
  } else if (ext && extensionsData[ext]) {
    candidateKeys = extensionsData[ext];
  }

  if (candidateKeys.length === 0) return null;

  const results: string[] = [];

  for (let i = 0; i < candidateKeys.length; i++) {
    const key = candidateKeys[i];
    const lang = languagesData[key];

    if (!lang) continue;

    // If a filter is provided, skip mismatching types
    if (typeFilter && lang.type !== typeFilter) {
      continue;
    }

    results.push(lang.name);
  }

  return results.length > 0 ? results : null;
}
