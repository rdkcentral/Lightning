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

import Button from "./src/Button.mjs";

describe("Right-to-Left layout", function () {
  this.timeout(0);

  let app;
  let stage;

  after(() => {
    stage.stop();
    stage.getCanvas().remove();
  });

  function assertCoordinates(target, expected) {
    const { px, py } = target.__core._renderContext;
    chai.assert(
      px === expected.px,
      `${target.ref}.px !== ${expected.px} (${px})`
    );
    chai.assert(
      py === expected.py,
      `${target.ref}.py !== ${expected.py} (${py})`
    );
  }

  before(() => {
    const arabicLabel = "أظهر المزيد";
    class TestApp extends lng.Application {
      static _template() {
        return {
          Rect1: {
            rect: true,
            w: 600,
            h: 200,
            color: 0xff0000ff,
            Rect2: {
              rect: true,
              x: 100,
              y: 10,
              w: 500,
              h: 180,
              color: 0xffff0000,
              Label: {
                x: 20,
                y: 50,
                text: {
                  text: `RTL Lightning\n${arabicLabel}`,
                },
              },
            },
          },
          Rect3: {
            rect: true,
            x: 300,
            w: 600,
            h: 200,
            y: 300,
            color: 0xff660066,
            Scroller: {
              rect: true,
              h: 180,
              w: 1080,
              y: 10,
              color: 0x99999999,
            },
          },
          Rect4: {
            rtl: false,
            rect: true,
            x: 700,
            w: 400,
            h: 200,
            color: 0xff00ffff,
            NonRtlLabel: {
              x: 20,
              y: 50,
              text: {
                text: "Always LTR",
              },
            },
          },
          Flexed: {
            w: 1280,
            y: 600,
            flex: {},
            Button0: {
              type: Button,
              label: "One",
            },
            Button1: {
              type: Button,
              label: "Two (2)",
            },
            Button2: {
              type: Button,
              label: "Third one's the charm",
            },
          },
        };
      }

      _init() {
        this.createScrollerItems("1");
      }

      createScrollerItems(id) {
        const items = [];
        for (let i = 0; i < 6; i++) {
          items.push({
            ref: `Item${i}-${id}`,
            rect: true,
            x: i * 180,
            w: 160,
            h: 160,
            y: 10,
            color: 0x800000ff,
            Label: {
              x: 80,
              y: 80,
              mountX: 0.5,
              mountY: 0.5,
              text: {
                text: `#${i}`,
                fontSize: 40,
                textColor: 0xff000000,
              },
            },
          });
        }
        const scroller = this.tag("Scroller");
        scroller.children = items;
      }

      scrollTo(index) {
        const scroller = this.tag("Scroller");
        if (this.prevIndex) {
          scroller.children[this.prevIndex].scale = 1;
          scroller.children[this.prevIndex].tag("Label").scale = 1;
        }
        this.prevIndex = index;
        scroller.x = -180 * index;
        scroller.children[index].scale = 1.5;
        scroller.children[index].tag("Label").scale = 1.5;
      }
    }

    app = new TestApp();
    stage = app.stage;
    document.body.appendChild(stage.getCanvas());
  });

  describe("RTL off", function () {
    before(() => {
      app.stage.drawFrame();
    });

    it("Should default to LTR and propagate flag", function () {
      chai.assert(app.rtl === false);
      chai.assert(app.tag("Scroller.Item0-1").rtl === false);
    });

    it("Should not trigger direction updates", function () {
      chai.assert(app.tag("Flexed.Button0").directionUpdatesCount === 0);
    });

    it("Should layout Label correctly", function () {
      const rect2 = app.tag("Rect2");
      const label = app.tag("Label");

      assertCoordinates(label, {
        px: rect2.x + label.x,
        py: rect2.y + label.y,
      });
      // texture was rendered without RTL flag - initial/default state
      chai.assert(!label.texture.source.lookupId.includes("|rtl"));
    });

    it("Should layout flex items correctly", function () {
      const flexed = app.tag("Flexed");
      const b0 = app.tag("Button0");
      const b1 = app.tag("Button1");
      const b2 = app.tag("Button2");
      const py = flexed.y;
      const spacing = b0.flexItem.marginRight;

      assertCoordinates(b0, {
        px: 0,
        py,
      });
      assertCoordinates(b1, {
        px: b0.finalW + spacing,
        py,
      });
      assertCoordinates(b2, {
        px: b0.finalW + spacing + b1.finalW + spacing,
        py,
      });
    });

    it("Should layout the button label correctly", function () {
      const flexed = app.tag("Flexed");
      const b0 = app.tag("Button0");
      const b0Label = b0.tag("Label");
      const padding = b0.flex.padding;
      const py = flexed.y + padding;

      assertCoordinates(b0Label, {
        px: padding,
        py,
      });
      // texture was rendered without RTL flag - remain in default state
      chai.assert(!b0Label.texture.source.lookupId.includes("|rtl"));
    });
  });

  describe("RTL on", function () {
    before(() => {
      app.rtl = true;
      app.stage.drawFrame();
    });

    it("Should propagate flag", function () {
      chai.assert(app.tag("Label").rtl === true);
      chai.assert(app.tag("Scroller.Item0-1").rtl === true);
    });

    it("Should trigger direction updates", function () {
      chai.assert(app.tag("Flexed.Button0").directionUpdatesCount === 1);
    });

    it("Should apply flag to new children", function () {
      app.createScrollerItems("2");
      chai.assert(app.tag("Scroller.Item0-2").rtl === true);
    });

    it("Should layout Label correctly", function () {
      const rect1 = app.tag("Rect1");
      const rect2 = app.tag("Rect2");
      const label = app.tag("Label");

      assertCoordinates(label, {
        px: rect1.finalW - rect2.x - label.x - label.finalW,
        py: rect2.y + label.y,
      });
      // texture was rendered with RTL flag, propagated after the scroller item is attached
      chai.assert(label.texture.source.lookupId.includes("|rtl"));
    });

    it("Should layout flex items correctly", function () {
      const flexed = app.tag("Flexed");
      const b0 = app.tag("Button0");
      const b1 = app.tag("Button1");
      const b2 = app.tag("Button2");
      const py = flexed.y;
      const spacing = b0.flexItem.marginRight;

      assertCoordinates(b0, {
        px: flexed.w - b0.finalW,
        py,
      });
      assertCoordinates(b1, {
        px: flexed.w - b0.finalW - spacing - b1.finalW,
        py,
      });
      assertCoordinates(b2, {
        px: flexed.w - b0.finalW - spacing - b1.finalW - spacing - b2.finalW,
        py,
      });
    });

    it("Should layout the button label correctly", function () {
      const flexed = app.tag("Flexed");
      const b0 = app.tag("Button0");
      const b0Label = b0.tag("Label");
      const padding = b0.flex.padding;
      const py = flexed.y + padding;

      assertCoordinates(b0Label, {
        px: flexed.w - padding - b0Label.finalW,
        py,
      });
      // texture was rendered with RTL flag, propagated after the scroller item is attached
      chai.assert(b0Label.texture.source.lookupId.includes("|rtl"));
    });

    it("Should handle scale correctly", () => {
      const rect3 = app.tag("Rect3");
      const scroller = app.tag("Scroller");
      assertCoordinates(scroller, {
        px: rect3.x + rect3.w - scroller.w,
        py: rect3.y + scroller.y,
      });

      app.scrollTo(1);
      stage.drawFrame();
      app.scrollTo(2);
      stage.drawFrame();

      const item2 = scroller.children[2];
      assertCoordinates(item2, {
        px: rect3.x + rect3.w - item2.w / 2 - (item2.w * 1.5) / 2,
        py: rect3.y + scroller.y + item2.y + item2.h / 2 - (item2.h * 1.5) / 2,
      });
    });

    it("Should not mirror elements with rtl=false", () => {
      const rect4 = app.tag("Rect4");
      const nonRtl = app.tag("NonRtlLabel");
      assertCoordinates(nonRtl, {
        px: rect4.x + nonRtl.x,
        py: rect4.y + nonRtl.y,
      });
    });

    it("Should propagate flag after attachment", () => {
      const parent = new lng.Element(app.stage);
      parent.patch({
        y: 200,
        Label: {
          w: 600, // text should be visually aligned to the right at the end of the blue box
          text: {
            text: "Dynamic attachment",
            fontSize: 40,
            textColor: 0xff000000,
          },
        },
      });

      // before attachment to the app (and stage), the texture doesn't have the RTL flag (like its parent)
      chai.assert(!parent.tag("Label").texture.source.lookupId.includes("|rtl"));

      app.childList.add(parent);
      stage.drawFrame();

      // after attachment, the texture should have the RTL flag
      chai.assert(parent.tag("Label").texture.source.lookupId.includes("|rtl"));
    });
  });
});
