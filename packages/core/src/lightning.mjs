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

import Application from "./application/Application.mjs";
import Component from "./application/Component.mjs";
import Base from "./tree/Base.mjs";
import Utils from "./tree/Utils.mjs";
import StageUtils from "./tree/StageUtils.mjs";
import Element from "./tree/Element.mjs";
import ElementCore from "./tree/core/ElementCore.mjs";
import ElementTexturizer from "./tree/core/ElementTexturizer.mjs";
import Texture from "./tree/Texture.mjs";

import Tools from "./tools/Tools.mjs";
import ObjMerger from "./tools/ObjMerger.mjs";
import ObjectListProxy from "./tools/ObjectListProxy.mjs";
import ObjectListWrapper from "./tools/ObjectListWrapper.mjs";

import RectangleTexture from "./textures/RectangleTexture.mjs";
import NoiseTexture from "./textures/NoiseTexture.mjs";
import TextTexture from "./textures/TextTexture.mjs";
import ImageTexture from "./textures/ImageTexture.mjs";
import HtmlTexture from "./textures/HtmlTexture.mjs";
import StaticTexture from "./textures/StaticTexture.mjs";
import StaticCanvasTexture from "./textures/StaticCanvasTexture.mjs";
import SourceTexture from "./textures/SourceTexture.mjs";

import ListComponent from "./components/ListComponent.mjs";
import FastBlurComponent from "./components/FastBlurComponent.mjs";
import BloomComponent from "./components/BloomComponent.mjs";
import SmoothScaleComponent from "./components/SmoothScaleComponent.mjs";
import BorderComponent from "./components/BorderComponent.mjs";
import EventEmitter from "./EventEmitter.mjs";

import WebGLShader from "./renderer/webgl/WebGLShader.mjs";
import WebGLDefaultShader from "./renderer/webgl/shaders/DefaultShader.mjs";
import { WebGLGrayscaleShader } from "./renderer/common/shaders/GrayscaleShader.mjs";
import BoxBlurShader from "./renderer/webgl/shaders/BoxBlurShader.mjs";
import DitheringShader from "./renderer/webgl/shaders/DitheringShader.mjs";
import CircularPushShader from "./renderer/webgl/shaders/CircularPushShader.mjs";
import InversionShader from "./renderer/webgl/shaders/InversionShader.mjs";
import LinearBlurShader from "./renderer/webgl/shaders/LinearBlurShader.mjs";
import OutlineShader from "./renderer/webgl/shaders/OutlineShader.mjs";
import PixelateShader from "./renderer/webgl/shaders/PixelateShader.mjs";
import RadialFilterShader from "./renderer/webgl/shaders/RadialFilterShader.mjs";
import RoundedRectangleShader from "./renderer/webgl/shaders/RoundedRectangleShader.mjs";
import FadeOutShader from "./renderer/webgl/shaders/FadeOutShader.mjs";
import VignetteShader from "./renderer/webgl/shaders/VignetteShader.mjs";
import SpinnerShader from "./renderer/webgl/shaders/SpinnerShader.mjs";
import HoleShader from "./renderer/webgl/shaders/HoleShader.mjs";
import RadialGradientShader from "./renderer/webgl/shaders/RadialGradientShader.mjs";
import Light3dShader from "./renderer/webgl/shaders/Light3dShader.mjs";
import PerspectiveShader from "./renderer/webgl/shaders/PerspectiveShader.mjs";
import MagnifierShader from "./renderer/webgl/shaders/MagnifierShader.mjs";

import C2dShader from "./renderer/c2d/C2dShader.mjs";
import C2dDefaultShader from "./renderer/c2d/shaders/DefaultShader.mjs";
import { C2dGrayscaleShader } from "./renderer/common/shaders/GrayscaleShader.mjs";
import C2dBlurShader from "./renderer/c2d/shaders/BlurShader.mjs";

import Stage from "./tree/Stage.mjs";
import SpinnerShader2 from './renderer/webgl/shaders/SpinnerShader2.mjs';

const lightning = {
    Application,
    Component,
    Base,
    Utils,
    StageUtils,
    Element,
    Tools,
    Stage,
    ElementCore,
    ElementTexturizer,
    Texture,
    EventEmitter,
    shaders: {
        Grayscale: WebGLGrayscaleShader,
        BoxBlur: BoxBlurShader,
        Dithering: DitheringShader,
        CircularPush: CircularPushShader,
        Inversion: InversionShader,
        LinearBlur: LinearBlurShader,
        Outline: OutlineShader,
        Pixelate: PixelateShader,
        RadialFilter: RadialFilterShader,
        RoundedRectangle: RoundedRectangleShader,
        Spinner2: SpinnerShader2,
        FadeOut: FadeOutShader,
        Hole: HoleShader,
        Vignette: VignetteShader,
        Spinner: SpinnerShader,
        RadialGradient: RadialGradientShader,
        Light3d: Light3dShader,
        Perspective: PerspectiveShader,
        Magnifier: MagnifierShader,
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
    components: {
        FastBlurComponent,
        BloomComponent,
        SmoothScaleComponent,
        BorderComponent,
        ListComponent
    },
    tools: {
        ObjMerger,
        ObjectListProxy,
        ObjectListWrapper
    }
};

if (Utils.isWeb) {
    window.lng = lightning;
}

export default lightning;
