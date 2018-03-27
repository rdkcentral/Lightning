module.exports = {
    Application: require('./src/application/Application'),
    Component: require('./src/application/Component'),
    Base: require('./src/core/Base'),
    Utils: require('./src/core/Utils'),
    StageUtils: require('./src/core/StageUtils'),
    Shader: require('./src/core/Shader'),
    Filter: require('./src/core/Filter'),
    View: require('./src/core/View'),
    Tools: require('./src/tools/Tools'),
    misc: {
        ObjectListProxy: require('./src/tools/misc/ObjectListProxy'),
        ObjectListWrapper: require('./src/tools/misc/ObjectListWrapper')
    },
    views: {
        ListView: require('./src/tools/views/ListView'),
        BorderView: require('./src/tools/views/BorderView'),
        FastBlurView: require('./src/tools/views/FastBlurView'),
        SmoothScaleView: require('./src/tools/views/SmoothScaleView')
    },
    shaders: {
        PixelateShader: require('./src/tools/shaders/PixelateShader'),
        InversionShader: require('./src/tools/shaders/InversionShader'),
        GrayscaleShader: require('./src/tools/shaders/GrayscaleShader'),
        OutlineShader: require('./src/tools/shaders/OutlineShader'),
        CircularPushShader: require('./src/tools/shaders/CircularPushShader'),
        RadialFilterShader: require('./src/tools/shaders/RadialFilterShader')
    },
    filters: {
        FxaaFilter: require('./src/tools/filters/FxaaFilter'),
        InversionFilter: require('./src/tools/filters/InversionFilter'),
        BlurFilter: require('./src/tools/filters/BlurFilter'),
        LinearBlurFilter: require('./src/tools/filters/LinearBlurFilter'),
        GrayscaleFilter: require('./src/tools/filters/GrayscaleFilter')
    }
}