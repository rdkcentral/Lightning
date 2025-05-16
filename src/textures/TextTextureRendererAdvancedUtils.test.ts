import {
  extractTags,
  createLineStyle,
  layoutSpans,
  trimWordEnd,
  trimWordStart,
  renderLines,
} from "./TextTextureRendererAdvancedUtils";
import { describe, it, expect, vi, beforeAll } from "vitest";

// Mocking CanvasRenderingContext2D for layoutSpans and renderLines tests
const mockCtx = {
  measureText: vi.fn((text) => ({ width: text.length * 10 })),
  fillText: vi.fn(),
  font: "",
  fillStyle: "",
};

// Test extractTags
describe("extractTags", () => {
  it("should extract tags and replace them with direction-weak characters", () => {
    const input = "<b>Hello</b> <color=0xffcc6600>World</color>";
    const { tags, output } = extractTags(input);
    expect(tags).toEqual([
      "<i>",
      "</i>",
      "<b>",
      "</b>",
      "</color>",
      "<color=0xffcc6600>",
    ]);
    expect(output).toBe(
      "\u200B\u2462\u200BHello\u200B\u2463\u200B \u200B\u2465\u200BWorld\u200B\u2464\u200B"
    );
  });
});

// Test createLineStyle
describe("createLineStyle", () => {
  let lineStyle: ReturnType<typeof createLineStyle>;

  beforeAll(() => {
    lineStyle = createLineStyle(
      [
        "<i>",
        "</i>",
        "<b>",
        "</b>",
        "</color>",
        "<color=0xffcc6600>",
        "<color=0x800066cc>",
      ],
      "Arial",
      0xffff0000
    );
  });

  it('should report if styling is enabled', () => {
    expect(lineStyle.isStyled).toBe(true);

    const unstyled = createLineStyle([], "Arial", 0xffff0000);
    expect(unstyled.isStyled).toBe(false);
  });

  it("should provide a default style", () => {
    expect(lineStyle.baseStyle.font).toBe("Arial");
    expect(lineStyle.baseStyle.color).toBe("rgba(255,0,0,1.0000)");
  });

  it("should allow setting bold style", () => {
    lineStyle.updateStyle(0x2460 + 2); // <b>
    expect(lineStyle.getStyle().font).toBe("bold Arial");

    lineStyle.updateStyle(0x2460 + 2); // <b>
    expect(lineStyle.getStyle().font).toBe("bold Arial");

    lineStyle.updateStyle(0x2460 + 3); // </b> - but we are still inside a <b> tag
    expect(lineStyle.getStyle().font).toBe("bold Arial");

    lineStyle.updateStyle(0x2460 + 3); // </b>
    expect(lineStyle.getStyle().font).toBe("Arial");
  });

  it("should allow setting italic style", () => {
    lineStyle.updateStyle(0x2460 + 0); // <i>
    expect(lineStyle.getStyle().font).toBe("italic Arial");

    lineStyle.updateStyle(0x2460 + 0); // <i>
    expect(lineStyle.getStyle().font).toBe("italic Arial");

    lineStyle.updateStyle(0x2460 + 1); // </i> - but we are still inside a <i> tag
    expect(lineStyle.getStyle().font).toBe("italic Arial");

    lineStyle.updateStyle(0x2460 + 1); // </i>
    expect(lineStyle.getStyle().font).toBe("Arial");
  });

  it("should allow setting both italic and bold styles", () => {
    lineStyle.updateStyle(0x2460 + 0); // <i>
    expect(lineStyle.getStyle().font).toBe("italic Arial");

    lineStyle.updateStyle(0x2460 + 2); // <b>
    expect(lineStyle.getStyle().font).toBe("bold italic Arial");

    lineStyle.updateStyle(0x2460 + 1); // </i>
    expect(lineStyle.getStyle().font).toBe("bold Arial");

    lineStyle.updateStyle(0x2460 + 3); // </b>
    expect(lineStyle.getStyle().font).toBe("Arial");
  });

  it("should allow setting color", () => {
    lineStyle.updateStyle(0x2460 + 5); // <color=0xffcc6600>
    expect(lineStyle.getStyle().color).toBe("rgba(204,102,0,1.0000)");

    lineStyle.updateStyle(0x2460 + 6); // <color=0x800066cc>
    expect(lineStyle.getStyle().color).toBe("rgba(0,102,204,0.5020)");

    lineStyle.updateStyle(0x2460 + 4); // </color>
    expect(lineStyle.getStyle().color).toBe("rgba(204,102,0,1.0000)");

    lineStyle.updateStyle(0x2460 + 4); // </color>
    expect(lineStyle.getStyle().color).toBe("rgba(255,0,0,1.0000)");
  });
});

