import Application from "./application/Application.mjs";
import Component from "./application/Component.mjs";
import Base from "./tree/Base.mjs";
import Utils from "./tree/Utils.mjs";
import StageUtils from "./tree/StageUtils.mjs";
import View from "./tree/View.mjs";
import ViewCore from "./tree/core/ViewCore.mjs";
import ViewTexturizer from "./tree/core/ViewTexturizer.mjs";
import Texture from "./tree/Texture.mjs";
import Tools from "./tools/Tools.mjs";
import RectangleTexture from "./textures/RectangleTexture.mjs";
import NoiseTexture from "./textures/NoiseTexture.mjs";
import TextTexture from "./textures/TextTexture.mjs";
import ImageTexture from "./textures/ImageTexture.mjs";
import HtmlTexture from "./textures/HtmlTexture.mjs";
import StaticTexture from "./textures/StaticTexture.mjs";
import StaticCanvasTexture from "./textures/StaticCanvasTexture.mjs";
import ObjectListProxy from "./tools/misc/ObjectListProxy.mjs";
import ObjectListWrapper from "./tools/misc/ObjectListWrapper.mjs";
// import ListComponent from "./tools/components/ListComponent.mjs";
// import FastBlurComponent from "./tools/components/FastBlurComponent.mjs";
// import SmoothScaleComponent from "./tools/components/SmoothScaleComponent.mjs";
// import BorderComponent from "./tools/components/BorderComponent.mjs";
// import LinearBlurShader from "./tools/shaders/LinearBlurShader.mjs";
// import DitheringShader from "./tools/shaders/DitheringShader.mjs";
// import RadialGradientShader from "./tools/shaders/RadialGradientShader.mjs";
// import PixelateShader from "./tools/shaders/PixelateShader.mjs";
// import InversionShader from "./tools/shaders/InversionShader.mjs";
// import OutlineShader from "./tools/shaders/OutlineShader.mjs";
// import CircularPushShader from "./tools/shaders/CircularPushShader.mjs";
// import RadialFilterShader from "./tools/shaders/RadialFilterShader.mjs";
// import BoxBlurShader from "./tools/shaders/LinearBlurShader.mjs";
import EventEmitter from "./EventEmitter.mjs";

import WebGLShader from "./tree/core/render/webgl/WebGLShader.mjs";
import WebGLDefaultShader from "./tree/core/render/webgl/shaders/WebGLDefaultShader.mjs";
import WebGLGrayscaleShader from "./tree/core/render/webgl/shaders/WebGLGrayscaleShader.mjs";
import WebGLBoxBlurShader from "./tree/core/render/webgl/shaders/WebGLBoxBlurShader.mjs";

import C2dShader from "./tree/core/render/c2d/C2dShader.mjs";
import C2dDefaultShader from "./tree/core/render/c2d/shaders/C2dDefaultShader.mjs";
import C2dGrayscaleShader from "./tree/core/render/c2d/shaders/C2dGrayscaleShader.mjs";

import Stage from "./tree/Stage.mjs";
import WebAdapter from "./browser/WebAdapter.mjs";
Stage.ADAPTER = WebAdapter;

const lightning = {
    Application,
    Component,
    Base,
    Utils,
    StageUtils,
    View,
    Tools,
    Stage,
    ViewCore,
    ViewTexturizer,
    Texture,
    EventEmitter,
    shaders: {
        Grayscale: WebGLGrayscaleShader,
        BoxBlurShader: WebGLBoxBlurShader,
        webgl: {
            Shader: WebGLShader,
            DefaultShader: WebGLDefaultShader,
        },
        c2d: {
            Shader: C2dShader,
            DefaultShader: C2dDefaultShader,
            Grayscale: C2dGrayscaleShader,
        }
    },
    webgl: {
        shaders: {
        }
    },
    c2d: {
        shaders: {
            C2dShader,
            C2dDefaultShader
        }
    },
    textures: {
        RectangleTexture,
        NoiseTexture,
        TextTexture,
        ImageTexture,
        HtmlTexture,
        StaticTexture,
        StaticCanvasTexture,
    },
    misc: {
        ObjectListProxy,
        ObjectListWrapper,
    },
    // components: {
    //     FastBlurComponent,
    //     SmoothScaleComponent,
    //     BorderComponent,
    //     ListComponent
    // },
    // shaders: {
    //     DitheringShader,
    //     RadialGradientShader,
    //     PixelateShader,
    //     InversionShader,
    //     GrayscaleShader,
    //     OutlineShader,
    //     CircularPushShader,
    //     RadialFilterShader,
    //     LinearBlurShader,
    //     BoxBlurShader
    // }
};

// Legacy.
window.wuf = lightning;

export default lightning;