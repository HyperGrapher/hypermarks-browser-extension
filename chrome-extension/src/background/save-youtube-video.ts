import { db } from '@extension/storage';
import type { YouTube } from '@extension/storage';

const DEFAULT_CATEGORY = 'Uncategorized';
const YOUTUBE_ORIGIN = 'https://www.youtube.com';

/**
 * Saves a video scraped from a YouTube recommendation card (not the active tab).
 * Mirrors what `saveDexieTab` stores for a `yt-video` item, using the default category.
 */
export async function saveYoutubeVideo(videoId: string, video: YouTube.Video): Promise<number> {
  const now = new Date();

  return db.transaction('rw', [db.categories, db.marks, db.yt_videos], async () => {
    let categoryId = (await db.categories.where('category').equals(DEFAULT_CATEGORY).first())?.id;
    if (!categoryId) {
      categoryId = await db.categories.add({ category: DEFAULT_CATEGORY });
    }

    const markId = await db.marks.add({
      categoryId,
      title: video.title || 'Untitled',
      description: video.description,
      origin: YOUTUBE_ORIGIN,
      url: `${YOUTUBE_ORIGIN}/watch?v=${videoId}`,
      icon: `${YOUTUBE_ORIGIN}/favicon.ico`,
      note: '',
      tags: [],
      itemType: 'yt-video',
      createdAt: now,
      updatedAt: now,
    });

    await db.yt_videos.add({ ...video, mark_id: markId });

    return markId;
  });
}
