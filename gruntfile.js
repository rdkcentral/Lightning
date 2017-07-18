module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            'wpe-core-browser' : {
                src : [
                    'src/browser/EventEmitter.js',
                    'src/browser/WebAdapter.js',
                    'src/core/Base.js',
                    'src/core/Utils.js',
                    'src/core/StageUtils.js',
                    'src/core/GeometryUtils.js',
                    'src/core/Stage.js',
                    'src/core/Renderer.js',
                    'src/core/TextureManager.js',
                    'src/core/Texture.js',
                    'src/core/TextureSource.js',
                    'src/core/TextureAtlas.js',
                    'src/core/TextureAtlasTree.js',
                    'src/core/View.js',
                    'src/core/VboContext.js',
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
                    'src/core/Base.js',
                    'src/core/Utils.js',
                    'src/core/StageUtils.js',
                    'src/core/GeometryUtils.js',
                    'src/core/Stage.js',
                    'src/core/Renderer.js',
                    'src/core/TextureManager.js',
                    'src/core/Texture.js',
                    'src/core/TextureSource.js',
                    'src/core/TextureAtlas.js',
                    'src/core/TextureAtlasTree.js',
                    'src/core/View.js',
                    'src/core/VboContext.js',
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
                    'tools/Tools.js'
                ],
                dest : 'dist/wpe.js'
            }
        },
        strip_code: {
            "wpe-core-browser": {
                src: 'dist/wpe-core.js',
                options: {
                    patterns: [/\/\*A¬\*\/(.|\n)+?\/\*¬A\*\//g, /\/\*N¬\*\/(.|\n)+?\/\*¬N\*\//g, /\/\*R¬\*\/(.|\n)+?\/\*¬R\*\//g, /\/\*(.¬|¬.)\*\//g, / *(let|var)[^=]+=\s*require[^)]+\);?\n?/g, / *module\.exports[^;\n]*;?\n?/g]
                }
            },
            "wpe-browser": {
                src: 'dist/wpe.js',
                options: {
                    patterns: [/\/\*N¬\*\/(.|\n)+?\/\*¬N\*\//g, /\/\*R¬\*\/(.|\n)+?\/\*¬R\*\//g, /\/\*(.¬|¬.)\*\//g, / *(let|var)[^=]+=\s*require[^)]+\);?\n?/g, / *module\.exports[^;\n]*;?\n?/g]
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
