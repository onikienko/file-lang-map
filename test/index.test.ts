import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getLanguage, getLanguageByFileName, getLanguagesByType } from '../src';

// Ensure "src/generated" and JSON files inside the folder exist.
// if not - run 'npm run generate'
describe('file-lang-map Tests', () => {
  describe('getLanguage()', () => {
    it('should return a correct object for a lowercase key', () => {
      const lang = getLanguage('typescript');
      assert.ok(lang);
      assert.strictEqual(lang.name, 'TypeScript'); // Check display name
      assert.strictEqual(lang.type, 'programming');
      assert.ok(lang.extensions.includes('.ts'));
    });

    it('should be case-insensitive', () => {
      const lang = getLanguage('PyThOn');
      assert.ok(lang);
      assert.strictEqual(lang.name, 'Python');
    });

    it('should return null for an unknown language', () => {
      const lang = getLanguage('FakeLang123');
      assert.strictEqual(lang, null);
    });

    it('should return null for an empty string', () => {
      const lang = getLanguage('');
      assert.strictEqual(lang, null);
    });
  });

  describe('getLanguagesByType()', () => {
    it('should return an array of objects for a known type', () => {
      const languages = getLanguagesByType('programming');
      assert.ok(Array.isArray(languages));
      assert.ok(languages.length > 0);

      const js = languages.find((l) => l.name === 'JavaScript');
      assert.ok(js);
      assert.strictEqual(js.type, 'programming');
    });

    it('should return an empty array for unknown type', () => {
      // @ts-ignore - testing runtime safety for invalid input
      const languages = getLanguagesByType('aliens');
      assert.strictEqual(languages.length, 0);
    });
  });

  describe('getLanguageByFileName()', () => {
    it('should identify language by filename', () => {
      const names = getLanguageByFileName('main.ts');
      assert.ok(names);
      assert.ok(names.includes('TypeScript'));
    });

    it('should identify exact filenames (e.g. Dockerfile)', () => {
      const names = getLanguageByFileName('Dockerfile');
      assert.ok(names);
      assert.ok(names.includes('Dockerfile'));
    });

    it('should handle dotfiles (e.g. .gitignore)', () => {
      const names = getLanguageByFileName('.gitignore');
      assert.ok(names);
      assert.ok(names.includes('Ignore List'));
    });

    it('should handle Windows file paths with backslashes', () => {
      const names = getLanguageByFileName('C:\\Users\\Dev\\project\\style.css');
      assert.ok(names);
      assert.ok(names.includes('CSS'));
    });

    it('should handle file paths with forward slashes', () => {
      const names = getLanguageByFileName('user/home/project/index.html');
      assert.ok(names);
      assert.ok(names.includes('HTML'));
    });

    it('should handle filepath with mixed slashes', () => {
      const names = getLanguageByFileName('C:\\Users\\Dev/project/index.js');
      assert.ok(names);
      assert.ok(names.includes('JavaScript'));
    });

    it('should handle relative paths', () => {
      const names = getLanguageByFileName('../src/app/main.tsx');
      assert.ok(names);
      assert.ok(names.includes('TSX'));
    });

    it('should return multiple results for ambiguous extensions (.rs)', () => {
      const names = getLanguageByFileName('lib.rs');
      assert.ok(names);
      assert.ok(names.length >= 2, 'Should return multiple candidates for .rs');
      assert.ok(names.includes('Rust'));
      assert.ok(names.includes('RenderScript'));
    });

    it('should filter results by type', () => {
      // .h can be C (programming), C++ (programming), etc.
      const names = getLanguageByFileName('header.h', 'programming');
      assert.ok(names);
      assert.ok(names.includes('C++'));

      // Test a filter that should return null
      // JSON is 'data', so filtering by 'programming' should return null
      const empty = getLanguageByFileName('package.json', 'programming');
      assert.strictEqual(empty, null);
    });

    it('should return null for unknown extensions', () => {
      const result = getLanguageByFileName('image.fakeext');
      assert.strictEqual(result, null);
    });

    it('should return null for files without extension (unless exact match)', () => {
      const unknown = getLanguageByFileName('random_file_no_ext');
      assert.strictEqual(unknown, null);
    });
  });
});
