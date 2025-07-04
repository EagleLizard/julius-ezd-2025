
import type { Stats } from 'node:fs';
import fsp, { constants } from 'node:fs/promises';

import { prim } from './validate-primitives';

export const files = {
  checkDir,
  mkdirIfNotExist,
} as const;

async function checkDir(dirPath: string): Promise<boolean> {
  let stats: Stats;
  try {
    /* by default check r/w _*/
    stats = await fsp.stat(dirPath, );
  } catch(e) {
    if(prim.isObject(e) && e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
  return stats.isDirectory();
}

async function mkdirIfNotExist(dirPath: string): Promise<string | undefined> {
  let dirExists = await checkDir(dirPath);
  if(dirExists) {
    return;
  }
  let res = await fsp.mkdir(dirPath, { recursive: true });
  return res;
}
