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
