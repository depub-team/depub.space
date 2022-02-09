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
  });

  describe('replaceTagToAnchor', () => {
    it('should replace hash tag to anchor', () => {
      const test = 'ABC #xyz XYZ #abc';
      const result = replaceTagToAnchor(test);

      expect(result).toBe(
        'ABC <a href="/tags?name=xyz">#xyz</a> XYZ <a href="/tags?name=abc">#abc</a>'
      );
    });

    it('should replace a mixed Chinese and English hash tag to anchor', () => {
      const test = 'ABC #xyz XYZ #abc #中文 #中_文';
      const result = replaceTagToAnchor(test);

      expect(result).toBe(
        'ABC <a href="/tags?name=xyz">#xyz</a> XYZ <a href="/tags?name=abc">#abc</a> <a href="/tags?name=中文">#中文</a> <a href="/tags?name=中">#中</a>_文'
      );
    });

    it('should replace a mixed Chinese and alphanumeric hash tag to anchor', () => {
      const test = 'ABC #xyz XYZ #abc2 #中文 #中_文';
      const result = replaceTagToAnchor(test);

      expect(result).toBe(
        'ABC <a href="/tags?name=xyz">#xyz</a> XYZ <a href="/tags?name=abc2">#abc2</a> <a href="/tags?name=中文">#中文</a> <a href="/tags?name=中">#中</a>_文'
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
