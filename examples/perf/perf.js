/**
 *
 */
var start = function(wpe) {

    for (var k in wpe) {
        window[k] = wpe[k];
    }

    wpe = wpe || {};

    with(wpe) {
        var options = {w: 1280, h: 720, glClearColor: 0xFF000000, useTextureAtlas: true, fixedDt: 0.016667};

        var stage = new Stage(options);

        document.body.appendChild(stage.getCanvas());
        window.stage = stage;

        var guide = new Guide(stage);
        guide.init();
        stage.root.addChild(guide.ctr);
        guide.show();

        var s;
        stage.on('frameStart', function() {
            if (stage.frameCounter >= 60) {
                var f = stage.frameCounter - 60;
                if (f == 0) {
                    s = (new Date()).getTime();
                }
                var t = Math.floor(f / 300);
                var tf = f % 300;
                var tt = Math.floor(f / 30);
                var sc = f % 60 === 0;
                var scvf = f % 5 === 0;
                var scvF = Math.floor(f / 5);
                var scf = f % 20 === 0;
                var scF = Math.floor(f / 20);
                if (t == 0) {
                    if (sc) {
                        // Scroll forward (slowly).
                        guide.handleKey({keyCode: Ui.KEYS.RIGHT});
                    }
                } else if (t == 1) {
                    if (scvf) {
                        // Scroll forward (fast).
                        guide.handleKey({keyCode: Ui.KEYS.RIGHT});
                    }
                } else if (t == 2) {
                    if (scvf) {
                        // Scroll backward (already loaded).
                        guide.handleKey({keyCode: Ui.KEYS.LEFT});
                    }
                } else if (t == 3 || t == 4) {
                    if (tf == 0) {
                        //guide.handleKey({keyCode: Ui.KEYS.RIGHT});
                    }
                    // Scroll back&forward.
                    if (scf) {
                        if (scF % 2) {
                            guide.handleKey({keyCode: Ui.KEYS.RIGHT});
                        } else {
                            guide.handleKey({keyCode: Ui.KEYS.LEFT});
                        }
                    }
                } else if (t == 5) {
                    // Finished.
                    if (tf == 0) {
                        var delta = (new Date()).getTime() - s;
                        var frames = Math.round((delta / 0.016666667) / 1000);
                        console.log('frame misses (60fps): ' + (frames - f));
                        var h1 = document.createElement('h1');
                        h1.style.position="absolute";
                        h1.style.top="0";
                        h1.style.color="white";
                        h1.innerText = 'frame misses (60fps): ' + (frames - f) + '[' + f + ' out of ' + frames + ']';
                        document.body.appendChild(h1);
                    }
                }
            }
        });
        window.addEventListener('keydown', function(e) {
            var obj = {keyCode: e.keyCode, preventDefault: function() {}};
            if (obj.keyCode == 166) {
                obj.keyCode = Ui.KEYS.BACKSPACE;
            }
            if (obj.keyCode == 93) {
                obj.keyCode = Ui.KEYS.MENU;
            }
            var preventDefault = guide.handleKey(obj);
            if (preventDefault === true || obj.keyCode == Ui.KEYS.BACKSPACE) {
                e.preventDefault();
                return false;
            }
        });

    }
};

if (typeof window === "undefined") {
    // Nodejs: start.
    start(require('../../wpe'));
}
