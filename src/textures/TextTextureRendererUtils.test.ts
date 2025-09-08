import { describe, it, expect, vi } from 'vitest';
import {
  getFontSetting,
  wrapText,
  getSuffix,
  measureText,
  breakWord,
} from './TextTextureRendererUtils';

// Mocking CanvasRenderingContext2D for testing
const mockContext = {
  measureText: vi.fn((text) => ({ width: text.length * 10 })),
} as unknown as CanvasRenderingContext2D;

describe('TextTextureRendererUtils', () => {
  describe('getFontSetting', () => {
    it('should return correct font setting string', () => {
      const result = getFontSetting(['Arial'], 'normal', 16, 1, 'sans-serif');
      expect(result).toBe('normal 16px Arial');
    });

    it('should return correct font setting quoted string', () => {
      const result = getFontSetting(['My Font'], 'normal', 16, 1, 'sans-serif');
      expect(result).toBe('normal 16px "My Font"');
    });

    it('should handle null fontFace and use default', () => {
      const result = getFontSetting(null, 'italic', 20, 1, 'sans-serif');
      expect(result).toBe('italic 20px sans-serif');
    });
  });

  describe('wrapText', () => {
    it('should wrap text correctly within the given width', () => {
      const result = wrapText(mockContext, 'This is a test', 50, 0, 0, 0, '', false);
      expect(result).toEqual([
        { text: 'This ', width: 50 },
        { text: 'is a ', width: 50 },
        { text: 'test', width: 40 },
      ]);
    });

    describe('long words', () => {
      it('should let words overflow without wordBreak', () => {
        const result = wrapText(mockContext, 'A longword !', 30, 0, 0, 0, '', false);
        expect(result).toEqual([
          { text: 'A ', width: 20 },
          { text: 'longword', width: 80 },
          { text: '!', width: 10 },
        ]);
      });

      it('should break long words with wordBreak', () => {
        const result = wrapText(mockContext, 'A longword !', 30, 0, 0, 0, '', true);
        expect(result).toEqual([
          { text: 'A ', width: 20 },
          { text: 'lon', width: 30 },
          { text: 'gwo', width: 30 },
          { text: 'rd ', width: 30 },
          { text: '!', width: 10 },
        ]);
      });
    });
  });

  describe('getSuffix', () => {
    it('should return correct suffix for wordWrap', () => {
      const result = getSuffix('...', null, true);
      expect(result).toEqual({ suffix: '...', nowrap: false });
    });

    it('should return correct suffix for textOverflow', () => {
      const result = getSuffix('...', 'ellipsis', false);
      expect(result).toEqual({ suffix: '...', nowrap: true });
    });

    it('should return correct suffix for textOverflow', () => {
      const result = getSuffix('...', 'ellipsis', true);
      expect(result).toEqual({ suffix: '...', nowrap: false });
    });

    it('should return correct suffix for textOverflow', () => {
      const result = getSuffix('...', '???', false);
      expect(result).toEqual({ suffix: '???', nowrap: true });
    });

    it('should return correct suffix for textOverflow', () => {
      const result = getSuffix('...', '???', true);
      expect(result).toEqual({ suffix: '...', nowrap: false });
    });
  });

  describe('measureText', () => {
    it('should measure text width correctly', () => {
      const result = measureText(mockContext, 'test', 2);
      expect(result).toBe(40 + 8); // 40 for text + 8 for spacing
    });
  });

  describe('breakWord', () => {
    it('should break a word into smaller parts if it exceeds max width', () => {
      const result = breakWord(mockContext, 'longword', 30, 0);
      expect(result).toEqual([
        { text: 'lon', width: 30 },
        { text: 'gwo', width: 30 },
        { text: 'rd', width: 20 },
      ]);
    });
  });
});