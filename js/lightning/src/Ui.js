import Mediaplayer from "./Mediaplayer.js";

export default class Ui extends lng.Application {

    static _template() {
        return {
            Mediaplayer: {type: Mediaplayer, textureMode: Ui.hasOption('texture')},
            AppWrapper: {}
        };
    }

    get mediaplayer() {
        return this.tag("Mediaplayer");
    }

    startApp(appDefinition) {
        this._setState("App.Loading", [appDefinition]);
    }

    stopApp() {
    }

    _handleBack() {
        window.close();
    }

    static _states() {
        return [
            class App extends this {
                stopApp() {
                    this._setState("");
                }
                static _states() {
                    return [
                        class Loading extends this {
                            $enter(context, appDefinition) {
                                this._startApp(appDefinition);
                            }
                            _startApp(v) {
                                this._currentApp = {
                                    def: v,
                                    type: v.getAppViewType(),
                                    fontFaces: []
                                };

                                // Preload fonts.
                                const fonts = this._currentApp.type.getFonts();
                                const fontFaces = fonts.map(({family, url, descriptors}) => new FontFace(family, `url(${url})`, descriptors));
                                this._currentApp._fontFaces = fontFaces;
                                fontFaces.forEach(fontFace => {
                                    document.fonts.add(fontFace);
                                });
                                Promise.all(fontFaces.map(ff => ff.load())).then(() => {
                                    this._done();
                                }).catch((e) => {
                                    console.warn('Font loading issues: ' + e);
                                    this._done();
                                });
                            }
                            _done() {
                                this._setState("App.Started");
                            }
                        },
                        class Started extends this {
                            $enter() {
                                this.tag("AppWrapper").children = [{ref: "App", type: this._currentApp.type}];
                            }
                            $exit() {
                                this.tag("AppWrapper").children = [];
                            }
                        }
                    ]
                }
            }
        ]
    }

    _getFocused() {
        return this.tag("App");
    }

    _setFocusSettings(settings) {
        settings.clearColor = this.stage.getOption('clearColor');
        settings.mediaplayer = {
            consumer: null,
            stream: null,
            hide: false,
            videoPos: [0, 0, 1920, 1080]
        };
    }

    _handleFocusSettings(settings) {
        if (this._clearColor !== settings.clearColor) {
            this._clearColor = settings.clearColor;
            this.stage.setClearColor(settings.clearColor);
        }

        if (this.tag("Mediaplayer").attached) {
            this.tag("Mediaplayer").updateSettings(settings.mediaplayer);
        }
    }

    static getProxyUrl(url, opts = {}) {
        return this._getCdnProtocol() + "://cdn.metrological.com/proxy" + this.getQueryString(url, opts);
    }

    static getImageUrl(url, opts = {}) {
        return this._getCdnProtocol() + "://cdn.metrological.com/image" + this.getQueryString(url, opts);
    }

    static getQrUrl(url, opts = {}) {
        return this._getCdnProtocol() + "://cdn.metrological.com/qr" + this.getQueryString(url, opts, "q");
    }

    static _getCdnProtocol() {
        return location.protocol === "https" ? "https" : "http";
    }

    static hasOption(name) {
        return (document.location.href.indexOf(name) >= 0)
    }

    static getOption(name) {
        return new URL(document.location.href).searchParams.get(name)
    }

    static getQueryString(url, opts, key = "url") {
        let str = `?operator=${encodeURIComponent(this.getOption('operator') || 'metrological')}`;
        const keys = Object.keys(opts);
        keys.forEach(key => {
            str += "&" + encodeURIComponent(key) + "=" + encodeURIComponent("" + opts[key]);
        });
        str += `&${key}=${encodeURIComponent(url)}`;
        return str;
    }


}