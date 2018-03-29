const Texture = require('../tree/Texture');

class RoundRectTexture extends Texture {

    constructor(stage) {
        super(stage)

        this._w = 100
        this._h = 100
        this._radius = [0, 0, 0, 0]
        this._strokeWidth = 0
        this._strokeColor = 0xFFFFFFFF
        this._fill = true
        this._fillColor = 0xFFFFFFFF
    }

    set w(v) {
        if (this._w !== v) {
            this._w = v
            this._changed()
        }
    }

    set h(v) {
        if (this._h !== v) {
            this._h = v
            this._changed()
        }
    }

    set radius(v) {
        if (!Array.isArray(v)){
            // upper-left, upper-right, bottom-right, bottom-left.
            v = [v, v, v, v]
        }
        
        this._radius = v
        this._changed()
    }

    set strokeWidth(v) {
        if (this._strokeWidth !== v) {
            this._strokeWidth = v
            this._changed()
        }
    }

    set strokeColor(v) {
        if (this._strokeColor !== v) {
            this._strokeColor = v
            this._changed()
        }
    }
    
    set fill(v) {
        if (this._fill !== !!v) {
            this._fill = !!v
            this._changed()
        }
    }
    
    set fillColor(v) {
        if (this._fillColor !== v) {
            this._fillColor = v
            this._changed()
        }
    }

    _getIsValid() {
        return true
    }

    _getLookupId() {
        return 'rect' + [this._w, this._h, this._strokeWidth, this._strokeColor, this._fill ? 1 : 0, this._fillColor].concat(this._radius).join(",")
    }

    _getSourceLoader() {
        const args = {
            w: this._w,
            h: this._h,
            radius: this._radius.slice(),
            strokeWidth: this._strokeWidth,
            strokeColor: this._strokeColor,
            fill: this._fill,
            fillColor: this._fillColor
        }

        const canvasFactory = () => {
            return RoundRectTexture.createRoundRect(this.stage, args)
        }

        return function(cb) {
            cb(null, this.stage.adapter.getTextureOptionsForDrawingCanvas(canvasFactory()))
        }
    }

    getNonDefaults() {
        const obj = super.getNonDefaults()
        if (this._w) {
            obj.w = this.w
        }
        if (this._h) {
            obj.h = this.h
        }

        //@todo: other properties
        return obj
    }


    static createRoundRect(stage, args) {
        const canvas = stage.adapter.getDrawingCanvas();
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        const w = args.w, h = args.h;

        canvas.width = w + args.strokeWidth + 2;
        canvas.height = h + args.strokeWidth + 2;

        ctx.beginPath();
        let x = 0.5 * args.strokeWidth + 1, y = 0.5 * args.strokeWidth + 1;

        ctx.moveTo(x + args.radius[0], y);
        ctx.lineTo(x + w - args.radius[1], y);
        ctx.arcTo(x + w, y, x + w, y + args.radius[1], args.radius[1]);
        ctx.lineTo(x + w, y + h - args.radius[2]);
        ctx.arcTo(x + w, y + h, x + w - args.radius[2], y + h, args.radius[2]);
        ctx.lineTo(x + args.radius[3], y + h);
        ctx.arcTo(x, y + h, x, y + h - args.radius[3], args.radius[3]);
        ctx.lineTo(x, y + args.radius[0]);
        ctx.arcTo(x, y, x + args.radius[0], y, args.radius[0]);

        if (args.fill) {
            if (Utils.isNumber(args.fillColor)) {
                ctx.fillStyle = StageUtils.getRgbaString(args.fillColor);
            } else {
                ctx.fillStyle = "white";
            }
            ctx.fill();
        }

        if (args.strokeWidth) {
            if (Utils.isNumber(args.strokeColor)) {
                ctx.strokeStyle = StageUtils.getRgbaString(args.strokeColor);
            } else {
                ctx.strokeStyle = "white";
            }
            ctx.lineWidth = args.strokeWidth;
            ctx.stroke();
        }

        return canvas;
    }

}

const Utils = require('../tree/Utils')
const StageUtils = require('../tree/StageUtils')

module.exports = RoundRectTexture