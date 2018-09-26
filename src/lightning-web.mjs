import Application from "./application/Application.mjs";
import Component from "./application/Component.mjs";
import Base from "./tree/Base.mjs";
import Utils from "./tree/Utils.mjs";
import StageUtils from "./tree/StageUtils.mjs";
import Shader from "./tree/Shader.mjs";
import Filter from "./tree/Filter.mjs";
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
import ListView from "./tools/views/ListView.mjs";
import BorderView from "./tools/views/BorderView.mjs";
import FastBlurView from "./tools/views/FastBlurView.mjs";
import SmoothScaleView from "./tools/views/SmoothScaleView.mjs";
import DitheringShader from "./tools/shaders/DitheringShader.mjs";
import RadialGradientShader from "./tools/shaders/RadialGradientShader.mjs";
import PixelateShader from "./tools/shaders/PixelateShader.mjs";
import InversionShader from "./tools/shaders/InversionShader.mjs";
import GrayscaleShader from "./tools/shaders/GrayscaleShader.mjs";
import OutlineShader from "./tools/shaders/OutlineShader.mjs";
import CircularPushShader from "./tools/shaders/CircularPushShader.mjs";
import RadialFilterShader from "./tools/shaders/RadialFilterShader.mjs";
import FxaaFilter from "./tools/filters/FxaaFilter.mjs";
import InversionFilter from "./tools/filters/InversionFilter.mjs";
import BlurFilter from "./tools/filters/BlurFilter.mjs";
import LinearBlurFilter from "./tools/filters/LinearBlurFilter.mjs";
import GrayscaleFilter from "./tools/filters/GrayscaleFilter.mjs";
import EventEmitter from "./EventEmitter.mjs";

import Stage from "./tree/Stage.mjs";
import WebAdapter from "./browser/WebAdapter.mjs";
Stage.ADAPTER = WebAdapter;

const lightning = {
    Application,
    Component,
    Base,
    Utils,
    StageUtils,
    Shader,
    Filter,
    View,
    Tools,
    Stage,
    ViewCore,
    ViewTexturizer,
    Texture,
    EventEmitter,
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
    views: {ListView,
        BorderView,
        FastBlurView,
        SmoothScaleView,
    },
    shaders: {
        DitheringShader,
        RadialGradientShader,
        PixelateShader,
        InversionShader,
        GrayscaleShader,
        OutlineShader,
        CircularPushShader,
        RadialFilterShader,
    },
    filters: {
        FxaaFilter,
        InversionFilter,
        BlurFilter,
        LinearBlurFilter,
        GrayscaleFilter,
    }
}

// Legacy.
window.wuf = lightning;

export default lightning;