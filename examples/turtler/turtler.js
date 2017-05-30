var isNode = !!(((typeof module !== "undefined") && module.exports));
if (isNode) {
    var Stage = require('../../wpe');
}

var options = {w: 1280, h: 720, precision: 1, measureDetails: false, useTextureProcess: false, textureProcessOptions: {allowFiles: true}, useTextureAtlas:false, glClearColor: [0, 0, 0, 1], window: {title: "Turtler demo", fullscreen: false}};
var stage = new Stage(options);

if (!isNode) {
    document.body.appendChild(stage.getCanvas());
}

stage.root.w = 10;
stage.root.h = 0;
stage.root.x = 10;
stage.root.y = 10;
stage.root.borderWidth = 5;

var v = 1;
var template = {w: 100, h: 100, visible: true, rect: true, turtleInvisible: false, borderWidth: 0, colorLeft: 0xFFFF0000, colorRight: 0xFF0000FF, turtler: function(turtle) {
    //turtle.component.alpha = (turtle.index % 3) === 0 ? v : 1;
    var prev = turtle.prev;
    turtle.w = 100 + turtle.index * 10;
    if (prev) {
        turtle.x = prev.x + prev.w + 10;
        turtle.y = prev.y;
        turtle.row = prev.row;
        if (turtle.x + turtle.w + 10 > turtle.parent.w) {
            turtle.x = 10;
            turtle.y = prev.y + prev.h + 10;
            turtle.parent.h += turtle.h + 10;
            turtle.row++;
        }

        if (turtle.row !== prev.row || turtle.last) {
            var items = [];

            var c = (turtle.row === prev.row) ? turtle : prev;
            var total = c.x + c.w;
            do {
                items.push(c);
                c = c.prev;
            } while(c && c.row === prev.row);

            var left = (turtle.parent.w - 10) - total;
            if (left > 0) {
                var extraX = 0;
                for (var i = items.length - 1; i >= 0; i--) {
                    var obj = items[i];
                    var extraWidth = left * (obj.w + 10) / total;
                    obj.x += extraX;
                    extraX += extraWidth;
                    obj.w += extraWidth;
                }
            }
        }
    } else {
        turtle.row = 0;
        turtle.x = 10;
        turtle.y = 10;
        turtle.parent.h = turtle.h + 20;
    }
}};

// var template = {w: 100, h: 100, rect: true, borderWidth: 4, colorLeft: 0xFFFF0000, colorRight: 0xFF0000FF};

setInterval(function() {
    if (v > 0) {
        v -= 0.05;
    }
}, 100);

stage.root.transition('w', {duration: 5});
stage.root.turtler = function(turtle) {
    turtle.w = (turtle.sw - 20) * turtle.w / 100;
};
stage.root.turtleInvisible = true;

stage.root.visible = true;
stage.root.w = 100;
for (var i = 0; i < 10; i++) {
    stage.root.add(template);
}

