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

describe("Texture mirroring", function () {
  let stage;

  function toNumberColor(bytes) {
    return (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
  }

  function captureCanvasCornerColors(canvas) {
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    const ctx = temp.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(canvas, 0, 0);
    // read TL and TR pixels and extract colors (without alpha)
    const tl = toNumberColor(ctx.getImageData(1, 1, 1, 1).data);
    const tr = toNumberColor(
      ctx.getImageData(canvas.width - 2, 1, 1, 1).data
    );
    const bl = toNumberColor(ctx.getImageData(1, canvas.height - 2, 1, 1).data);
    const br = toNumberColor(
      ctx.getImageData(canvas.width - 2, canvas.height - 2, 1, 1).data
    );

    return { tl, tr, bl, br };
  }

  function renderTest(canvas2d, radius, mirrorX, mirrorY) {
    class TestApplication extends lng.Application {}
    const app = new TestApplication({
      stage: { w: 100, h: 100, clearColor: 0xffffffff, autostart: false, canvas2d },
    });
    stage = app.stage;
    document.body.appendChild(stage.getCanvas());

    const element = app.stage.createElement({
      Item: {
        texture: lng.Tools.getRoundRect(198, 198, radius, 0, 0, true, 0xffff0000),
        pivot: 0,
        scale: 0.5 // ensure calculations work with scaling
      },
    });
    app.children = [element];

    const texture = app.tag("Item").texture;
    if (mirrorX) {
      texture.x = 200;
      texture.w = -200;
    }
    if (mirrorY) {
      texture.y = 200;
      texture.h = -200;
    }

    stage.drawFrame();
  }

  afterEach(() => {
    stage.stop();
    stage.getCanvas().remove();
  });

  it("non-mirrored control in webGl", () => {
    renderTest(false, [0, 30, 30, 30], false);

    const capture = captureCanvasCornerColors(stage.getCanvas());
    chai.assert(
      capture.tl === 0x0000ff && capture.tr === 0xffffff,
      "Top-left should be red, top-right should be white"
    );
  });

  it("can mirror horizontally in webGl", () => {
    renderTest(false, [0, 30, 30, 30], true);

    const capture = captureCanvasCornerColors(stage.getCanvas());
    chai.assert(
      capture.tl === 0xffffff && capture.tr === 0x0000ff,
      "Top-left should be white, top-right should be red"
    );
  });

  it("can mirror vertically in webGl", () => {
    renderTest(false, [0, 30, 30, 30], false, true);

    const capture = captureCanvasCornerColors(stage.getCanvas());
    chai.assert(
      capture.tl === 0xffffff && capture.bl === 0x0000ff,
      "Top-left should be white, bottom-left should be red"
    );
  });

  it("can mirror horizontally and vertically in webGl", () => {
    renderTest(false, [0, 30, 30, 30], true, true);

    const capture = captureCanvasCornerColors(stage.getCanvas());
    chai.assert(
      capture.tl === 0xffffff && capture.br === 0x0000ff,
      "Top-left should be white, bottom-right should be red"
    );
  });

  it("non-mirrored control in canvas2d", () => {
    renderTest(true, [0, 30, 30, 30], false);

    const capture = captureCanvasCornerColors(stage.getCanvas());
    chai.assert(
      capture.tl === 0x0000ff && capture.tr === 0xffffff,
      "Top-left should be red, top-right should be white"
    );
  });

  it("can mirror horizontally in canvas2d", () => {
    renderTest(true, [0, 30, 30, 30], true);

    const capture = captureCanvasCornerColors(stage.getCanvas());
    chai.assert(
      capture.tl === 0xffffff && capture.tr === 0x0000ff,
      "Top-left should be white, top-right should be red"
    );
  });

  it("can mirror vertically in canvas2d", () => {
    renderTest(true, [0, 30, 30, 30], false, true);

    const capture = captureCanvasCornerColors(stage.getCanvas());
    chai.assert(
      capture.tl === 0xffffff && capture.bl === 0x0000ff,
      "Top-left should be white, bottom-left should be red"
    );
  });

  it("can mirror horizontally and vertically in canvas2d", () => {
    renderTest(true, [0, 30, 30, 30], true, true);

    const capture = captureCanvasCornerColors(stage.getCanvas());
    chai.assert(
      capture.tl === 0xffffff && capture.br === 0x0000ff,
      "Top-left should be white, bottom-right should be red"
    );
  });
});
