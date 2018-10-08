const path = require('path');

module.exports = function localResolver(platform) {
    return {
        resolveId(importee, importer) {
            if (importee.indexOf('./') === -1) {
                return null;
            }

            if (!importer) {
                return null;
            }

            const filename = importee.split('/').pop();

            const endsWith = ".dev.mjs";
            if (filename.lastIndexOf(endsWith) === (filename.length - endsWith.length)) {
                const absPath = path.resolve(importer, '..', importee.substr(0, importee.length - endsWith.length) + "." + platform + ".mjs");
                return absPath
            }
        }
    };
}