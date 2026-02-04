import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const paths = ['dist', 'src/generated'];

for (const p of paths) {
  rmSync(resolve(process.cwd(), p), { recursive: true, force: true });
}
