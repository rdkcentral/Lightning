class WpeImageParser {
    constructor(memory = 16777216) {
        this.memory = new ArrayBuffer(memory);

        this.init();
    }

    init() {
        this.pending = {};
        this.pendingCount = 0;
        this.session = imageparser.Init(this.memory);
        console.log('SESSION: ' + this.session);
        this.oReqs = new Set();

        this.start();
    }

    start() {
        if (this.pendingCount && !this.timeout) {
            this.timeout = setTimeout(() => {
                this.timeout = 0;
                this.process();
                this.start();
            }, 50)
        }
    }

    cleanup() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        this.oReqs.forEach(function(oReq) {
            oReq.abort();
        });

        imageparser.Cleanup(this.session);

        this.oReqs = null;
        this.session = null;
        this.pending = null;
        this.pendingCount = 0;
    }

    process() {
        imageparser.ProcessResults(this.session, (id, error, width, height, offset) => {
            this.pendingCount--;
            this.pending[id].cb(error, width, height, this.memory, offset, width * height * 4);
            this.pending[id] = null;
        })
    }

    add(url, cb) {
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = oEvent => {
            this.oReqs.delete(oReq);
            var buffer = oReq.response;

            var contentTypeHeader = oReq.getResponseHeader('content-type');
            var contentType = -1;
            if (contentTypeHeader == "image/jpeg" || contentTypeHeader == "image/jpg") {
                contentType = 0;
            } else if (contentTypeHeader == "image/png") {
                contentType = 1;
            }

            if (contentType >= 0) {
                var id = imageparser.Add(this.session, contentType, buffer);
                this.pending[id] = {buffer: buffer, cb: cb}
                this.pendingCount++;

                this.start();
            } else {
                cb("Unsupported content type: " + contentTypeHeader);
            }
        };

        this.oReqs.add(oReq);

        oReq.onerror = oEvent => {
            this.oReqs.delete(oReq);
            cb(oEvent);
        };

        oReq.send(null);

        // By calling oReq.abort, the image parsing can be aborted.
        return oReq;
    }
}

module.exports = WpeImageParser;