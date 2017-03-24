var ComponentTags = function(component) {
    this.component = component;

    /**
     * Parent component's tag manager.
     * @type {ComponentTags}
     */
    this.parent = null;
    
    /**
     * Tags that can be used to identify/search for a specific component.
     * @type {Set}
     */
    this.tags = null;

    /**
     * All of the direct children that have the tag enabled somewhere in their branches.
     * @type {Map<String,Component[]>}
     */
    this.taggedBranches = null;

    /**
     * Cache for the .tag method.
     * @type {Map<String,Component>}
     */
    this.tagCache = null;

    /**
     * Cache for the .mtag method.
     * @type {Map<String,Component[]>}
     */
    this.mtagCache = null;

    /**
     * The tags (simple only) that have been requested (by this or ancestor).
     * @type {Set<String>}
     */
    this.cachedTags = null;

    /**
     * The parent's cached complex tags that should be cleared if the indexed cached complex tag is cleared.
     * @type {Map<String,Set<String>>}
     */
    this.cachedComplexTagParents = null;

    /**
     * The complex tags, lookup map for first (primary) tag segment.
     * @type {Map<String,Set<String>>}
     */
    this.cachedComplexTagLookup = null;
    
};

ComponentTags.prototype.unsetParent = function() {
    var tags = this.tags ? Utils.setToArray(this.tags) : [];
    if (this.taggedBranches) {
        tags = tags.concat(Utils.iteratorToArray(this.taggedBranches.keys()));
    }

    if (tags.length) {
        this.parent.clearCachedTags(tags, []);

        for (var i = 0, n = tags.length; i < n; i++) {
            this.parent.removeTaggedBranch(tags[i], this.component);
        }
    }

    this.parent = null;
};

ComponentTags.prototype.setParent = function(parent) {
    this.parent = parent;

    var tags = this.tags ? Utils.setToArray(this.tags) : [];
    if (this.taggedBranches) {
        tags = tags.concat(Utils.iteratorToArray(this.taggedBranches.keys()));
    }

    for (var i = 0, n = tags.length; i < n; i++) {
        this.parent.addTaggedBranch(tags[i], this.component);
    }

    if (tags.length) {
        this.parent.clearCachedTags(tags, []);
    }

};

ComponentTags.prototype.getLocalTags = function() {
    return this.tags ? Utils.setToArray(this.tags) : [];
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

    var currentTags = this.tags ? Utils.setToArray(this.tags) : [];
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
    if (!this.tags) this.tags = new Set();
    if (!this.tags.has(tag)) {
        this.tags.add(tag);
        if (!this.hasTaggedBranches(tag) && this.parent) {
            this.parent.addTaggedBranch(tag, this.component);

            if (this.parent.hasCachedTag(tag)) {
                this.addCachedTag(tag);
            }
        }

        this.clearCachedTag(tag);
    }
};

ComponentTags.prototype.removeTag = function(tag) {
    if (this.hasTag(tag)) {
        this.clearCachedTag(tag);

        this.tags.delete(tag);

        if (!this.hasTaggedBranches(tag) && this.parent) {
            this.parent.removeTaggedBranch(tag, this.component);
        }
    }
};

ComponentTags.prototype.hasTag = function(tag) {
    return this.tags && this.tags.has(tag);
};


ComponentTags.prototype.getTaggedBranches = function(tag) {
    return this.taggedBranches && this.taggedBranches.get(tag);
};

ComponentTags.prototype.hasTaggedBranches = function(tag) {
    return this.taggedBranches && this.taggedBranches.has(tag);
};

ComponentTags.prototype.addTaggedBranch = function(tag, component) {
    if (!this.taggedBranches) {
        this.taggedBranches = new Map();
    }

    var components = this.taggedBranches.get(tag);
    if (!components) {
        this.taggedBranches.set(tag, [component]);

        if (this.parent) {
            this.parent.addTaggedBranch(tag, this.component);

            // Ensure that caches are cleared properly when adding children.
            if (this.parent.hasCachedTag(tag)) {
                this.addCachedTag(tag);
            }
        }
    } else {
        components.push(component);
    }
};

ComponentTags.prototype.removeTaggedBranch = function(tag, component) {
    var components = this.taggedBranches.get(tag);

    // Quickly remove component from list.
    var n = components.length;
    if (n === 1) {
        this.taggedBranches.delete(tag);

        if (this.tagCache) this.tagCache.delete(tag);
        if (this.mtagCache) this.mtagCache.delete(tag);
        if (this.cachedTags) this.cachedTags.delete(tag);

        if (this.parent) {
            this.parent.removeTaggedBranch(tag, this.component);
        }
    } else {
        var i = components.indexOf(component);
        if (i < n - 1) {
            components[i] = components[n - 1];
        }
        components.pop();
    }
};

