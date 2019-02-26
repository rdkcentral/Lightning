const path = require('path');

module.exports = function localResolver(platform) {
    return {
        resolveId(importee, importer) {
            if (importee.indexOf('.' + path.sep) === -1) {
                return null;
            }

            if (!importer) {
                return null;
            }

            const filename = importee.split(path.sep).pop();

            const endsWith = ".dev.mjs";
            if (filename.lastIndexOf(endsWith) === (filename.length - endsWith.length)) {
                const absPath = path.resolve(importer, '..', importee.substr(0, importee.length - endsWith.length) + "." + platform + ".mjs");
                return absPath
            }
        }
    };
}