import { removeHtmlTags, replaceTagToAnchor, replaceURLToAnchor } from './messageSanitizer';

describe('messageSanitizer', () => {
  describe('replaceURLToAnchor', () => {
    it('should extract all URLs and replace them to anchor', () => {
      const test = 'ABC https://abc.com #XYZ https://xyz.com';
      const result = replaceURLToAnchor(test);

      expect(result).toBe(
        'ABC <a href="https://abc.com" target="_blank" rel="noopener noreferrer">https://abc.com</a> #XYZ <a href="https://xyz.com" target="_blank" rel="noopener noreferrer">https://xyz.com</a>'
      );
    });

    it('should extract URLs with chinese charaters', () => {
      const test = 'ABC中文 https://abc.com/中文 中文 #XYZ https://繁中.com/中文?name=壹貳參';
      const result = replaceURLToAnchor(test);

      expect(result).toBe(
        'ABC中文 <a href="https://abc.com/中文" target="_blank" rel="noopener noreferrer">https://abc.com/中文</a> 中文 #XYZ <a href="https://繁中.com/中文?name=壹貳參" target="_blank" rel="noopener noreferrer">https://繁中.com/中文?name=壹貳參</a>'
      );
    });

    it('should extract URLs with long top level domain', () => {
      const test = 'ABC中文 https://abc.network 中文 #XYZ https://繁中.network/中文?name=壹貳參';
      const result = replaceURLToAnchor(test);

      expect(result).toBe(
        'ABC中文 <a href="https://abc.network" target="_blank" rel="noopener noreferrer">https://abc.network</a> 中文 #XYZ <a href="https://繁中.network/中文?name=壹貳參" target="_blank" rel="noopener noreferrer">https://繁中.network/中文?name=壹貳參</a>'
      );
    });
  });

  describe('replaceTagToAnchor', () => {
    it('should replace hash tag to anchor', () => {
      const test = 'ABC #xyz XYZ #abc';
      const result = replaceTagToAnchor(test);

      expect(result).toBe(
        'ABC <a href="/hashtag/xyz">#xyz</a> XYZ <a href="/hashtag/abc">#abc</a>'
      );
    });

    it('should replace a mixed Chinese and English hash tag to anchor', () => {
      const test = 'ABC #xyz XYZ #abc #中文 #中_文';
      const result = replaceTagToAnchor(test);

      expect(result).toBe(
        'ABC <a href="/hashtag/xyz">#xyz</a> XYZ <a href="/hashtag/abc">#abc</a> <a href="/hashtag/中文">#中文</a> <a href="/hashtag/中_文">#中_文</a>'
      );
    });

    it('should replace a mixed Chinese and alphanumeric hash tag to anchor', () => {
      const test = 'ABC #xyz XYZ #abc2 #中文 #中_文';
      const result = replaceTagToAnchor(test);

      expect(result).toBe(
        'ABC <a href="/hashtag/xyz">#xyz</a> XYZ <a href="/hashtag/abc2">#abc2</a> <a href="/hashtag/中文">#中文</a> <a href="/hashtag/中_文">#中_文</a>'
      );
    });
  });

  describe('removeHtmlTags', () => {
    it('should remove all html tags', () => {
      const test = '<p>abc</p>, <a href="#>xyz</a> ABC';
      const result = removeHtmlTags(test);

      expect(result).toBe('abc, xyz ABC');
    });
  });
});

// Use an empty export to please Babel's single file emit.
// https://github.com/Microsoft/TypeScript/issues/15230
export {};