/**
 * Returns all components from the subtree that have this tag.
 * @param {string} tag
 * @returns {Component[]}
 */
ComponentTags.prototype.tag = function(tag) {
    var idx = tag.indexOf(".");
    if (idx >= 0) {
        var results = this.mtagComplex(tag, null);
        return results.length ? results[0] : null;
    } else {
        return this.tagSimple(tag);
    }
};

ComponentTags.prototype.tagSimple = function(tag) {
    if (!this.tagCache) {
        this.tagCache = new Map();
    }

    var tc = this.tagCache.get(tag);
    if (tc) {
        return tc;
    } else {
        var tc = this.getTaggedComponent(tag);
        this.tagCache.set(tag, tc);
        return tc;
    }
};

ComponentTags.prototype.getTaggedComponent = function(tag) {
    this.addCachedTag(tag);

    if (this.hasTag(tag)) {
        return this.component;
    } else {
        var branches = this.getTaggedBranches(tag);
        if (branches) {
            return branches[0].tags.getTaggedComponent(tag);
        }
    }
    return null;
};

/**
 * Returns all components from the subtree that have this tag.
 * @param {string} tag
 * @returns {Component[]}
 */
ComponentTags.prototype.mtag = function(tag) {
    var idx = tag.indexOf(".");
    if (idx >= 0) {
        return this.mtagComplex(tag, null);
    } else {
        return this.mtagSimple(tag);
    }
};

/**
 * Returns all components from the subtree that have this tag.
 * @param {string} tag
 * @returns {Component[]}
 */
ComponentTags.prototype.mtagSimple = function(tag) {
    if (!this.mtagCache) {
        this.mtagCache = new Map();
    }

    var tc = this.mtagCache.get(tag);
    if (tc) {
        return tc;
    } else {
        var arr = [];
        this.getTaggedComponents(tag, arr);
        this.mtagCache.set(tag, arr);
        return arr;
    }
};

ComponentTags.prototype.getTaggedComponents = function(tag, arr) {
    this.addCachedTag(tag);

    if (this.hasTag(tag)) {
        return arr.push(this.component);
    } else {
        var branches = this.getTaggedBranches(tag);
        if (branches) {
            for (var i = 0, n = branches.length; i < n; i++) {
                branches[i].tags.getTaggedComponents(tag, arr);
            }
        }
    }
};

/**
 * Mtag implementation for complex tags.
 * @param {string} tag
 * @param {string|null} parentTag
 *   If this query is actually part of a larger complex tag query, the parent.
 * @returns {Component[]}
 */
ComponentTags.prototype.mtagComplex = function(tag, parentTag) {
    if (!this.mtagCache) {
        this.mtagCache = new Map();
    }

    var tc = this.mtagCache.get(tag);
    if (tc) {
        return tc;
    } else {
        var idx = tag.indexOf(".");
        var primaryTag = tag.substr(0, idx);
        var remainingTag = tag.substr(idx + 1);

        var s = [];
        this.getTaggedComponentsForComplex(primaryTag, tag, s);

        var remainingTagIsComplex = (remainingTag.indexOf(".") >= 0);

        var res = [];
        if (!remainingTagIsComplex) {
            for (var i = 0, n = s.length; i < n; i++) {
                s[i].tags.getTaggedComponents(remainingTag, res);
                s[i].tags.addCachedComplexTagParent(remainingTag, tag);
            }
        } else {
            for (i = 0, n = s.length; i < n; i++) {
                res = res.concat(s[i].tags.mtagComplex(remainingTag, tag));
            }
        }

        this.mtagCache.set(tag, res);

        this.addCachedComplexTagLookup(primaryTag, tag);
        if (parentTag) {
            this.addCachedComplexTagParent(tag, parentTag);
        }

        return res;
    }
};

ComponentTags.prototype.getTaggedComponentsForComplex = function(tag, complexTag, arr) {
    this.addCachedTag(tag);
    this.addCachedTag(complexTag);

    if (this.hasTag(tag)) {
        return arr.push(this.component);
    } else {
        var branches = this.getTaggedBranches(tag);
        if (branches) {
            for (var i = 0, n = branches.length; i < n; i++) {
                branches[i].tags.getTaggedComponents(tag, arr, complexTag);
            }
        }
    }
};

