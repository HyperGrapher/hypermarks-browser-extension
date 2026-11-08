import { describe, expect, it } from 'vitest';
import { pageKey } from '../../chrome-extension/src/background/saved-page-indicator';

describe('pageKey', () => {
  it('ignores the hash, www. and the trailing slash', () => {
    expect(pageKey('https://www.example.com/')).toBe('example.com');
    expect(pageKey('https://example.com/blog/post/#comments')).toBe('example.com/blog/post');
    expect(pageKey('https://Example.com/blog/post')).toBe(pageKey('https://www.example.com/blog/post/'));
  });

  it('keeps the query of regular pages', () => {
    expect(pageKey('https://example.com/search?q=hyper')).toBe('example.com/search?q=hyper');
    expect(pageKey('https://example.com/search?q=hyper')).not.toBe(pageKey('https://example.com/search?q=other'));
  });

  it('returns null for pages that can never be saved', () => {
    expect(pageKey('chrome://extensions')).toBeNull();
    expect(pageKey('about:blank')).toBeNull();
    expect(pageKey('chrome-extension://abc/popup/index.html')).toBeNull();
    expect(pageKey('not a url')).toBeNull();
    expect(pageKey('')).toBeNull();
  });

  describe('YouTube', () => {
    const key = 'youtube.com/watch?v=sYSP_elDdZw';

    it('keeps only the video id of a watch page', () => {
      expect(pageKey('https://www.youtube.com/watch?v=sYSP_elDdZw')).toBe(key);
      expect(pageKey('https://www.youtube.com/watch?v=sYSP_elDdZw&t=42s&list=PL123&index=2')).toBe(key);
    });

    it('treats a youtu.be link as the same video', () => {
      expect(pageKey('https://youtu.be/sYSP_elDdZw')).toBe(key);
    });

    it('keeps only the list id of a playlist page', () => {
      expect(pageKey('https://www.youtube.com/playlist?list=PL123&si=tracking')).toBe(
        'youtube.com/playlist?list=PL123',
      );
    });
  });

  describe('X / Twitter', () => {
    it('uses the path and drops tracking params', () => {
      expect(pageKey('https://x.com/someone/status/123?s=20')).toBe('x.com/someone/status/123');
      expect(pageKey('https://twitter.com/someone/status/123?t=abc')).toBe('x.com/someone/status/123');
      expect(pageKey('https://www.x.com/someone/')).toBe('x.com/someone');
    });
  });
});
