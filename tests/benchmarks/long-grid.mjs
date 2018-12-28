import Benchmark from '../../node_modules/benchmark';

import lng from "../../lightning.mjs"

class App extends lng.Application {
    static _template() {
        return {
            Wrap: {
                Items: {}
            },
            SomethingElse: {

            }
        }
    }

    scrollDown() {
        this.tag("Wrap").y -= 1;

        if (this.tag("Wrap").y < -10000) {
            this.tag("Wrap").y = 0;
        }
    }

    static _states() {
        return {
            _init() {
                const items = [];
                for (let i = 0; i < 1000; i++) {
                    const color = lng.StageUtils.getArgbNumber([
                        256 * Math.random(),
                        256 * Math.random(),
                        256 * Math.random(),
                        256 * (Math.random() * 0.5 + 0.5)
                    ]);
                    items.push({title: "Item " + i, color});
                }
                this.tag("Items").children = items.map((item, i) => {
                    const col = i % 4;
                    const row = Math.floor(i / 4);
                    return {type: GridItem, data: item, x: col * 300, y: row * 500, clipbox: (i % 2 === 0)}
                });
            }
        }
    }
}

class GridItem extends lng.Component {
    static _template() {
        return {
            w: 200, h: 400,
            Background: {rect: true, w: 400, h: 200},
            Title: {x: 100, y: 350, mount: 0.5, text: {fontSize: 20}}
        }
    }

    set data(item) {
        this.tag("Background").color = item.color;
        this.tag("Title").text.text = item.title;
    }
}

import NodePlatform from "../../src/platforms/node/NodePlatform.mjs";
const options = {stage: {w: 900, h: 900, autostart: false, clearColor: 0xFF000000, platform: NodePlatform}};
options.stage.window = {title: "Benchmark", fullscreen: false};

const app = new App(options);
const stage = app.stage;

var suite = new Benchmark.Suite;

suite.add('update', function() {
    app.scrollDown();
    stage.ctx._update();
}).add('fill coords', function() {
    stage.ctx._fillRenderState();
}).on('cycle', function(event) {
    console.log(String(event.target));
}).run({async:false});

/*
Results:

28-12-2018 (nodejs 8.14)
update: 6143, 6306, 5819, 5879, 5958
fill coods: 31658, 32678, 28330, 30886, 29847

 */