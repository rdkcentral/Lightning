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

import { test, expect, type Page } from "@playwright/test";
import looksSame from "looks-same";

const FIRST_TEST = 1;
const TEST_STYLED = 3;
const TEST_BIDI = 4;
const TEST_HEBREW = 7
const TEST_ARABIC = 10;
const LAST_TEST = 11;

async function compareWrapping(page: Page, width: number) {
  page.setDefaultTimeout(2000);
  await page.setViewportSize({ width, height: 4000 });
  await page.goto("/tests/text-rendering.html?playwright");

  for (let i = FIRST_TEST; i < TEST_HEBREW; i++) {
    await page
      .locator(`#preview${i}`)
      .screenshot({ path: `temp/wrap-${width}-test${i}-html.png` });
    await page
      .locator(`#canvas${i}`)
      .screenshot({ path: `temp/wrap-${width}-test${i}-canvas.png` });

    const { equal, diffImage, differentPixels } = await looksSame(
      `temp/wrap-${width}-test${i}-html.png`,
      `temp/wrap-${width}-test${i}-canvas.png`,
      {
        createDiffImage: true,
        strict: false,
      }
    );
    diffImage?.save(`temp/wrap-${width}-diff${i}.png`);

    if (differentPixels) {
      console.log(
        `Test ${i} - ${width}px - different pixels: ${differentPixels}`
      );
    }
    const maxDiff = i >= TEST_BIDI ? 150 : 50; // Arabic needs more tolerance
    expect(
      equal || differentPixels < maxDiff,
      `[Test ${i}] HTML and canvas rendering do not match (${differentPixels} pixels differ)`
    ).toBe(true);
  }
}

async function compareLetterSpacing(page: Page, width: number) {
  page.setDefaultTimeout(2000);
  await page.setViewportSize({ width, height: 4000 });
  await page.goto("/tests/text-rendering.html?playwright&letterSpacing=5");

  for (let i = FIRST_TEST; i < TEST_STYLED; i++) {
    await page
      .locator(`#preview${i}`)
      .screenshot({ path: `temp/spacing-${width}-test${i}-html.png` });
    await page
      .locator(`#canvas${i}`)
      .screenshot({ path: `temp/spacing-${width}-test${i}-canvas.png` });

    const { equal, diffImage, differentPixels } = await looksSame(
      `temp/spacing-${width}-test${i}-html.png`,
      `temp/spacing-${width}-test${i}-canvas.png`,
      {
        createDiffImage: true,
        strict: false,
      }
    );
    diffImage?.save(`temp/spacing-${width}-diff${i}.png`);

    if (differentPixels) {
      console.log(
        `Test ${i} - ${width}px - different pixels: ${differentPixels}`
      );
    }
    expect(
      equal || differentPixels < 50,
      `[Test ${i}] HTML and canvas rendering do not match (${differentPixels} pixels differ)`
    ).toBe(true);
  }
}

async function comparePunctuation(page: Page, width: number) {
  await page.setViewportSize({ width, height: 4000 });
  await page.goto("/tests/text-rendering.html?playwright");

  for (let i = TEST_HEBREW; i <= LAST_TEST; i++) {
    await page
      .locator(`#preview${i}`)
      .screenshot({ path: `temp/punctuation-${width}-test${i}-html.png` });
    await page
      .locator(`#canvas${i}`)
      .screenshot({ path: `temp/punctuation-${width}-test${i}-canvas.png` });

    const { equal, diffImage, differentPixels } = await looksSame(
      `temp/punctuation-${width}-test${i}-html.png`,
      `temp/punctuation-${width}-test${i}-canvas.png`,
      {
        createDiffImage: true,
        strict: false,
      }
    );
    diffImage?.save(`temp/punctuation-${width}-diff${i}.png`);

    if (differentPixels) {
      console.log(
        `Test ${i} - ${width}px - different pixels: ${differentPixels}`
      );
    }
    const maxDiff = i >= TEST_ARABIC ? 350 : 150; // Arabic needs more tolerance
    expect(
      equal || differentPixels < maxDiff,
      `[Test ${i}] HTML and canvas rendering do not match (${differentPixels} pixels differ)`
    ).toBe(true);
  }
}

/*
* The following tests compare HTML and LightningJS canvas rendering of text.
* 
* The tests compare the two renderings and check if they match within a certain tolerance.
* More tolerance is given to Arabic due to the amount of details in the script.
* 
* The tests are run at different viewport widths and letter spacings.
* 
* Note: we don't expect that HTML and canvas rendering will always match exactly, especially
* when it comes to wrapping and ellipsis logic. The viewport widths have been chosen where 
* wrapping and ellipsis matched the best.
*/

test("no wrap", async ({ page }) => {
  await compareWrapping(page, 1000);
});

test("wrap 1", async ({ page }) => {
  await compareWrapping(page, 800);
});

test("wrap 2", async ({ page }) => {
  await compareWrapping(page, 640);
});

test("wrap 3", async ({ page }) => {
  await compareWrapping(page, 520);
});

test("letter spacing 1", async ({ page }) => {
  await compareLetterSpacing(page, 1000);
});

test("letter spacing 2", async ({ page }) => {
  await compareLetterSpacing(page, 550);
});

test("punctuation", async ({ page }) => {
  await comparePunctuation(page, 930);
});
