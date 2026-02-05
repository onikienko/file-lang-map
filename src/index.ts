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
 * Browser-safe helper to get basename from a file path.
 * Handles both forward slashes (Unix/Web) and backslashes (Windows).
 *
 * @param {string} fileName - The file path or filename
 * @returns {string} The basename (filename without directory path)
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
 * Browser-safe helper to extract file extension from a filename.
 * Handles edge cases like files without extensions and dotfiles.
 *
 * @param {string} fileName - The file path or filename
 * @param {string} [knownBaseName] - Optional pre-computed basename to avoid redundant calculation
 * @returns {string} The file extension including the dot (e.g., '.ts') or empty string if none
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
 * Get full language metadata by name (case-insensitive lookup).
 *
 * @param {string} languageName - The name of the language (e.g., "JavaScript", "python", "TypeScript")
 * @returns {Language | null} The Language object with metadata, or null if not found
 *
 * @example
 * const lang = getLanguage('javascript');
 * // => { name: 'JavaScript', type: 'programming', extensions: ['.js', '.mjs', ...], filenames: [...] }
 *
 * @example
 * const lang = getLanguage('PyThOn'); // Case-insensitive
 * // => { name: 'Python', type: 'programming', extensions: ['.py', ...], filenames: [...] }
 *
 * @example
 * const lang = getLanguage('UnknownLang');
 * // => null
 */
export function getLanguage(languageName: string): Language | null {
  const key = languageName.toLowerCase();
  return languagesData[key] || null;
}

/**
 * Get all languages belonging to a specific type category.
 * Returns an array of language names (strings).
 *
 * @param {LanguageType} type - The category: 'programming' | 'data' | 'markup' | 'prose'
 * @returns {string[]} Array of language names matching the type, or empty array if none found
 *
 * @example
 * const programmingLangs = getLanguagesByType('programming');
 * // => ['JavaScript', 'Python', 'TypeScript', 'Rust', ...]
 *
 * @example
 * const dataLangs = getLanguagesByType('data');
 * // => ['JSON', 'YAML', 'CSV', ...]
 *
 * @example
 * const markupLangs = getLanguagesByType('markup');
 * // => ['HTML', 'XML', 'Markdown', ...]
 *
 * @example
 * // @ts-ignore - invalid type
 * const invalid = getLanguagesByType('invalid');
 * // => []
 */
export function getLanguagesByType(type: LanguageType): string[] {
  return typesData[type] || [];
}

/**
 * Get potential language names for a given file path or filename.
 * Returns an array of language names because some extensions map to multiple languages (e.g., .rs → Rust, RenderScript).
 * Handles full paths, relative paths, exact filenames (like "Dockerfile"), and extensions.
 *
 * @param {string} fileName - File path, relative path, or filename (e.g., "main.ts", "/src/app/main.ts", "Dockerfile")
 * @param {LanguageType} [typeFilter] - Optional filter by category: 'programming' | 'data' | 'markup' | 'prose'
 * @returns {string[] | null} Array of language names (e.g., ['JavaScript']) or null if no match found
 *
 * @example
 * getLanguageByFileName('main.js')
 * // => ['JavaScript']
 *
 * @example
 * getLanguageByFileName('.gitignore')
 * // => ['Ignore List']
 *
 * @example
 * // Ambiguous extension - returns multiple candidates
 * getLanguageByFileName('shader.rs')
 * // => ['RenderScript', 'Rust', 'XML']
 *
 * @example
 * // Windows path with backslashes
 * getLanguageByFileName('C:\\Users\\Dev\\project\\style.css')
 * // => ['CSS']
 *
 * @example
 * // Filter excludes non-matching types
 * getLanguageByFileName('data.json', 'programming')
 * // => null (JSON is 'data' type, not 'programming')
 *
 * @example
 * // Unknown extension
 * getLanguageByFileName('file.unknownext')
 * // => null
 *
 * @example
 * // File without extension (unless exact match)
 * getLanguageByFileName('random_file_no_ext')
 * // => null
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
