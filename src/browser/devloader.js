// Node-style browser WPE-loader for development only.
var loadWpe, loadBulk;
(function() {

    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    var loadedSources = {};

    function loadFileContents(absPath){
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest()
            xhr.addEventListener('error', function(){
                console.log(absPath + 'error');
                reject(xhr)
            })
            xhr.addEventListener('timeout', function(){
                console.log(absPath + 'timeout');
                reject(xhr)
            })
            xhr.responseType = 'text'
            xhr.addEventListener('load', function(){
                if(xhr.status !== 200) return reject(xhr);
                loadedSources[absPath] = xhr.response;
                resolve(xhr.response)
            })
            xhr.open('GET', location.origin + absPath)
            xhr.send()
        })
    }

    loadWpe = function(srcPath) {
        var sourceFiles = {
            "EventEmitter":"./browser/EventEmitter.js",
            "WebAdapter":"./browser/WebAdapter.js",
            "Base":"./core/Base.js",
            "Utils":"./core/Utils.js",
            "StageUtils":"./core/StageUtils.js",
            "GeometryUtils":"./core/GeometryUtils.js",
            "Stage":"./core/Stage.js",
            "ShaderProgram":"./core/ShaderProgram.js",
            "Shader":"./core/Shader.js",
            "DefaultShader":"./core/DefaultShader.js",
            "TextureManager":"./core/TextureManager.js",
            "Texture":"./core/Texture.js",
            "TextureSource":"./core/TextureSource.js",
            "TextureAtlas":"./core/TextureAtlas.js",
            "TextureAtlasTree":"./core/TextureAtlasTree.js",
            "View":"./core/View.js",
            "ViewTexturizer":"./core/ViewTexturizer.js",
            "ViewChildList":"./core/ViewChildList.js",
            "ViewCore":"./core/ViewCore.js",
            "VboContext":"./core/VboContext.js",
            "ViewText":"./core/ViewText.js",
            "TextRenderer":"./core/TextRenderer.js",
            "TextRendererSettings":"./core/TextRendererSettings.js",
            "TransitionManager":"./animation/TransitionManager.js",
            "TransitionSettings":"./animation/TransitionSettings.js",
            "Transition":"./animation/Transition.js",
            "AnimationManager":"./animation/AnimationManager.js",
            "AnimationSettings":"./animation/AnimationSettings.js",
            "AnimationActionSettings":"./animation/AnimationActionSettings.js",
            "AnimationActionItems":"./animation/AnimationActionItems.js",
            "Animation":"./animation/Animation.js",
            "Tools":"./tools/Tools.js",
            "ListView":"./tools/ListView.js",
            "BorderView":"./tools/BorderView.js",
            "Light3dShader":"./tools/shaders/Light3dShader.js",
            "LinearBlurShader":"./tools/shaders/LinearBlurShader.js",
            "FxaaShader":"./tools/shaders/FxaaShader.js"
        };
        return loadBulk(srcPath, sourceFiles).then(function(wpe) {
            if (typeof attachInspector !== "undefined") attachInspector(wpe);
            return wpe;
        });
    }

    loadBulk = function(srcPath, sourceFiles) {
        var classes = Object.keys(sourceFiles);
        let deps = classes.map(function(cls) {
            let mainAbsPath = buildPath(sourceFiles[cls], srcPath + "/");
            return loadJS(mainAbsPath);
        })

        var results = {};
        return Promise.all(deps).then(function() {
            var require = makeRequire(srcPath + "/");
            classes.forEach(function(cls) {
                results[cls] = require(sourceFiles[cls]);
            });
            return results;
        });
    };

    function buildBasePath(path) {
        return path.slice(0, path.lastIndexOf('/') + 1);
    }

    var loadedModules = {};
    function makeRequire(basePath, module) {
        return function require(path) {
            var modulePath = buildPath(path, basePath);
            var m = loadedModules[modulePath];
            if (m) {
                return m.exports;
            }

            var source = loadedSources[modulePath];
            if (!source) {
                throw new Error("Unknown dependency: " + modulePath);
            }

            if (isChrome) {
                // Workaround for code mapping bug in chrome.
                source = source.replace(/^\/\*([\S\s]*?)\*\//, function(m, matches) {
                    var lines = matches.split('\n');
                    if (lines.length <= 2) {
                        return m;
                    }
                    return "/*" + lines.slice(0, lines.length - 2).join("\n") + " */";
                });
            }

            try {
                var factory = new Function("require", "exports", "module", source + "\n//# sourceURL=" + location.origin + modulePath + "\n");
            } catch(e) {
                console.error(modulePath, e);
            }
            m = module || {};
            m.exports = {};

            var ret = factory.call(m.exports, makeRequire(buildBasePath(modulePath)), m.exports, m);
            if (ret !== undefined) {
                m.exports = ret;
            }

            loadedModules[modulePath] = m;

            return m.exports;
        }
    }

    function buildPath(path, parent){
        var s = path.lastIndexOf('/')
        var d = path.lastIndexOf('.')
        if(d === -1 || d < s) path = path + '.js'
        var a = path.charAt(0)
        var b = path.charAt(1)
        if(a === '/') return path
        if(a === '.'){
            let out;
            if (b == '.') {
                out = parent + path;
            } else {
                out = parent.slice(0,parent.lastIndexOf('/')) + path.slice(1)
            }
            return normalize(out)
        }
        return normalize('/' + path)
    }

    function normalize(path) {
        let newPath = [];
        path.split('/').forEach(function(section) {
            if (section == '.') {
            } else if (section == '..' && newPath.length) {
                newPath.pop();
            } else {
                newPath.push(section);
            }
        });
        return newPath.join("/");
    }

    var pendingLoads = {};

    function loadJS(absPath) {
        if (pendingLoads[absPath]) {
            return pendingLoads[absPath];
        }

        // Do not load dependencies.
        pendingLoads[absPath] = loadFileContents(absPath);

        return pendingLoads[absPath];
    }
})();

