/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
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

function snapshot(component) {
  return component.constructor.getTemplateFunc(component).f.toString().replace(/\n/g, " ");
}

const TEMPLATES = [
  {
    name: 'Simple',
    template: {
      Img: {
        rect: true,
        w: 500, h: 500,
        x: 200, y: 200,
        colorTop: 0xFF441144,
        colorBottom: 0xFF114411,
      }
    },
    func: 'function anonymous(element,store ) { var rImg0 = element.stage.createElement(); rImg0.ref = "Img"; rImg0["rect"] = true; rImg0["w"] = 500; rImg0["h"] = 500; rImg0["x"] = 200; rImg0["y"] = 200; rImg0["colorTop"] = 4282650948; rImg0["colorBottom"] = 4279321617; element.childList.add(rImg0) }'
  },

  {
    name: 'Empty',
    template: {},
    func: 'function anonymous(element,store ) {  }',
  },

  {
    name: 'Nested',
    template: {
      Outer: {
        Inner: {
          Inner2: {rect: true, color: 0xff000000}
        },
        color: 0xff111111,
      },
      text: {text: "HelloWorld", fontSize: 24},
      color: 0xcc111111,
    },
    func: 'function anonymous(element,store ) { var rOuter0 = element.stage.createElement(); rOuter0.ref = "Outer"; var rInner1 = element.stage.createElement(); rInner1.ref = "Inner"; var rInner22 = element.stage.createElement(); rInner22.ref = "Inner2"; rInner22["rect"] = true; rInner22["color"] = 4278190080; rInner1.childList.add(rInner22); rOuter0.childList.add(rInner1); rOuter0["color"] = 4279308561; element.childList.add(rOuter0); var element__text = element.enableTextTexture(); element__text["text"] = "HelloWorld"; element__text["fontSize"] = 24; element["color"] = 3423670545 }',
  },

  {
    name: 'Nested shaders',
    template: {
      Outer: {
        Inner: {
          Inner2: {
            w: 200, h: 200,
            rect: true, color: 0xff000000, rtt: true,
            shader: {type: lng.shaders.Outline},
            rotation: 0.5,
          },
          rtt: true,
          x: 100, y: 100,
          w: 300, h: 300,
          rotation: 0.5,
          shader: {type: lng.shaders.Outline, width: 10}
        },
        shader: {type: lng.shaders.Outline, width: 10, color: 0xff000000},
        w: 500, h: 500,
        rect: true,
        color: 0xffff0000,
      }
    },
    func: 'function anonymous(element,store ) { var rOuter0 = element.stage.createElement(); rOuter0.ref = "Outer"; var rInner1 = element.stage.createElement(); rInner1.ref = "Inner"; var rInner22 = element.stage.createElement(); rInner22.ref = "Inner2"; rInner22["w"] = 200; rInner22["h"] = 200; rInner22["rect"] = true; rInner22["color"] = 4278190080; rInner22["rtt"] = true; rInner22["shader"] = store[0]; rInner22["rotation"] = 0.5; rInner1.childList.add(rInner22); rInner1["rtt"] = true; rInner1["x"] = 100; rInner1["y"] = 100; rInner1["w"] = 300; rInner1["h"] = 300; rInner1["rotation"] = 0.5; rInner1["shader"] = store[1]; rOuter0.childList.add(rInner1); rOuter0["shader"] = store[2]; rOuter0["w"] = 500; rOuter0["h"] = 500; rOuter0["rect"] = true; rOuter0["color"] = 4294901760; element.childList.add(rOuter0) }',
  },

  {
    name: 'Flat',
    template: {
      Test1: {w: 200, h:100, rect: true},
      Test2: {w: 201, h:102, rect: true},
      Text: {text: {text: 'HelloWorld', fontSize: 24}},
      Test3: {w: 202, h:103, rect: true},
      Test4: {w: 203, h:104, rect: true},
    },
    func: 'function anonymous(element,store ) { var rTest10 = element.stage.createElement(); rTest10.ref = "Test1"; rTest10["w"] = 200; rTest10["h"] = 100; rTest10["rect"] = true; element.childList.add(rTest10); var rTest21 = element.stage.createElement(); rTest21.ref = "Test2"; rTest21["w"] = 201; rTest21["h"] = 102; rTest21["rect"] = true; element.childList.add(rTest21); var rText2 = element.stage.createElement(); rText2.ref = "Text"; var rText2__text = rText2.enableTextTexture(); rText2__text["text"] = "HelloWorld"; rText2__text["fontSize"] = 24; element.childList.add(rText2); var rTest33 = element.stage.createElement(); rTest33.ref = "Test3"; rTest33["w"] = 202; rTest33["h"] = 103; rTest33["rect"] = true; element.childList.add(rTest33); var rTest44 = element.stage.createElement(); rTest44.ref = "Test4"; rTest44["w"] = 203; rTest44["h"] = 104; rTest44["rect"] = true; element.childList.add(rTest44) }'
  },

  {
    name: 'Flat shaders',
    template: {
      Test1: {w: 200, h:100, rect: true, shader: {type: lng.shaders.Grayscale, amount: 2}},
      Test2: {w: 201, h:102, rect: true, shader: {type: null}},
      Text: {text: {text: 'HelloWorld', fontSize: 24}},
      Test3: {w: 202, h:103, rect: true, shader: {type: undefined}},
      Test4: {w: 203, h:104, rect: true, shader: {type: lng.shaders.Default}},
    },
    func: 'function anonymous(element,store ) { var rTest10 = element.stage.createElement(); rTest10.ref = "Test1"; rTest10["w"] = 200; rTest10["h"] = 100; rTest10["rect"] = true; rTest10["shader"] = store[0]; element.childList.add(rTest10); var rTest21 = element.stage.createElement(); rTest21.ref = "Test2"; rTest21["w"] = 201; rTest21["h"] = 102; rTest21["rect"] = true; rTest21["shader"] = store[1]; element.childList.add(rTest21); var rText2 = element.stage.createElement(); rText2.ref = "Text"; var rText2__text = rText2.enableTextTexture(); rText2__text["text"] = "HelloWorld"; rText2__text["fontSize"] = 24; element.childList.add(rText2); var rTest33 = element.stage.createElement(); rTest33.ref = "Test3"; rTest33["w"] = 202; rTest33["h"] = 103; rTest33["rect"] = true; rTest33["shader"] = store[2]; element.childList.add(rTest33); var rTest44 = element.stage.createElement(); rTest44.ref = "Test4"; rTest44["w"] = 203; rTest44["h"] = 104; rTest44["rect"] = true; rTest44["shader"] = store[3]; element.childList.add(rTest44) }'
  },


]

describe('Template', function() {
    let testComp;
    let app;
    let stage;

    class TestApplication extends lng.Application {}
    app = new TestApplication({stage: {w: 500, h: 500, clearColor: 0xFFFF0000, autostart: true}});
    stage = app.stage;
    document.body.appendChild(stage.getCanvas());
  
    for (const {template, func, name} of TEMPLATES) {

      
      it(`[${name}] should be backwards compatibile`, function() {
        class TestComponent extends lng.Component {
          static _template() {
            return template;
          }
        }

        const elem = app.stage.createElement({
            Item: {type: TestComponent}
        });

      app.children = [elem];

      testComp = app.tag('Item');
        const tstr = snapshot(testComp);
        // console.log(func);
        // console.log(tstr);
        console.log(tstr == func);
        chai.assert(tstr == func);
      });
    }
 
  }); 
  