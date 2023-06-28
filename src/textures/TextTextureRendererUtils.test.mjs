import { describe, it, expect } from 'vitest';
import { getFontSetting, tokenizeString, isSpace, isZeroWidthSpace, wrapText, measureText } from './TextTextureRendererUtils.mjs';

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

  describe('tokenizeString', () => {
    it('should split text into an array of specific tokens', () => {
      const tokenRegex = / +|\n|<b>|<\/b>/g;
      expect(tokenizeString(tokenRegex, "Hello <b>there</b>  world.\n")).toEqual(['Hello', ' ', '<b>', 'there', '</b>', '  ', 'world.', '\n']);
    })
  });

  /**
   * Mock context for testing measureText / wrapText
   */
  const contextMock = {
    measureText: (text) => {
      return {
        width: text.split('').reduce((acc, char) => {
          if (!isZeroWidthSpace(char)) {
            acc += 10;
          }
          return acc;
        }, 0)
      }
    }
  }

  describe('measureText', () => {
    it('should return 0 for an empty string', () => {
      expect(measureText(contextMock, '', 0)).toBe(0);
      expect(measureText(contextMock, '', 10)).toBe(0);
    });

    it('should return the width of a string', () => {
      expect(measureText(contextMock, 'abc', 0)).toBe(30);
      expect(measureText(contextMock, 'a b c', 0)).toBe(50);
    });

    it('should return the width of a string with letter spacing', () => {
      expect(measureText(contextMock, 'abc', 1)).toBe(33);
      expect(measureText(contextMock, 'a b c', 1)).toBe(55);
    });

    it('should not add letter spacing to zero-width spaces', () => {
      expect(measureText(contextMock, '\u200B', 1)).toBe(0);
      expect(measureText(contextMock, '\u200B\u200B', 1)).toBe(0);
      expect(measureText(contextMock, 'a\u200Bb\u200Bc', 1)).toBe(33);
    });
  });

  describe('wrapText', () => {
    it('should not break up text if it fits', () => {
      // No indent / no letter spacing
      expect(wrapText(contextMock, 'Hello World', 110, 0, 0)).to.deep.equal({
        l: ['Hello World'],
        n: []
      });
      // With indent
      expect(wrapText(contextMock, 'Hello World', 110 + 10, 0, 10)).to.deep.equal({
        l: ['Hello World'],
        n: []
      });
      // With letter spacing
      expect(wrapText(contextMock, 'Hello World', 110 + 11, 1, 0)).to.deep.equal({
        l: ['Hello World'],
        n: []
      });
    });
    it('should break up text if it doesn\'t fit on one line (1 pixel edge case)', () => {
      // No indent / no letter spacing
      expect(wrapText(contextMock, 'Hello World', 110 - 1 /* 1 less */, 0, 0)).to.deep.equal({
        l: ['Hello', 'World'],
        n: []
      });
      // With indent
      expect(wrapText(contextMock, 'Hello World', 110 + 10 - 1 /* 1 less */, 0, 10)).to.deep.equal({
        l: ['Hello', 'World'],
        n: []
      });
      // With letter spacing
      expect(wrapText(contextMock, 'Hello World', 110 + 11 - 1 /* 1 less */, 1, 0)).to.deep.equal({
        l: ['Hello', 'World'],
        n: []
      });
    });
    it('should produce indexes to real line breaks', () => {
      expect(wrapText(contextMock, 'Hello World', 50, 0, 0)).to.deep.equal({
        l: ['Hello', 'World'],
        n: []
      });

      expect(wrapText(contextMock, 'Hello\nWorld', 50, 0, 0)).to.deep.equal({
        l: ['Hello', 'World'],
        n: [1]
      });

      expect(wrapText(contextMock, 'Hello There\nWorld', 50, 0, 0)).to.deep.equal({
        l: ['Hello', 'There', 'World'],
        n: [2]
      });

      expect(wrapText(contextMock, 'Hello\nThere\nWorld', 50, 0, 0)).to.deep.equal({
        l: ['Hello', 'There', 'World'],
        n: [1, 2]
      });
    });

    it('should make the first line an empty string if the first character is a space or a line break', () => {
      expect(wrapText(contextMock, '\nHello\nThere\nWorld', 50, 0, 0)).to.deep.equal({
        l: ['', 'Hello', 'There', 'World'],
        n: [1, 2, 3]
      });

      expect(wrapText(contextMock, ' Hello\nThere\nWorld', 50, 0, 0)).to.deep.equal({
        l: ['', 'Hello', 'There', 'World'],
        n: [2, 3]
      });
    });

    it('should REMOVE one of the spaces in a sequence of spaces if a line is broken across it', () => {
      // Left
      expect(wrapText(contextMock, ' Hello', 50, 0, 0)).to.deep.equal({
        l: ['', 'Hello'],
        n: []
      });

      expect(wrapText(contextMock, '  Hello', 50, 0, 0)).to.deep.equal({
        l: [' ', 'Hello'],
        n: []
      });

      // Middle
      expect(wrapText(contextMock, 'Hello World', 50, 0, 0)).to.deep.equal({
        l: ['Hello', 'World'],
        n: []
      });

      expect(wrapText(contextMock, 'Hello  World', 50, 0, 0)).to.deep.equal({
        l: ['Hello', '', 'World'], // Since ther are two breaks 2 spaces are removed
        n: []
      });

      expect(wrapText(contextMock, 'Hello   World', 50, 0, 0)).to.deep.equal({
        l: ['Hello', ' ', 'World'], // Since ther are two breaks 2 spaces are removed
        n: []
      });

      // Right
      expect(wrapText(contextMock, 'World ', 50, 0, 0)).to.deep.equal({
        l: ['World', ''],
        n: []
      });

      expect(wrapText(contextMock, 'World  ', 50, 0, 0)).to.deep.equal({
        l: ['World', ' '],
        n: []
      });
    });

    it('should break up a single line of text into many lines based on varying wrapWidth, letterSpacing and indent', () => {
      // No indent / no letter spacing
      expect(wrapText(contextMock, "     Let's     start     Building!           ", 160, 0, 0)).to.deep.equal({
        l: [ "     Let's    ", 'start    ', 'Building!       ', '   ' ],
        n: []
      });
      expect(wrapText(contextMock, "     Let's     start     Building!           ", 120, 0, 0)).to.deep.equal({
        l: [ "     Let's  ", "  start    ", "Building!   ", "       " ],
        n: []
      });
      expect(wrapText(contextMock, "     Let's     start     Building!           ", 80, 0, 0)).to.deep.equal({
        l: [ "    ", "Let's   ", " start  ", " ", "Building!", "        ", " " ],
        n: []
      });
      // With indent
      expect(wrapText(contextMock, "    Let's     start     Building!           ", 160, 0, 10)).to.deep.equal({
        l: [ "    Let's    ", "start    ", "Building!       ", "   " ],
        n: []
      });
      expect(wrapText(contextMock, "   Let's     start     Building!           ", 160, 0, 20)).to.deep.equal({
        l: [ "   Let's    ", "start    ", "Building!       ", "   " ],
        n: []
      });
      expect(wrapText(contextMock, "  Let's     start     Building!           ", 160, 0, 30)).to.deep.equal({
        l: [ "  Let's    ", "start    ", "Building!       ", "   " ],
        n: []
      });
      // With letter spacing
      expect(wrapText(contextMock, "     Let's     start     Building!           ", 160, 1, 0)).to.deep.equal({
        l: [ "     Let's    ", "start    ", "Building!     ", "     " ],
        n: []
      });
      expect(wrapText(contextMock, "     Let's     start     Building!           ", 160, 5, 0)).to.deep.equal({
        l: [ "     Let's", "    start ", "  ", "Building! ", "         " ],
        n: []
      });
    });

    it('should support wrapping on zero-width spaces', () => {
      expect(wrapText(contextMock, 'H\u200Be\u200Bl\u200Bl\u200Bo\u200BW\u200Bo\u200Br\u200Bl\u200Bd', 10, 0, 0)).to.deep.equal({
        l: ['H', 'e', 'l', 'l', 'o', 'W', 'o', 'r', 'l' , 'd'],
        n: []
      });

      expect(wrapText(contextMock, 'H\u200Be\u200Bl\u200Bl\u200Bo\u200BW\u200Bo\u200Br\u200Bl\u200Bd', 20, 0, 0)).to.deep.equal({
        l: ['H\u200Be', 'l\u200Bl', 'o\u200BW', 'o\u200Br', 'l\u200Bd'],
        n: []
      });

      expect(wrapText(contextMock, 'H\u200Be\u200Bl\u200Bl\u200Bo\u200BW\u200Bo\u200Br\u200Bl\u200Bd', 50, 0, 0)).to.deep.equal({
        l: ['H\u200Be\u200Bl\u200Bl\u200Bo', 'W\u200Bo\u200Br\u200Bl\u200Bd'],
        n: []
      });
    });
  });

});
