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
/**
 * A simple test using a sample custom texture implementation
 *
 * @module
 */
import Lightning from "../../index.js";

type DrawFrameCallback = (canvas: HTMLCanvasElement) => void;
export default class DynamicCanvasTexture extends Lightning.Texture {
  private _canvas: HTMLCanvasElement = this.stage.platform.getDrawingCanvas();
  private _drawFrame: DrawFrameCallback = () => {};

  constructor(stage: Lightning.Stage) {
    super(stage);
    this._canvas = stage.platform.getDrawingCanvas();

    this._canvas.width = 100;
    this._canvas.height = 100;

    this.stage.on('frameStart', () => {
      this._drawFrame(this._canvas);
      this._changed();
    });
  }

  set drawFrame(v: DrawFrameCallback) {
    this._drawFrame = v;
    this._changed();
  }

  get drawFrame(): DrawFrameCallback {
    return this._drawFrame;
  }

  override _getIsValid() {
    return true;
  }

  override _getLookupId() {
    return null;
  }

  override _getSourceLoader(): Lightning.Texture.SourceLoaderCallback {
    return (cb) => {
      cb(null, this.stage.platform.getTextureOptionsForDrawingCanvas(this._canvas));
    }
  }
}
