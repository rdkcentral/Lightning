/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import TextTexture from "../../dist/src/textures/TextTexture.mjs";
import TextTextureRendererAdvanced from "../../dist/src/textures/TextTextureRendererAdvanced.js";
import TextTextureRenderer from "../../dist/src/textures/TextTextureRenderer.js";
import TextTokenizer from "../../dist/src/textures/TextTokenizer.js";

const MAX_WIDTH = 2048; // max width of the canvas
let testN = 0;
let letterSpacing = 0;
if (location.search.indexOf("letterSpacing") > 0) {
  const match = location.search.match(/letterSpacing=(\d+)/);
  if (match) {
    letterSpacing = parseInt(match[1], 10);
  }
}

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);
let renderWidth = Math.min(window.innerWidth - 16, MAX_WIDTH);

async function demo() {
  // const t0 = performance.now();
  testN = 0;
  root.innerHTML = "";
  root.style.width = renderWidth + "px";
  root.className = `spacing-${letterSpacing}`;

  // reset tokenizer
  TextTokenizer.setCustomTokenizer();

  // basic renderer

  await renderText(
    TextTextureRenderer,
    "First line\nAnd a second line of some rather long text"
  );
  await renderText(
    TextTextureRenderer,
    "One first line of some rather long text.\nAnd another quite long line; maybe longer!"
  );

  // styled rendering

  await renderText(
    TextTextureRendererAdvanced,
    "First <b><color=0xff00ffff>line</color>\nAnd</b> a <i>second line</i> of some st<b>yl</b>ed text"
  );

  // Bidi rendering

  // `bidiTokenizer.es5.js` attaches declarations to global `lng` object
  TextTokenizer.setCustomTokenizer(lng.getBidiTokenizer());

  await renderText(
    TextTextureRendererAdvanced,
    "Something with arabic embedded (that: !أسباب لمشاهدة).",
      "left",
      2,
      false
  );
  await renderText(
    TextTextureRendererAdvanced,
    "Something with hebrew embedded (that: !באמצעות מצלמת).",
      "left",
  );

  await renderText(
    TextTextureRendererAdvanced,
    "خمسة أسباب ①لمشاهدة عرض ONE Fight② Night 21",
    "right",
    2,
    false
  );

  await renderText(
    TextTextureRendererAdvanced,
    'أكبر الرابحين من عرض ONE Fight Night 21 من بطولة "ون"',
    "right",
    2,
    false
  );

  // Complex tests

  await renderText(
    TextTextureRendererAdvanced,
    "סרוק את קוד ה-QR באמצעות מצלמת הטלפון או הטאבלט שלך. (some english text)",
    "right"
  );

  await renderText(
    TextTextureRendererAdvanced,
    "הגיע הזמן לעדכן את אפליקציית TheBrand ולקבל את התכונות (ביותר!) החדשות ביותר (והטובות ביותר!). סמוך עלינו - אתה תאהב אותן.",
    "right"
  );

  await renderText(
    TextTextureRendererAdvanced,
    'أيضًا، نُدرج الأرقام ١٢٣٤٥٦٧٨٩٠، ورابط إلكتروني: user@example.com، مع علامات ترقيم؟!، ونصوص مختلطة الاتجاه مثل: "Hello, مرحبًا".',
    "right",
    3,
    false
  );

  // console.log("done in", performance.now() - t0, "ms");
}

let timer = 0;
window.addEventListener("resize", () => {
  if (timer) return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = 0;
    renderWidth = Math.min(window.innerWidth - 16, MAX_WIDTH);
    demo();
  }, 10);
});

