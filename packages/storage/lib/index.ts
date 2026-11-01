export type { BaseStorage } from './base/types';
export * from './impl';

export { db } from './dexie/db';
export * from './dexie/dexie-types';
export { importDatabase } from './dexie/import-export';
export type { ImportMode, ImportResult } from './dexie/import-export';
