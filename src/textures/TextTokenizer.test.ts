import { describe, it, expect, vi, beforeEach } from 'vitest';
import TextTokenizer from './TextTokenizer';

describe('TextTokenizer', () => {
  beforeEach(() => {
    TextTokenizer.setCustomTokenizer();
  });

  it('should tokenize simple ASCII text into words and spaces', () => {
    const input = 'Hello world!';
    const result = TextTokenizer.defaultTokenizer(input);
    expect(result).toEqual([
      { tokens: ['Hello', ' ', 'world!'] }
    ]);
  });

  it('should handle text with only spaces', () => {
    const input = '   ';
    const result = TextTokenizer.defaultTokenizer(input);
    expect(result).toEqual([
      { tokens: [' ', ' ', ' '] }
    ]);
  });

  it('should handle empty string', () => {
    const input = '';
    const result = TextTokenizer.defaultTokenizer(input);
    expect(result).toEqual([
      { tokens: [] }
    ]);
  });

  it('should use custom tokenizer if set', () => {
    const custom = vi.fn((text) => [{ tokens: ['custom', text] }]);
    TextTokenizer.setCustomTokenizer(custom);
    const tokenizer = TextTokenizer.getTokenizer();
    const result = tokenizer('abc');
    expect(custom).toHaveBeenCalledWith('abc');
    expect(result).toEqual([{ tokens: ['custom', 'abc'] }]);
  });

  it('should fallback to default tokenizer for ASCII when detectASCII is true', () => {
    const custom = vi.fn((text) => [{ tokens: ['custom', text] }]);
    TextTokenizer.setCustomTokenizer(custom, true);
    const tokenizer = TextTokenizer.getTokenizer();
    // ASCII input uses default
    const asciiResult = tokenizer('Hello world');
    expect(asciiResult).toEqual([
      { tokens: ['Hello', ' ', 'world'] }
    ]);
    // Non-ASCII input uses custom
    const nonAsciiResult = tokenizer('مرحبا');
    expect(nonAsciiResult).toEqual([{ tokens: ['custom', 'مرحبا'] }]);
  });

  it('should detect only ASCII text', () => {
    expect(TextTokenizer.containsOnlyASCII('Hello')).toBe(true);
    expect(TextTokenizer.containsOnlyASCII('Hello world!')).toBe(true);
    expect(TextTokenizer.containsOnlyASCII('مرحبا')).toBe(false);
    expect(TextTokenizer.containsOnlyASCII('你好')).toBe(false);
    expect(TextTokenizer.containsOnlyASCII('Hello – “quotes”')).toBe(true);
    expect(TextTokenizer.containsOnlyASCII('Hello 好')).toBe(false);
  });

  it('should tokenize text with zero-width space', () => {
    const input = 'foo\u200Bbar';
    const result = TextTokenizer.defaultTokenizer(input);
    expect(result).toEqual([
      { tokens: ['foo', 'bar'] }
    ]);
  });
});