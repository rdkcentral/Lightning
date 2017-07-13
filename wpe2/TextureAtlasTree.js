class TextureAtlasTree {

    constructor(w, h) {
        this.w = w;
        this.h = h;

        this.reset();
    }

    reset() {
        this.root = {x: 0, y: 0, w: this.w, h: this.h};
        this.spaces = new Set([this.root]);
        this.maxH = this.h;
    }

    add(texture) {
        // We need an extra border to fix linear interpolation artifacts (see TextureAtlasRenderer).
        let w = texture.w + 2;
        let h = texture.h + 2;

        if (h > this.maxH) {
            return false;
        }

        let mp = 0;
        let found = null;
        let maxH = 0;
        this.spaces.forEach(function(n) {
            if (n.h > maxH) {
                maxH = n.h;
            }
            if (n.w >= w && n.h >= h) {
                if (!mp || mp > w * h) {
                    mp = w * h;
                    found = n;
                }
            }
        });
        this.maxH = maxH;

        // Best match.
        if (!found) {
            return false;
        }

        this.useNode(found, texture);
        return found;
    }

    findNode(node, w, h) {
        if (!node) return null;
        if (!node.o) {
            if (w <= node.w && h <= node.h) {
                return node;
            } else {
                // No space.
                return null;
            }
        } else {
            return this.findNode(node.r, w, h) || this.findNode(node.d, w, h);
        }
    }

    useNode(node, texture) {
        let w = texture.w + 2, h = texture.h + 2;
        if (node.w > w) {
            node.r = {x: node.x + w, y: node.y, w: node.w - w, h: h};
            this.spaces.add(node.r);
        }
        if (node.h > h) {
            node.d = {x: node.x, y: node.y + h, w: node.w, h: node.h - h};
            this.spaces.add(node.d);
        }
        this.spaces.delete(node);
        node.o = texture;
    }
    
    getTextures() {
        let n = [this.root];

        let textures = [];
        let c = 1;
        while(c) {
            let item = n.pop();
            c--;

            if (item.o) {
                textures.push(item.o);
                if (item.r) {
                    n.push(item.r);
                    c++;
                }
                if (item.d) {
                    n.push(item.d);
                    c++;
                }
            }
        }

        return textures;        
    }
    
}