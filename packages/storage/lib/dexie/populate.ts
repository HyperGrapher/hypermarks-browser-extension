import { db } from './db';

export async function populate() {
  const categoryId = await db.categories.add({
    category: 'Default Category',
  });

  // const youtubeChannelId = await db.ytChannels.add({
  //   channelName: '',
  //   avatar: '',
  //   banner: '',
  //   description: '',
  //   subcriberCount: '',
  //   videoCount: '',
  //   isSubscribed: true,
  // })

  // const tabid = await db.tabs.bulkAdd([
  //   {
  //     categoryId,
  //     title: 'Test title',
  //     url: 'https://test.com',
  //     icon: 'test',
  //     description: 'Test description',
  //     tags: ['test'],
  //     origin: 'test',
  //     note: 'test',
  //     itemType: 'other',
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   },
  // ]);
}
