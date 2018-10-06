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
import ObjectListProxy from "./tools/ObjectListProxy.mjs";
import ObjectListWrapper from "./tools/ObjectListWrapper.mjs";
import ListComponent from "./components/ListComponent.mjs";
import FastBlurComponent from "./components/FastBlurComponent.mjs";
import SmoothScaleComponent from "./components/SmoothScaleComponent.mjs";
import BorderComponent from "./components/BorderComponent.mjs";
import EventEmitter from "./EventEmitter.mjs";

import WebGLShader from "./renderer/webgl/WebGLShader.mjs";
import WebGLDefaultShader from "./renderer/webgl/shaders/DefaultShader.mjs";
import GrayscaleShader from "./renderer/webgl/shaders/GrayscaleShader.mjs";
import BoxBlurShader from "./renderer/webgl/shaders/BoxBlurShader.mjs";
import DitheringShader from "./renderer/webgl/shaders/DitheringShader.mjs";
import CircularPushShader from "./renderer/webgl/shaders/CircularPushShader.mjs";
import InversionShader from "./renderer/webgl/shaders/InversionShader.mjs";
import LinearBlurShader from "./renderer/webgl/shaders/LinearBlurShader.mjs";
import OutlineShader from "./renderer/webgl/shaders/OutlineShader.mjs";
import PixelateShader from "./renderer/webgl/shaders/PixelateShader.mjs";
import RadialFilterShader from "./renderer/webgl/shaders/RadialFilterShader.mjs";
import RadialGradientShader from "./renderer/webgl/shaders/RadialGradientShader.mjs";

import C2dShader from "./renderer/c2d/C2dShader.mjs";
import C2dDefaultShader from "./renderer/c2d/shaders/DefaultShader.mjs";
import C2dGrayscaleShader from "./renderer/c2d/shaders/GrayscaleShader.mjs";
import C2dBlurShader from "./renderer/c2d/shaders/BlurShader.mjs";

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