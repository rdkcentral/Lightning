module.exports = function(grunt) {
    grunt.initConfig({
        concat: {
            options: {
                banner: "window.wuf = (function() {\n",
                footer: `
return {
    Application: Application,
    Component: Component,
    Base: Base,
    Utils: Utils,
    StageUtils: StageUtils,
    Shader: Shader,
    Filter: Filter,
    View: View,
    Tools: Tools,
    textures: {
        SourceTexture: SourceTexture,
        RectangleTexture: RectangleTexture,
        TextTexture: TextTexture,
        ImageTexture: ImageTexture,
        RoundRectTexture: RoundRectTexture
    },
    misc: {
        ObjectListProxy: ObjectListProxy,
        ObjectListWrapper: ObjectListWrapper
    },
    views: {
        ListView: ListView,
        BorderView: BorderView,
        FastBlurView: FastBlurView,
        SmoothScaleView: SmoothScaleView
    },
    shaders: {
        PixelateShader: PixelateShader,
        InversionShader: InversionShader,
        GrayscaleShader: GrayscaleShader,
        OutlineShader: OutlineShader,
        CircularPushShader: CircularPushShader,
        RadialFilterShader: RadialFilterShader
    },
    filters: {
        FxaaFilter: FxaaFilter,
        InversionFilter: InversionFilter,
        BlurFilter: BlurFilter,
        LinearBlurFilter: LinearBlurFilter,
        GrayscaleFilter: GrayscaleFilter
    },
    _internal: {
        Stage: Stage,
        ViewCore: ViewCore,
        ViewTexturizer: ViewTexturizer
    },
    EventEmitter: EventEmitter
}
})();`
            },
            'wuf' : {
                src : [
                    'src/browser/EventEmitter.js',
                    'src/browser/WebAdapter.js',
                    'src/browser/WpeImageParser.js',
                    'src/tree/Base.js',
                    'src/tree/Utils.js',
                    'src/tree/StageUtils.js',
                    'src/tree/Stage.js',
                    'src/tree/ShaderProgram.js',
                    'src/tree/ShaderBase.js',
                    'src/tree/Shader.js',
                    'src/tree/Filter.js',
                    'src/tree/TextureManager.js',
                    'src/tree/Texture.js',
                    'src/tree/TextureSource.js',
                    'src/tree/TextureAtlas.js',
                    'src/tree/TextureAtlasTree.js',
                    'src/tree/View.js',
                    'src/tree/ObjectList.js',
                    'src/tree/ViewChildList.js',
                    'src/tree/core/ViewTexturizer.js',
                    'src/tree/core/ViewCore.js',
                    'src/tree/core/CoreContext.js',
                    'src/tree/core/CoreRenderState.js',
                    'src/tree/core/CoreQuadList.js',
                    'src/tree/core/CoreQuadOperation.js',
                    'src/tree/core/CoreFilterOperation.js',
                    'src/tree/core/CoreRenderExecutor.js',
                    'src/animation/TransitionManager.js',
                    'src/animation/TransitionSettings.js',
                    'src/animation/Transition.js',
                    'src/animation/AnimationManager.js',
                    'src/animation/AnimationSettings.js',
                    'src/animation/AnimationActionSettings.js',
                    'src/animation/AnimationActionItems.js',
                    'src/animation/Animation.js',
                    'src/textures/RectangleTexture.js',
                    'src/textures/ImageTexture.js',
                    'src/textures/SourceTexture.js',
                    'src/textures/RoundRectTexture.js',
                    'src/textures/TextTexture.js',
                    'src/textures/TextTextureRenderer.js',
                    'src/tools/Tools.js',
                    'src/tools/misc/ObjectListProxy.js',
                    'src/tools/misc/ObjectListWrapper.js',
                    'src/tools/views/ListView.js',
                    'src/tools/views/BorderView.js',
                    'src/tools/views/FastBlurView.js',
                    'src/tools/views/SmoothScaleView.js',
                    "src/tools/shaders/PixelateShader.js",
                    "src/tools/shaders/InversionShader.js",
                    "src/tools/shaders/GrayscaleShader.js",
                    "src/tools/shaders/OutlineShader.js",
                    "src/tools/shaders/CircularPushShader.js",
                    "src/tools/shaders/RadialFilterShader.js",
                    "src/tools/filters/FxaaFilter.js",
                    "src/tools/filters/InversionFilter.js",
                    "src/tools/filters/BlurFilter.js",
                    "src/tools/filters/LinearBlurFilter.js",
                    "src/tools/filters/GrayscaleFilter.js",
                    'src/application/Component.js',
                    'src/application/Application.js',
                    'src/application/StateManager.js',
                ],
                dest : 'dist/wuf.js'
            }
        },
        strip_code: {
            "wuf": {
                src: 'dist/wuf.js',
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
    grunt.registerTask('wuf', [ 'concat:wuf', 'strip_code:wuf' ]);

};
