var isNode = !!(((typeof module !== "undefined") && module.exports));

if (isNode) {
    var Utils = require('./Utils');
}

var ComponentTags = function(component) {

    this.component = component;

    /**
     * Parent component's tag manager.
     * @type {ComponentTags}
     */
    this.parent = null;

    /**
     * Tags that can be used to identify/search for a specific component.
     * @type {String[]}
     */
    this.tags = null;

    /**
     * The tree's tags mapping.
     * This contains all components for all known tags, at all times.
     * @type {Map}
     * @private
     */
    this.treeTags = null;

    /**
     * Cache for the tag/mtag methods.
     * @type {Map<String,Component[]>}
     */
    this.cache = null;

    /**
     * Tag-to-complex cache (all tags that are part of the complex caches).
     * This maps tags to cached complex tags in the cache.
     * @type {Map<String,String[]>}
     */
    this.tagToComplex = null;

};

/**
 * Clears the cache(s) for the specified tag.
 * @param {String} tag
 */
ComponentTags.prototype.clearCache = function(tag) {
    if (this.cache) {
        this.cache.delete(tag);

        if (this.tagToComplex) {
            var s = this.tagToComplex.get(tag);
            if (s) {
                for (var i = 0, n = s.length; i < n; i++) {
                    this.cache.delete(s[i]);
                }
                this.tagToComplex.delete(tag);
            }
        }
    }
};

ComponentTags.prototype.unsetParent = function() {
    var tags = null;
    var n = 0;
    if (this.treeTags) {
        tags = Utils.iteratorToArray(this.treeTags.keys());
        n = tags.length;

        if (n > 0) {
            for (var i = 0; i < n; i++) {
                var tagSet = this.treeTags.get(tags[i]);

                // Remove from treeTags.
                var p = this;
                while (p = p.parent) {
                    var parentTreeTags = p.treeTags.get(tags[i]);

                    tagSet.forEach(function(comp) {
                        parentTreeTags.delete(comp);
                    });


                    p.clearCache(tags[i]);
                }
            }
        }
    }

};

ComponentTags.prototype.setParent = function(parent) {
    this.parent = parent;

    var tags = null;
    var n = 0;
    if (this.treeTags) {
        tags = Utils.iteratorToArray(this.treeTags.keys());
        n = tags.length;

        if (n > 0) {
            for (var i = 0; i < n; i++) {
                var tagSet = this.treeTags.get(tags[i]);

                // Add to treeTags.
                var p = this;
                while (p = p.parent) {
                    if (!p.treeTags) {
                        p.treeTags = new Map();
                    }

                    var s = p.treeTags.get(tags[i]);
                    if (!s) {
                        s = new Set();
                        p.treeTags.set(tags[i], s);
                    }

                    tagSet.forEach(function(comp) {
                        s.add(comp);
                    });

                    p.clearCache(tags[i]);
                }
            }
        }
    }
};

ComponentTags.prototype.getLocalTags = function() {
    // We clone it to make sure it's not changed externally.
    return this.tags;
};

ComponentTags.prototype.setTags = function(tags) {
    if (!Utils.isArray(tags)) {
        tags = [tags];
    }

    var i, n = tags.length;
    var removes = [];
    var adds = [];
    for (i = 0; i < n; i++) {
        if (!this.hasTag(tags[i])) {
            adds.push(tags[i]);
        }
    }

    var currentTags = this.tags || [];
    n = currentTags.length;
    for (i = 0; i < n; i++) {
        if (tags.indexOf(currentTags[i]) == -1) {
            removes.push(currentTags[i]);
        }
    }

    for (i = 0; i < removes.length; i++) {
        this.removeTag(removes[i]);
    }

    for (i = 0; i < adds.length; i++) {
        this.addTag(adds[i]);
    }
};

ComponentTags.prototype.addTag = function(tag) {
    if (!this.tags) {
        this.tags = [];
    }
    if (this.tags.indexOf(tag) === -1) {
        this.tags.push(tag);

        // Add to treeTags hierarchy.
        var p = this;
        do {
            if (!p.treeTags) {
                p.treeTags = new Map();
            }

            var s = p.treeTags.get(tag);
            if (!s) {
                var s = new Set();
                p.treeTags.set(tag, s);
            }

            s.add(this.component);

            p.clearCache(tag);
        } while (p = p.parent);
    }
};

ComponentTags.prototype.removeTag = function(tag) {
    var i = this.tags.indexOf(tag);
    if (i !== -1) {
        this.tags.splice(i, 1);

        // Remove from treeTags hierarchy.
        var p = this;
        do {
            var list = p.treeTags.get(tag);
            if (list) {
                list.delete(this.component);

                p.clearCache(tag);
            }
        } while (p = p.parent);
    }
};

ComponentTags.prototype.hasTag = function(tag) {
    return (this.tags && (this.tags.indexOf(tag) !== -1));
};

/**
 * Returns one of the components from the subtree that have this tag.
 * @param {string} tag
 * @returns {Component}
 */
ComponentTags.prototype.tag = function(tag) {
    var res = this.mtag(tag);
    return res[0];
};

ComponentTags.prototype.get = function(tag) {
    var t = this.treeTags.get(tag);
    return t ? Utils.setToArray(t) : [];
};

/**
 * Returns all components from the subtree that have this tag.
 * @param {string} tag
 * @returns {Component[]}
 */
ComponentTags.prototype.mtag = function(tag) {
    var res = null;
    if (this.cache) {
        res = this.cache.get(tag);
    }

    if (!res) {
        var idx = tag.indexOf(".");
        if (idx >= 0) {
            var parts = tag.split('.');
            res = this.get(parts[0]);
            var level = 1;
            var c = parts.length;
            while (res.length && level < c) {
                var resn = [];
                for (var j = 0, n = res.length; j < n; j++) {
                    resn = resn.concat(res[j]._tags.get(parts[level]));
                }

                res = resn;
                level++;
            }
        } else {
            res = this.get(tag);
        }

        if (!this.cache) {
            this.cache = new Map();
        }

        this.cache.set(tag, res);
    }
    return res;
};

if (isNode) {
    module.exports = ComponentTags;
}
