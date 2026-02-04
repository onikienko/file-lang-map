import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { rollup } from 'rollup';
import path from 'node:path';
import fs from 'node:fs';

const DIST_PATH = path.resolve(__dirname, '../dist/index.mjs');

describe('Tree Shaking Support with Rollup', () => {
  if (!fs.existsSync(DIST_PATH)) {
    console.warn(`Skipping tree-shaking tests: ${DIST_PATH} not found. Run build first.`);
    return;
  }

  it('should remove unused functions and JSONs from the bundle', async () => {
    // Create a virtual entry that ONLY imports 'getLanguage'
    const virtualEntry = `
      import { getLanguage } from '${DIST_PATH}';
      console.log(getLanguage('typescript'));
    `;

    // Bundle using Rollup
    const bundle = await rollup({
      input: 'virtual-entry.js',
      onwarn: (warning, warn) => {
        // Ignore unresolved import warnings for the virtual file itself
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        warn(warning);
      },
      plugins: [
        {
          name: 'virtual-entry-plugin',
          resolveId(id) {
            return id === 'virtual-entry.js' ? id : null;
          },
          load(id) {
            return id === 'virtual-entry.js' ? virtualEntry : null;
          },
        },
      ],
    });

    const { output } = await bundle.generate({ format: 'es' });
    const code = output[0].code;

    // strings for assertion are found in /dist/index.mjs

    // Ensure the used function is present
    assert.ok(code.includes('function getLanguage(') && code.includes('TypeScript'));

    // Ensure the unused functions is absent
    assert.ok(!code.includes('function getLanguagesByType('));
    assert.ok(!code.includes('function getLanguageByFileName('));

    // Ensure the unused JSONs are absent
    assert.ok(!code.includes('var extensions_default'));
    assert.ok(!code.includes('var filenames_default'));
    assert.ok(!code.includes('var types_default'));
  });
});
