/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2022 Metrological
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
import C2dShader from "../renderer/c2d/C2dShader.mjs"
import C2dDefaultShader from "../renderer/c2d/shaders/DefaultShader.mjs"
import { WebGLGrayscaleShader } from "../renderer/common/shaders/GrayscaleShader.mjs"
import BoxBlurShader from "../renderer/webgl/shaders/BoxBlurShader.mjs"
import CircularPushShader from "../renderer/webgl/shaders/CircularPushShader.mjs"
import WebGLDefaultShader from "../renderer/webgl/shaders/DefaultShader.mjs"
import DitheringShader from "../renderer/webgl/shaders/DitheringShader.mjs"
import FadeOutShader from "../renderer/webgl/shaders/FadeOutShader.mjs"
import HoleShader from "../renderer/webgl/shaders/HoleShader.mjs"
import InversionShader from "../renderer/webgl/shaders/InversionShader.mjs"
import Light3dShader from "../renderer/webgl/shaders/Light3dShader.mjs"
import LinearBlurShader from "../renderer/webgl/shaders/LinearBlurShader.mjs"
import MagnifierShader from "../renderer/webgl/shaders/MagnifierShader.mjs"
import OutlineShader from "../renderer/webgl/shaders/OutlineShader.mjs"
import PerspectiveShader from "../renderer/webgl/shaders/PerspectiveShader.mjs"
import PixelateShader from "../renderer/webgl/shaders/PixelateShader.mjs"
import RadialFilterShader from "../renderer/webgl/shaders/RadialFilterShader.mjs"
import RadialGradientShader from "../renderer/webgl/shaders/RadialGradientShader.mjs"
import RoundedRectangleShader from "../renderer/webgl/shaders/RoundedRectangleShader.mjs"
import SpinnerShader from "../renderer/webgl/shaders/SpinnerShader.mjs"
import SpinnerShader2 from "../renderer/webgl/shaders/SpinnerShader2.mjs"
import VignetteShader from "../renderer/webgl/shaders/VignetteShader.mjs"
import WebGLShader from "../renderer/webgl/WebGLShader.mjs"
import * as c2d from "./lng.shaders.c2d.namespace.mjs"


export {
  WebGLGrayscaleShader as Grayscale,
  BoxBlurShader as BoxBlur,
  DitheringShader as Dithering,
  CircularPushShader as CircularPush,
  InversionShader as Inversion,
  LinearBlurShader as LinearBlur,
  OutlineShader as Outline,
  PixelateShader as Pixelate,
  RadialFilterShader as RadialFilter,
  RoundedRectangleShader as RoundedRectangle,
  SpinnerShader2 as Spinner2,
  FadeOutShader as FadeOut,
  HoleShader as Hole,
  VignetteShader as Vignette,
  SpinnerShader as Spinner,
  RadialGradientShader as RadialGradient,
  Light3dShader as Light3d,
  PerspectiveShader as Perspective,
  MagnifierShader as Magnifier,
  WebGLShader,
  WebGLDefaultShader,
  C2dShader,
  C2dDefaultShader,
  c2d,
}
