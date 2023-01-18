import { describe, it, expect } from 'vitest';
import { getFontSetting } from './TextTextureRendererUtils.mjs';

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
});
