/**
 * The categories used by GitHub Linguist.
 */
export type LanguageType = 'data' | 'programming' | 'markup' | 'prose';

/**
 * The Language Object returned by the API.
 */
export interface Language {
  /**
   * The pretty display name of the language (e.g., "C++", "JavaScript", "JSON").
   * Use this for UI labels.
   */
  name: string;

  /**
   * The category of the language.
   */
  type: LanguageType;

  /**
   * List of file extensions associated with this language (e.g., [".js", ".mjs"]).
   */
  extensions: string[];

  /**
   * List of specific filenames associated with this language (e.g., ["Jenkinsfile"]).
   */
  filenames: string[];

  /**
   * The parent group name, if applicable (e.g., "Shell" for "Alpine Abuild", "TypeScript" for "TSX").
   * Note: This refers to Linguist's inheritance grouping, not the 'type'.
   */
  group?: string;
}

/**
 * The shape of the generated 'languages.json'.
 * Key: Lowercase name (e.g. "javascript")
 * Value: The Language object
 */
export interface LanguagesMap {
  [languageKey: string]: Language;
}

/**
 * The shape of the generated 'extensions.json' and 'filenames.json'.
 * Key: The identifier (e.g. ".rs" or "Dockerfile")
 * Value: Array of lowercase language keys (e.g. ["rust", "renderscript"])
 */
export interface LookUpMap {
  [key: string]: string[];
}

/**
 * The shape of the generated 'types.json'.
 * Key: The type name (e.g. "programming", "data")
 * Value: Array of language names (e.g. ["JavaScript", "Python"])
 */
export interface TypeMap {
  [typeName: string]: string[];
}
