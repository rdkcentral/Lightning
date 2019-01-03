import lng from "../../lightning.mjs"

class LayoutExample extends lng.Application {
    static _template() {
        return {
            Main: {x: 100, w: 300, h: 100, y: 100, flex: {direction: 'row', padding: 50, wrap: true}, rect: true, color: 0xFFFFF000,
                Rel: {w: (w=>w*0.50), h: (h=>h*0.5), x: 2, y: 2, flexItem: false, color: 0xFFFF00FF, rect: true},
                Item1: {w: 110, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item2: {w: 120, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item3: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item4: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item5: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item6: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item7: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item8: {w: 270, h: 100, flexItem: {margin: 10, alignSelf: 'stretch', grow: 1}, rect: true, color: 0xFF00FF00},
                Sub: {flex: {direction: 'column'},
                    children: [
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                    ]
                }
            }
        }
    }

    static _states() {
        return {
            _init: function() {
                this.tag("Main").animation({duration: 10, repeat: -1, actions: [
                        {p: 'w', v: {0: 100, 0.5: 600, 1: 100}}
                    ]}).start();
            }
        }
    }
}

import NodePlatform from "../../src/platforms/node/NodePlatform.mjs";

const options = {stage: {w: 900, h: 900, clearColor: 0xFF000000, autostart: false, platform: NodePlatform}};

options.stage.window = {title: "Border example", fullscreen: false};

const app = new LayoutExample(options);

let total = 0;
let measurements = 0;

function test2() {
    app.tag("Main").w+=0.001;
    app.stage.ctx._update();
}

const start = app.stage.platform.getHrTime();
for (let i = 0; i < 10000; i++) {
    test2();
}
app.tag("Main").w=200;

// const end = app.stage.platform.getHrTime();
// console.log((end-start)+'ms');
//
//
// app.tag("Main").w+=0.001;
// app.stage.ctx._update();
// app.tag("Main").w+=0.001;
// app.stage.ctx._update();
//
function test() {
    app.tag("Main").w+=0.001;
    const start = app.stage.platform.getHrTime();
    app.stage.ctx._update();
    const end = app.stage.platform.getHrTime();
    if (end-start < 1.0) {
        total += (end - start);
        measurements++;
        if ((measurements % 100) === 0) {
            console.log(total / measurements + 'ms in ' + measurements + ' tests');
        }

        if (measurements === 1000) {
            measurements = 0;
            total = 0;
        }
    }
}

setInterval(test,5);

setTimeout(() => {}, 900000);

//
//
// setInterval(test, 100);
//
