module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            'wpe-core-browser' : {
                src : [
                    'src/browser/EventEmitter.js',
                    'src/browser/WebAdapter.js',
                    'src/browser/WpeImageParser.js',
                    'src/core/Base.js',
                    'src/core/Utils.js',
                    'src/core/StageUtils.js',
                    'src/core/Stage.js',
                    'src/core/ShaderProgram.js',
                    'src/core/ShaderBase.js',
                    'src/core/Shader.js',
                    'src/core/Filter.js',
                    'src/core/TextureManager.js',
                    'src/core/Texture.js',
                    'src/core/TextureSource.js',
                    'src/core/TextureAtlas.js',
                    'src/core/TextureAtlasTree.js',
                    'src/core/View.js',
                    'src/core/ObjectList.js',
                    'src/core/ViewChildList.js',
                    'src/core/core/ViewTexturizer.js',
                    'src/core/core/ViewCore.js',
                    'src/core/core/CoreContext.js',
                    'src/core/core/CoreRenderState.js',
                    'src/core/core/CoreQuadList.js',
                    'src/core/core/CoreQuadOperation.js',
                    'src/core/core/CoreFilterOperation.js',
                    'src/core/core/CoreRenderExecutor.js',
                    'src/core/ViewText.js',
                    'src/core/TextRenderer.js',
                    'src/core/TextRendererSettings.js',
                ],
                dest : 'dist/wpe-core.js'
            },
            'wpe-browser' : {
                src : [
                    'src/browser/EventEmitter.js',
                    'src/browser/WebAdapter.js',
                    'src/browser/WpeImageParser.js',
                    'src/core/Base.js',
                    'src/core/Utils.js',
                    'src/core/StageUtils.js',
                    'src/core/Stage.js',
                    'src/core/ShaderProgram.js',
                    'src/core/ShaderBase.js',
                    'src/core/Shader.js',
                    'src/core/Filter.js',
                    'src/core/TextureManager.js',
                    'src/core/Texture.js',
                    'src/core/TextureSource.js',
                    'src/core/TextureAtlas.js',
                    'src/core/TextureAtlasTree.js',
                    'src/core/View.js',
                    'src/core/ObjectList.js',
                    'src/core/ViewChildList.js',
                    'src/core/core/ViewTexturizer.js',
                    'src/core/core/ViewCore.js',
                    'src/core/core/CoreContext.js',
                    'src/core/core/CoreRenderState.js',
                    'src/core/core/CoreQuadList.js',
                    'src/core/core/CoreQuadOperation.js',
                    'src/core/core/CoreFilterOperation.js',
                    'src/core/core/CoreRenderExecutor.js',
                    'src/core/ViewText.js',
                    'src/core/TextRenderer.js',
                    'src/core/TextRendererSettings.js',
                    'src/animation/TransitionManager.js',
                    'src/animation/TransitionSettings.js',
                    'src/animation/Transition.js',
                    'src/animation/AnimationManager.js',
                    'src/animation/AnimationSettings.js',
                    'src/animation/AnimationActionSettings.js',
                    'src/animation/AnimationActionItems.js',
                    'src/animation/Animation.js',
                    'src/tools/Tools.js',
                    'src/tools/misc/ObjectListProxy.js',
                    'src/tools/misc/ObjectListWrapper.js',
                    'src/tools/views/ListView.js',
                    'src/tools/views/BorderView.js',
                    'src/tools/views/FastBlurView.js',
                    "src/tools/shaders/PixelateShader.js",
                    "src/tools/shaders/InversionShader.js",
                    "src/tools/shaders/GrayscaleShader.js",
                    "src/tools/shaders/OutlineShader.js",
                    "src/tools/shaders/CircularPushShader.js",
                    "src/tools/filters/FxaaFilter.js",
                    "src/tools/filters/InversionFilter.js",
                    "src/tools/filters/BlurFilter.js",
                    "src/tools/filters/LinearBlurFilter.js",
                    "src/tools/filters/GrayscaleFilter.js",
                ],
                dest : 'dist/wpe.js'
            }
        },
        strip_code: {
            "wpe-core-browser": {
                src: 'dist/wpe-core.js',
                options: {
                    patterns: [/\/\*A¬\*\/(.|\n)+?\/\*¬A\*\//g, /\/\*M¬\*\/(.|\n)+?\/\*¬M\*\//g, /\/\*(.¬|¬.)\*\//g, / *(let|var)[^=]+=\s*require[^)]+\);?\n?/g, / *module\.exports[^;\n]*;?\n?/g]
                }
            },
            "wpe-browser": {
                src: 'dist/wpe.js',
                options: {
                    patterns: [/\/\*M¬\*\/(.|\n)+?\/\*¬M\*\//g, /\/\*(.¬|¬.)\*\//g, / *(let|var|const)[^=]+=\s*require[^)]+\);?\n?/g, / *module\.exports[^;\n]*;?\n?/g]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-strip-code');
    grunt.registerTask('wpe-core-browser', [ 'concat:wpe-core-browser', 'strip_code:wpe-core-browser' ]);
    grunt.registerTask('wpe-browser', [ 'concat:wpe-browser', 'strip_code:wpe-browser' ]);

};
