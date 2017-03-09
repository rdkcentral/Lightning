var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

/**
 * The texture atlas.
 * @constructor
 */
function TextureAtlasTree(w, h) {
    this.w = w;
    this.h = h;
    this.root = {x: 0, y: 0, w: w, h: h};
    this.spaces = new Set([this.root]);

    this.maxH = h;
}

TextureAtlasTree.prototype.reset = function() {
    this.root = {x: 0, y: 0, w: this.w, h: this.h};
    this.spaces = new Set([this.root]);
    this.maxH = this.h;
};

TextureAtlasTree.prototype.add = function(texture) {
    // We need an extra border to fix linear interpolation artifacts (see TextureAtlasRenderer).
    var w = texture.w + 2;
    var h = texture.h + 2;

    if (h > this.maxH) {
        return false;
    }

    var mp = 0;
    var found = null;
    var maxH = 0;
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
};

TextureAtlasTree.prototype.findNode = function(node, w, h) {
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
};

TextureAtlasTree.prototype.useNode = function(node, texture) {
    var w = texture.w + 2, h = texture.h + 2;
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
};

/**
 * @returns {Texture[]}
 */
TextureAtlasTree.prototype.getTextures = function() {
    var n = [this.root];

    var textures = [];
    var c = 1;
    while(c) {
        var item = n.pop();
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
};

if (isNode) {
    module.exports = TextureAtlasTree;
}