const lng = require('../../dist/lightning-node');

let titles = ["Batman", "Inception"];

class TextOpacity extends lng.Application {
    static _template() {
        return {
            Title: {
                text: {text: titles[0], fontSize: 100}
            }
        }
    }
}

const options = {stage: {w: 900, h: 900, clearColor: 0xFF000000}};

options.stage.window = {title: "Text Opacity", fullscreen: false};

const app = new TextOpacity(options);

let i = 0;

setInterval(() => {
    let k = i++ % titles.length;
    let title = titles[k];

    let titleView = app.tag("Title");
    titleView.text = { text: title };

    titleView.alpha = k;  // when alpha is equal to 0, the text is not changed
    if (k > 0) {
        console.log(title);
    }
}, 250);
