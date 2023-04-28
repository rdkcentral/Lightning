import { describe, it, expect } from 'vitest';
import { getFontSetting, splitWords, isSpace, isZeroWidthSpace } from './TextTextureRendererUtils.mjs';

describe('TextTextureRendererUtils', () => {
  describe('getFontSetting', () => {
    it('should form a valid CSS font string', () => {
      expect(getFontSetting('Arial', 'normal', 12, 1, 'Default')).toBe('normal 12px "Arial"');
      expect(getFontSetting('Times New Roman', 'bold', 30, 1, 'Default')).toBe('bold 30px "Times New Roman"');
    });
    it('should adjust font size for precision', () => {
      expect(getFontSetting('Arial', 'normal', 12, 2, 'Default')).toBe('normal 24px "Arial"');
    });
    it('should support "serif" and "sans-serif" specially', () => {
      expect(getFontSetting('serif', 'italic', 12, 1, 'Default')).toBe('italic 12px serif');
      expect(getFontSetting('sans-serif', 'normal', 12, 1, 'Default')).toBe('normal 12px sans-serif');
    });
    it('should default to the defaultFontFace if fontFace is null', () => {
      expect(getFontSetting(null, 'normal', 12, 1, 'Default')).toBe('normal 12px "Default"');
      expect(getFontSetting([null], 'normal', 12, 1, 'Default')).toBe('normal 12px "Default"');
    });
    it('should defaultFontFace should also handle "serif" and "sans-serif" specially', () => {
      expect(getFontSetting(null, 'normal', 12, 1, 'serif')).toBe('normal 12px serif');
      expect(getFontSetting([null], 'normal', 12, 1, 'sans-serif')).toBe('normal 12px sans-serif');
    });
    it('should support an array of fonts', () => {
      expect(getFontSetting(['Arial'], 'normal', 12, 1, 'Default')).toBe('normal 12px "Arial"');
      expect(getFontSetting(['serif', 'Arial'], 'italic', 12, 1, 'Default')).toBe('italic 12px serif,"Arial"');
      expect(getFontSetting(['serif', 'Arial', null], 'bold', 12, 1, 'Default')).toBe('bold 12px serif,"Arial","Default"');
    });
  });

  describe('splitWords', () => {
    it('should split on regular spaces', () => {
      expect(splitWords('Hello There World')).toEqual(["", "Hello", " ", "There", " ", "World"]);
      expect(splitWords('Hello  There   World')).toEqual(["", "Hello", "  ", "There", "   ", "World"]);

    });
    it('should split on zero-width spaces', () => {
      expect(splitWords('Hello\u200BThere\u200BWorld')).toEqual(["", "Hello", "\u200B", "There", "\u200B", "World"]);
      expect(splitWords('Hello\u200B\u200BThere\u200B\u200B\u200BWorld')).toEqual(["", "Hello", "\u200B\u200B", "There", "\u200B\u200B\u200B", "World"]);
    });
    it('should split on a combo of spaces and zero-width spaces', () => {
      expect(splitWords('Hello\u200B There \u200B World')).toEqual(["", "Hello", "\u200B ", "There", " \u200B ", "World"]);
    });
    it('should capture the first group of spaces if the string begins with spaces', () => {
      expect(splitWords(' Hello There World')).toEqual([" ", "Hello", " ", "There", " ", "World"]);
      expect(splitWords(' \u200BHello There World')).toEqual([" \u200B", "Hello", " ", "There", " ", "World"]);
    });
  });

  describe('isZeroWidthSpace', () => {
    it('should return true for empty string', () => {
      expect(isZeroWidthSpace('')).toBe(true);
    });
    it('should return true for zero-width space', () => {
      expect(isZeroWidthSpace('\u200B')).toBe(true);
    });
    it('should return false for non-zero-width space', () => {
      expect(isZeroWidthSpace(' ')).toBe(false);
      expect(isZeroWidthSpace('a')).toBe(false);
    });
  });

  describe('isSpace', () => {
    it('should return true for empty string', () => {
      expect(isSpace('')).toBe(true);
    });
    it('should return true for zero-width space', () => {
      expect(isSpace('\u200B')).toBe(true);
    });
    it('should return true for regular space', () => {
      expect(isSpace(' ')).toBe(true);
    });
    it('should return false for non-space', () => {
      expect(isSpace('a')).toBe(false);
    });
  });

});
