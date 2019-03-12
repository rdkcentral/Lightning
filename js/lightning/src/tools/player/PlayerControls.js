import PlayerButton from "./PlayerButton.js";

export default class PlayerControls extends lng.Component {

    static _template() {
        return {
            Buttons: {
                Previous: {type: this.PlayerButton, icon: "prev.png"},
                Play: {type: this.PlayerButton, icon: "play.png"},
                Next: {type: this.PlayerButton, icon: "next.png"}
            },
            Title: {text: {fontSize: 46, lineHeight: 56, maxLines: 1, shadow: true}, y: 2}
        };
    }

    static get PlayerButton() {
        return PlayerButton;
    }

    showButtons(previous, next) {
        const o = this.constructor.options;
        let buttons = [];
        if (previous) buttons.push("Previous");
        buttons = buttons.concat(o.buttons);
        if (next) buttons.push("Next");
        this._setActiveButtons(buttons);
    }

    set title(title) {
        this.tag("Title").text = title || "";
    }

    get _activeButtonIndex() {
        let button = this.tag("Buttons").getByRef(this._getState());
        if (!button.active) {
            button = this.tag("Play");
        }
        return this._activeButtons.indexOf(button);
    }

    get _activeButton() {
        return this._activeButtons[this._activeButtonIndex];
    }

    _setActiveButtons(buttons) {
        const o = this.constructor.options;

        let x = 0;
        this._activeButtons = [];
        this.tag("Buttons").children.map(button => {
            button.active = (buttons.indexOf(button.ref) !== -1);
            button.x = x;
            if (button.active) {
                this._activeButtons.push(button);
            }
            x += button.renderWidth + o.margin;
        });
        this.tag("Title").x = x + 20;


        this._checkActiveButton();
    }

    _setup() {
        this._setState("Play");
    }

    _init() {
        this.showButtons(false, false);
        this._setState("Play");
    }

    _checkActiveButton() {
        // After changing the active buttons, make sure that an active button is selected.
        let index = this._activeButtonIndex;
        if (index === -1) {
            if (this._index >= this._activeButtons.length) {
                this._index = this._activeButtons.length - 1;
            }
        }
        this._setState(this._activeButtons[index].ref);
    }

    _handleLeft() {
        let index = this._activeButtonIndex;
        if (index > 0) {
            index--;
        }
        this._setState(this._activeButtons[index].ref);
    }

    _handleRight() {
        let index = this._activeButtonIndex;
        if (index < this._activeButtons.length - 1) {
            index++;
        }
        this._setState(this._activeButtons[index].ref);
    }

    _handleEnter() {
        this.signal('press' + this._activeButton.ref);
    }


    set paused(v) {
        this.tag("Play").icon = v ? "play.png" : "pause.png";
    }

    static _states() {
        return [
            class Previous extends this {
            },
            class Play extends this {
            },
            class Next extends this {
            }
        ]
    }

    _getFocused() {
        return this.tag(this._getState());
    }

    static get options() {
        if (!this._options) {
            this._options = this._buildOptions();
        }
        return this._options;
    }

    static _buildOptions() {
        return {
            buttons: ["Play"],
            margin: 10
        };
    }

}

