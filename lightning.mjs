import Application from "./src/application/Application.mjs";
import Component from "./src/application/Component.mjs";
import Base from "./src/tree/Base.mjs";
import Utils from "./src/tree/Utils.mjs";
import StageUtils from "./src/tree/StageUtils.mjs";
import View from "./src/tree/View.mjs";
import ViewCore from "./src/tree/core/ViewCore.mjs";
import ViewTexturizer from "./src/tree/core/ViewTexturizer.mjs";
import Texture from "./src/tree/Texture.mjs";
import Tools from "./src/tools/Tools.mjs";

import RectangleTexture from "./src/textures/RectangleTexture.mjs";
import NoiseTexture from "./src/textures/NoiseTexture.mjs";
import TextTexture from "./src/textures/TextTexture.mjs";
import ImageTexture from "./src/textures/ImageTexture.mjs";
import HtmlTexture from "./src/textures/HtmlTexture.mjs";
import StaticTexture from "./src/textures/StaticTexture.mjs";
import StaticCanvasTexture from "./src/textures/StaticCanvasTexture.mjs";
import SourceTexture from "./src/textures/SourceTexture.mjs";

import ObjectListProxy from "./src/tools/ObjectListProxy.mjs";
import ObjectListWrapper from "./src/tools/ObjectListWrapper.mjs";
import ListComponent from "./src/components/ListComponent.mjs";
import FastBlurComponent from "./src/components/FastBlurComponent.mjs";
import SmoothScaleComponent from "./src/components/SmoothScaleComponent.mjs";
import BorderComponent from "./src/components/BorderComponent.mjs";
import EventEmitter from "./src/EventEmitter.mjs";

import WebGLShader from "./src/renderer/webgl/WebGLShader.mjs";
import WebGLDefaultShader from "./src/renderer/webgl/shaders/DefaultShader.mjs";
import GrayscaleShader from "./src/renderer/webgl/shaders/GrayscaleShader.mjs";
import BoxBlurShader from "./src/renderer/webgl/shaders/BoxBlurShader.mjs";
import DitheringShader from "./src/renderer/webgl/shaders/DitheringShader.mjs";
import CircularPushShader from "./src/renderer/webgl/shaders/CircularPushShader.mjs";
import InversionShader from "./src/renderer/webgl/shaders/InversionShader.mjs";
import LinearBlurShader from "./src/renderer/webgl/shaders/LinearBlurShader.mjs";
import OutlineShader from "./src/renderer/webgl/shaders/OutlineShader.mjs";
import PixelateShader from "./src/renderer/webgl/shaders/PixelateShader.mjs";
import RadialFilterShader from "./src/renderer/webgl/shaders/RadialFilterShader.mjs";
import RadialGradientShader from "./src/renderer/webgl/shaders/RadialGradientShader.mjs";

import C2dShader from "./src/renderer/c2d/C2dShader.mjs";
import C2dDefaultShader from "./src/renderer/c2d/shaders/DefaultShader.mjs";
import C2dGrayscaleShader from "./src/renderer/c2d/shaders/GrayscaleShader.mjs";
import C2dBlurShader from "./src/renderer/c2d/shaders/BlurShader.mjs";

import Stage from "./src/tree/Stage.mjs";

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
        Grayscale: GrayscaleShader,
        BoxBlur: BoxBlurShader,
        Dithering: DitheringShader,
        CircularPush: CircularPushShader,
        Inversion: InversionShader,
        LinearBlur: LinearBlurShader,
        Outline: OutlineShader,
        Pixelate: PixelateShader,
        RadialFilter: RadialFilterShader,
        RadialGradient: RadialGradientShader,
        WebGLShader,
        WebGLDefaultShader,
        C2dShader,
        C2dDefaultShader,
        c2d: {
            Grayscale: C2dGrayscaleShader,
            Blur: C2dBlurShader
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
        SourceTexture
    },
    misc: {
        ObjectListProxy,
        ObjectListWrapper,
    },
    components: {
        FastBlurComponent,
        SmoothScaleComponent,
        BorderComponent,
        ListComponent
    }
};

export default lightning;