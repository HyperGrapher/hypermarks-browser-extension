export type { BaseStorage } from './base/types';
export * from './impl';
// import { Dexie } from 'dexie';

// const db = new Dexie('MyDatabase');
// // tweets: '++id, tweetId, tweetUrl, tweetScreenshot',
// db.version(1).stores({
//   items: '++id,title,url,icon',
// });

// export { db };

export { db } from './dexie/db';
