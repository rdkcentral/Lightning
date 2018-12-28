import Benchmark from '../../node_modules/benchmark';

import lng from "../../lightning.mjs"

class App extends lng.Application {
    static _template() {
        return {
            Main: {x: 100, w: 300, h: 100, y: 100, flex: {direction: 'row', padding: 50, wrap: true}, rect: true, color: 0xFFFFF000,
                Rel: {w: (w=>w*0.90), h: (h=>h*0.9), x: 2, y: 2, flexItem: false, color: 0xFFFF00FF, rect: true},
                Item1: {w: 110, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item2: {w: 120, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item3: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item4: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item5: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item6: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item7: {w: 130, h: 150, flexItem: {margin: 10}, rect: true, color: 0xFFF00000},
                Item8: {w: 300, h: 100, flexItem: {margin: 10, alignSelf: 'stretch', grow: 1}, rect: true, color: 0xFF00FF00},
                Sub: {w: 400, h: 300, flex: {direction: 'column'},
                    children: [
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}},
                        {text: {text: "hello world"}}
                    ]
                }
            }
        }
    }

}

import NodePlatform from "../../src/platforms/node/NodePlatform.mjs";
const options = {stage: {w: 900, h: 900, autostart: false, clearColor: 0xFF000000, platform: NodePlatform}};
options.stage.window = {title: "Benchmark", fullscreen: false};

const app = new App(options);
const stage = app.stage;

var suite = new Benchmark.Suite;

suite.add('layout', function() {
    app.tag("Main").w += 0.001;
    stage.ctx._update();
}).on('cycle', function(event) {
    console.log(String(event.target));
}).run({async:false});

/*
Results:

28-12-2018 (nodejs 8.14)
layout: 120412, 121507, 120461

 */