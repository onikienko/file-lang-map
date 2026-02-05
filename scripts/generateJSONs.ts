import yaml from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// --- Interfaces for the incoming YAML ---
interface LinguistDef {
  type: string;
  extensions?: string[];
  filenames?: string[];
  group?: string;
}

interface LinguistYaml {
  [languageName: string]: LinguistDef;
}

const URL = 'https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml';
const OUTPUT_DIR = path.resolve(__dirname, '../src/generated');
const LOCK_FILE = path.resolve(__dirname, '../linguist-lock.json');

async function generateJSONs() {
  console.log('Downloading languages.yml...');

  const response = await fetch(URL);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
  const yamlText = await response.text();

  // Calculate Hash
  const hash = crypto.createHash('sha256').update(yamlText).digest('hex');

  const rawLanguages = yaml.load(yamlText) as LinguistYaml;

  console.log('Processing data...');

  // The Master Database
  // Key: lowercase (e.g. "rust") -> Value: { name: "Rust", type: "programming", ... }
  const languagesDB: Record<string, any> = {};

  // Indices
  // Key: identifier (e.g. ".rs") -> Value: lowercase keys (e.g. ["rust", "renderscript"])
  const extensionIndex: Record<string, string[]> = {};
  const filenameIndex: Record<string, string[]> = {};

  // Type Index (Refactored from "groups")
  // Key: 'programming' -> Value: ['JavaScript', 'Python', ...]
  const typesDB: Record<string, string[]> = {
    data: [],
    programming: [],
    markup: [],
    prose: [],
  };

  for (const [originalName, def] of Object.entries(rawLanguages)) {
    const key = originalName.toLowerCase();

    languagesDB[key] = {
      name: originalName,
      type: def.type,
      extensions: def.extensions || [],
      filenames: def.filenames || [],
      ...(def.group && { group: def.group }),
    };

    // Build Extension Index
    if (def.extensions) {
      for (const ext of def.extensions) {
        if (!extensionIndex[ext]) extensionIndex[ext] = [];
        extensionIndex[ext].push(key);
      }
    }

    // Build Filename Index
    if (def.filenames) {
      for (const file of def.filenames) {
        if (!filenameIndex[file]) filenameIndex[file] = [];
        filenameIndex[file].push(key);
      }
    }

    // Build Type Index (e.g. "programming")
    if (def.type && typesDB[def.type]) {
      typesDB[def.type].push(originalName);
    }
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const writeJson = (name: string, data: any) =>
    fs.writeFileSync(path.join(OUTPUT_DIR, name), JSON.stringify(data, null, 2));

  writeJson('languages.json', languagesDB);
  writeJson('extensions.json', extensionIndex);
  writeJson('filenames.json', filenameIndex);
  writeJson('types.json', typesDB);

  console.log('✅ Generation complete! Files saved to:', OUTPUT_DIR);

  // Update Lockfile if changed
  let currentHash = '';
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
      currentHash = lockData.hash;
    } catch (e) {
      // ignore
    }
  }

  if (currentHash !== hash) {
    fs.writeFileSync(LOCK_FILE, JSON.stringify({ hash }, null, 2));
    console.log('🔒 Lock file updated:', LOCK_FILE);
  } else {
    console.log('🔒 Lock file is up to date.');
  }
}

generateJSONs().catch(console.error);
