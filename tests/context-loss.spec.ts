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

import { test, expect } from "@playwright/test";
import looksSame from "looks-same";

const OUTPUT_DIR = "temp/playwright";

const LS_OPTIONS = {
  createDiffImage: true,
  ignoreAntialiasing: true,
  tolerance: 10,
  antialiasingTolerance: 50,
} as const;

test("webgl context loss suspends rendering and restores it afterwards", async ({
  page,
}) => {
  page.setDefaultTimeout(30000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/examples/context-loss/context-loss.html");
  await page.waitForFunction(() => window.__contextLoss?.imgLoaded === true);
  // Let the healthy frame settle before screenshotting it.
  await page.waitForTimeout(1000);
  await page
    .locator("canvas")
    .screenshot({ path: `${OUTPUT_DIR}/context-loss-healthy.png` });

  await page.evaluate(() => window.__contextLoss.lose());
  await page.waitForFunction(() => window.__contextLoss?.state === "lost");

  // Several frames while lost: rendering must stay suspended without
  // crashing or submitting GPU work.
  await page.waitForTimeout(500);
  const lostState = await page.evaluate(() => window.__contextLoss.state);
  expect(lostState).toBe("lost");

  await page.evaluate(() => window.__contextLoss.restore());
  await page.waitForFunction(
    () => window.__contextLoss?.events.restored === 1
  );
  await page.waitForFunction(() => window.__contextLoss?.imgLoaded === true);
  await page.waitForTimeout(1000);

  // Deterministic, compositor-independent check: force a render and read
  // the image pixels back in the same task. A failed texture restore would
  // read back transparent black here.
  const readImagePixel = () =>
    page.evaluate(() => {
      const app = window.__app;
      const gl = app.stage.gl;
      app.stage.forceRenderUpdate();
      app.stage.ctx.update();
      app.stage.ctx.render();
      const px = new Uint8Array(4);
      gl.readPixels(300, 400, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      return [px[0], px[1], px[2], px[3]];
    });
  const pixel = await readImagePixel();
  expect(pixel[3]).toBe(255);
  // Landscape sample point: must carry real image content, not black.
  expect(pixel[0] + pixel[1] + pixel[2]).toBeGreaterThan(100);

  await page
    .locator("canvas")
    .screenshot({ path: `${OUTPUT_DIR}/context-loss-restored.png` });

  // The status line intentionally differs (it names the received events), so
  // mask it before comparing: everything else must have recovered.
  await page.evaluate(() => {
    const status = window.__app.tag("Status");
    status.visible = false;
  });
  await page.waitForTimeout(500);
  await page
    .locator("canvas")
    .screenshot({ path: `${OUTPUT_DIR}/context-loss-restored-masked.png` });

  const { equal } = await looksSame(
    `${OUTPUT_DIR}/context-loss-healthy.png`,
    `${OUTPUT_DIR}/context-loss-restored-masked.png`,
    {
      ...LS_OPTIONS,
      // Mask the status strip (bottom 120px of the 1280x720 stage).
      ignoreAreas: [{ x1: 0, y1: 600, x2: 1280, y2: 720 }],
    }
  );

  expect(equal, "Restored frame differs from healthy frame").toBe(true);
  expect(errors).toEqual([]);
});