ComponentTags.prototype.hasCachedTag = function(tag) {
    return this.cachedTags && this.cachedTags.has(tag);
};

ComponentTags.prototype.addCachedTag = function(tag) {
    if (!this.cachedTags) {
        this.cachedTags = new Set();
    }

    this.cachedTags.add(tag);
};

ComponentTags.prototype.clearCachedTag = function(tag) {
    var c = this;
    while(c !== null && c.hasCachedTag(tag)) {
        if (c.cachedComplexTagLookup) {
            var s = c.cachedComplexTagLookup.get(tag);
            if (s && s.size) {
                // Upgrade to multi-clear.
                c.clearCachedTags([tag], []);
                return;
            }
        }

        if (c.cachedComplexTagParents && c.parent) {
            var s = c.cachedComplexTagParents.get(tag);
            if (s && s.size) {
                // Upgrade to multi-clear.
                c.clearCachedTags([tag], []);
                return;
            }
        }

        c.cachedTags.delete(tag);

        if (c.tagCache) {
            c.tagCache.delete(tag);
        }

        if (c.mtagCache) {
            c.mtagCache.delete(tag);
        }

        c = c.parent;
    }
};

ComponentTags.prototype.clearCachedTags = function(tags, complexTags) {
    var i, n;
    var c = this;

    while(c !== null && (tags.length || complexTags.length)) {

        var remaining;
        if (tags.length) {
            remaining = [];
            for (i = 0, n = tags.length; i < n; i++) {
                if (c.hasCachedTag(tags[i])) {
                    c.cachedTags.delete(tags[i]);
                    remaining.push(tags[i]);
                }
            }
            tags = remaining;
        }

        if (complexTags.length) {
            remaining = [];
            for (i = 0, n = complexTags.length; i < n; i++) {
                if (c.hasCachedTag(complexTags[i])) {
                    c.cachedTags.delete(complexTags[i]);
                    remaining.push(complexTags[i]);
                }
            }
            complexTags = remaining;
        }

        if (tags.length) {
            n = tags.length;
            if (c.cachedComplexTagLookup) {
                for (i = 0; i < n; i++) {
                    var s = c.cachedComplexTagLookup.get(tags[i]);
                    if (s && s.size) {
                        s.forEach(function(value) {
                            complexTags.push(value);
                        });
                        s.clear();
                    }
                }
            }

            if (c.tagCache) {
                for (i = 0; i < n; i++) {
                    c.tagCache.delete(tags[i]);
                }
            }
            if (c.mtagCache) {
                for (i = 0; i < n; i++) {
                    c.mtagCache.delete(tags[i]);
                }
            }

            if (c.cachedComplexTagParents && c.parent) {
                for (i = 0; i < n; i++) {
                    s = c.cachedComplexTagParents.get(tags[i]);
                    if (s && s.size) {
                        s.forEach(function (value) {
                            complexTags.push(value);
                        });
                        s.clear();
                    }
                }
            }
        }


        if (complexTags.length) {
            n = complexTags.length;

            if (c.tagCache) {
                for (i = 0; i < n; i++) {
                    c.tagCache.delete(complexTags[i]);
                }
            }
            if (c.mtagCache) {
                for (i = 0; i < n; i++) {
                    c.mtagCache.delete(complexTags[i]);
                }
            }

            if (c.cachedComplexTagParents && c.parent) {
                for (i = 0; i < n; i++) {
                    s = c.cachedComplexTagParents.get(complexTags[i]);
                    if (s && s.size) {
                        s.forEach(function(value) {
                            complexTags.push(value);
                        });
                        s.clear();
                    }
                }
            }
        }

        c = c.parent;
    }
};


ComponentTags.prototype.addCachedComplexTagLookup = function(primaryTag, tag) {
    if (!this.cachedComplexTagLookup) {
        this.cachedComplexTagLookup = new Map();
    }
    var s = this.cachedComplexTagLookup.get(primaryTag);
    if (!s) {
        s = new Set();
        this.cachedComplexTagLookup.set(primaryTag, s);
    }
    s.add(tag);
};

ComponentTags.prototype.addCachedComplexTagParent = function(tag, parentTag) {
    if (!this.cachedComplexTagParents) {
        this.cachedComplexTagParents = new Map();
    }
    var s = this.cachedComplexTagParents.get(tag);
    if (!s) {
        s = new Set();
        this.cachedComplexTagParents.set(tag, s);
    }
    s.add(parentTag);
};