async function renderText(
  Renderer /*typeof TextTextureRenderer*/,
  source /*string*/,
  textAlign /*"left" | "right" | "center"*/,
  maxLines /*number = 2*/,
  allowTextTruncation /*boolean = true*/
) {
  testN++;
  if (maxLines === undefined) maxLines = 2;
  if (textAlign === undefined) textAlign = "left";
  if (allowTextTruncation === undefined) allowTextTruncation = true;

  // re-add tags
  let text = source.replace(/①/g, "<b>").replace(/②/g, "</b>");

  const testCase = document.createElement("div");
  testCase.id = `test${testN}`;
  root.appendChild(testCase);

  const title = document.createElement("h2");
  title.innerText = `Test ${testN}`;
  testCase.appendChild(title);

  // PREVIEW

  const hintHtml = document.createElement("div");
  hintHtml.className = "hint-html";
  hintHtml.innerText = "html";
  testCase.appendChild(hintHtml);

  const previewText = text
    .replace(/\n/g, "<br/>")
    .replace("<color=0xff00ffff>", '<span style="color:#00ffff">')
    .replace("</color>", "</span>");
  const preview = document.createElement("p");
  preview.id = `preview${testN}`;
  preview.className = `lines-${maxLines}`;
  preview.dir = "auto";
  testCase.appendChild(preview);
  preview.innerHTML = previewText;
  preview.style.height = maxLines * 50 + "px";

  // CANVAS

  const hintCanvas = document.createElement("div");
  hintCanvas.className = "hint-canvas";
  hintCanvas.innerText = "canvas";
  testCase.appendChild(hintCanvas);

  const wrapper = document.createElement("div");
  wrapper.style.textAlign = textAlign;
  testCase.appendChild(wrapper);

  const canvas = document.createElement("canvas");
  canvas.id = `canvas${testN}`;
  canvas.width = renderWidth;
  canvas.height = maxLines * 50;
  wrapper.appendChild(canvas);

  const wordWrapWidth = canvas.width;

  // OPTIONS

  const options = {
    w: 1920,
    h: 1080,
    textRenderIssueMargin: 0,
    defaultFontFace: "Arial",
  };

  const stage = {
    getRenderPrecision() {
      return 1;
    },
    getOption(name) {
      return options[name];
    },
  };

  const settings = {
    ...getDefaultSettings(),
    rtl: textAlign === "right",
    text,
    wordWrapWidth,
    maxLines,
    advancedRenderer: text.indexOf("</") > 0,
  };
  TextTexture.allowTextTruncation = allowTextTruncation;

  try {
    const drawCanvas = document.createElement("canvas");
    const renderer = new Renderer(stage, drawCanvas, settings);
    await renderer.draw();

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    const dx = textAlign === "right" ? canvas.width - drawCanvas.width : 0;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(drawCanvas, dx, -2); // adjust for HTML rendering

    if (location.search.indexOf("playwright") < 0) {
      ctx.strokeStyle = "red";
      ctx.rect(
        dx + 0.5,
        0.5,
        drawCanvas.width - 1,
        Math.min(drawCanvas.height, canvas.height) - 1
      );
      ctx.stroke();
    }
  } catch (error) {
    console.error(error);
  }
}

function getDefaultSettings() {
  return {
    rtl: false,
    advancedRenderer: false,
    textColor: 0xff000000,
    textBaseline: "alphabetic",
    verticalAlign: "top",
    fontFace: null,
    fontStyle: "",
    fontSize: 40,
    lineHeight: 48,
    wordWrap: true,
    letterSpacing,
    textAlign: "left",
    textIndent: 40,
    textOverflow: "",
    maxLines: 2,
    maxLinesSuffix: "…",
    paddingLeft: 0,
    paddingRight: 0,
    offsetY: null,
    cutSx: 0,
    cutSy: 0,
    cutEx: 0,
    cutEy: 0,
    w: 0,
    h: 0,
    highlight: false,
    highlightColor: 0,
    highlightHeight: 0,
    highlightOffset: 0,
    highlightPaddingLeft: 0,
    highlightPaddingRight: 0,
    shadow: false,
    shadowColor: 0,
    shadowHeight: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
  };
}

// SCROLLING

let scrollN = 1;
if (location.hash.length) {
  const match = location.hash.match(/#test(\d+)/);
  if (match) {
    scrollN = parseInt(match[1], 10);
  }
}

document.addEventListener("keydown", (e) => {
  let reRender = false;
  if (e.key === "ArrowLeft") {
    if (renderWidth > 200) renderWidth -= 100;
    reRender = true;
  } else if (e.key === "ArrowRight") {
    if (renderWidth < 1820) renderWidth += 100;
    reRender = true;
  } else if (["0", "1", "2", "3", "4", "5"].includes(e.key)) {
    letterSpacing = parseInt(e.key, 10);
    reRender = true;
  }

  if (reRender) {
    e.preventDefault();
    demo();
    return;
  }

  if (e.key === "ArrowDown") {
    if (scrollN < testN) scrollN++;
  } else if (e.key === "ArrowUp") {
    if (scrollN > 1) scrollN--;
  }
  location.hash = `#test${scrollN}`;

  e.preventDefault();
});

let lastWheel = 0;
document.addEventListener("wheel", (e) => {
  const now = Date.now();
  if (now - lastWheel < 300) return;
  lastWheel = now;

  if (e.deltaY > 0) {
    if (scrollN < testN) scrollN++;
  } else {
    if (scrollN > 1) scrollN--;
  }
  location.hash = `#test${scrollN}`;
});

demo();
