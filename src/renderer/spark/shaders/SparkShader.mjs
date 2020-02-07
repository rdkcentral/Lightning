import DefaultShader from "../../webgl/shaders/DefaultShader.mjs";

export default class SparkShader extends DefaultShader {

    draw(operation) {
        let gl = this.gl;

        let length = operation.length;

        if (length) {
            let glTexture = operation.getTexture(0);
            let pos = 0;
            for (let i = 0; i < length; i++) {
                let tx = operation.getTexture(i);
                if (glTexture !== tx) {
                    if (glTexture.options && glTexture.options.imageRef) {
                        let elementPostion = (i > 0) ? (i - 1) : i;
                        const precision = this.ctx.stage.getOption('precision');
                        let vc = operation.getElementCore(elementPostion);
                        this.ctx.stage.platform.paint(gl, glTexture.options.imageRef, vc._worldContext.px*precision, vc._worldContext.py*precision, vc._colorUl);
                    } else {
                        gl.bindTexture(gl.TEXTURE_2D, glTexture);
                        gl.drawElements(gl.TRIANGLES, 6 * (i - pos), gl.UNSIGNED_SHORT, (pos + operation.index) * 6 * 2);
                    }
                    glTexture = tx;
                    pos = i;
                }
            }
            if (pos < length) {
                if (glTexture.options && glTexture.options.imageRef) {
                    const precision = this.ctx.stage.getOption('precision');
                    let vc = operation.getElementCore(pos);
                    this.ctx.stage.platform.paint(gl, glTexture.options.imageRef, vc._worldContext.px*precision, vc._worldContext.py*precision, vc._colorUl);
                } else {
                    gl.bindTexture(gl.TEXTURE_2D, glTexture);
                    gl.drawElements(gl.TRIANGLES, 6 * (length - pos), gl.UNSIGNED_SHORT, (pos + operation.index) * 6 * 2);
                }
            }
        }
    }

}