export type { BaseStorage } from './base/types';
export * from './impl';

export { db } from './dexie/db';
export { MARKS_CHANGED_ACTION, onMarksChanged } from './dexie/marks-changed';
export * from './dexie/dexie-types';
export { importDatabase, previewImport } from './dexie/import-export';
export type { ImportMode, ImportOptions, ImportPreviewCategory, ImportResult } from './dexie/import-export';