// Test layoutSpans
describe("layoutSpans", () => {
  it("should layout spans into lines", () => {
    const spans = [{ tokens: ["Hello", " ", "World"] }];
    const lineStyle = createLineStyle([], "Arial", 0xffff0000);
    const lines = layoutSpans(
      mockCtx as unknown as CanvasRenderingContext2D,
      spans,
      lineStyle,
      200,
      0,
      1,
      "...",
      false,
      false
    );
    expect(lines.length).toBe(1);
    expect(lines[0]!.words[0]!.style).toBeUndefined();
    expect(lines[0]!.words[0]!.text).toBe("Hello");
    expect(lines[0]!.words[1]!.text).toBe(" ");
    expect(lines[0]!.words[2]!.text).toBe("World");
    expect(lines[0]!.words.length).toBe(3);
    expect(lines[0]!.width).toBe(110);
  });

  it("should layout spans into lines with styling", () => {
    const spans = [{ tokens: ["\u2460", "Hello", "\u2461", " ", "World"] }];
    const lineStyle = createLineStyle(["<i>", "</i>"], "Arial", 0xffff0000);
    const lines = layoutSpans(
      mockCtx as unknown as CanvasRenderingContext2D,
      spans,
      lineStyle,
      200,
      0,
      1,
      "...",
      false,
      false
    );
    expect(lines.length).toBe(1);

    expect(lines[0]!.words[0]!.style).toMatchObject({
      font: "italic Arial",
      color: "rgba(255,0,0,1.0000)",
    });
    expect(lines[0]!.words[0]!.text).toBe("Hello");

    expect(lines[0]!.words[1]!.style).toMatchObject({
      font: "Arial",
      color: "rgba(255,0,0,1.0000)",
    });
    expect(lines[0]!.words[1]!.text).toBe(" ");

    expect(lines[0]!.words[2]!.text).toBe("World");
    expect(lines[0]!.words.length).toBe(3);
    expect(lines[0]!.width).toBe(110);
  });
});

// Test trimWordEnd
describe("trimWordEnd", () => {
  it("should trim the end of a word", () => {
    let result = trimWordEnd("Hello", false);
    expect(result).toBe("Hell");
    result = trimWordEnd(result, false);
    expect(result).toBe("Hel");
    result = trimWordEnd(result, false);
    expect(result).toBe("He");
    result = trimWordEnd(result, false);
    expect(result).toBe("H");
    result = trimWordEnd(result, false);
    expect(result).toBe("");
    result = trimWordEnd(result, false);
    expect(result).toBe("");
  });

  it("should trim the end of a RTL word", () => {
    let result = trimWordEnd(".(!ביותר", true);
    expect(result).toBe("(!ביותר");
    result = trimWordEnd(result, true);
    expect(result).toBe("!ביותר");
    result = trimWordEnd(result, true);
    expect(result).toBe("ביותר");
    result = trimWordEnd(result, true);
    expect(result).toBe("ביות");
    result = trimWordEnd(result, true);
    expect(result).toBe("ביו");
    result = trimWordEnd(result, true);
    expect(result).toBe("בי");
    result = trimWordEnd(result, true);
    expect(result).toBe("ב");
    result = trimWordEnd(result, true);
    expect(result).toBe("");
    result = trimWordEnd(result, true);
    expect(result).toBe("");
  });
});

// Test trimWordStart
describe("trimWordStart", () => {
  it("should trim the start of a word", () => {
    let result = trimWordStart("Hello", false);
    expect(result).toBe("ello");
    result = trimWordStart(result, false);
    expect(result).toBe("llo");
    result = trimWordStart(result, false);
    expect(result).toBe("lo");
    result = trimWordStart(result, false);
    expect(result).toBe("o");
    result = trimWordStart(result, false);
    expect(result).toBe("");
    result = trimWordStart(result, false);
  });

  it("should trim the start of a RTL word", () => {
    let result = trimWordStart('("Hello', true);
    expect(result).toBe('("ello');
    result = trimWordStart(result, true);
    expect(result).toBe('("llo');
    result = trimWordStart(result, true);
    expect(result).toBe('("lo');
    result = trimWordStart(result, true);
    expect(result).toBe('("o');
    result = trimWordStart(result, true);
    expect(result).toBe('("');
    result = trimWordStart(result, true);
    expect(result).toBe('"');
    result = trimWordStart(result, true);
    expect(result).toBe("");
    result = trimWordStart(result, true);
    expect(result).toBe("");
  });
});

// Test renderLines
describe("renderLines", () => {
  it("should render lines of text", () => {
    const lines = [
      {
        rtl: false,
        width: 50,
        text: "",
        words: [{ text: "Hello", width: 50, style: undefined, rtl: false }],
      },
    ];
    const lineStyle = createLineStyle([], "Arial", 0xff0000);
    renderLines(
      mockCtx as unknown as CanvasRenderingContext2D,
      lines,
      lineStyle,
      "left",
      20,
      100,
      0
    );
    // expect(mockCtx.fillText).toHaveBeenCalledWith('Hello', 0, 10);
  });
});
