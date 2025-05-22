// js/input/input_handler.js

export default class InputHandler {
    constructor() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            a: false,
            s: false,
            d: false,
            ' ': false // For actions like opening doors
        };
        this.actionKey = null; // To store a key that was pressed once, like space
        this._setupListeners();
    }

    _setupListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                e.preventDefault(); // Prevent default browser action for game keys
                this.keys[e.key] = true;
            }
            if (e.key === ' ') { // Specifically track space for single press actions
                this.actionKey = 'Space';
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                e.preventDefault();
                this.keys[e.key] = false;
            }
        });
    }

    isKeyPressed(keyName) {
        return this.keys[keyName] || false;
    }

    // Returns the action key that was pressed and then clears it
    // Useful for single-press actions like opening a door
    getActionKey() {
        const key = this.actionKey;
        this.actionKey = null; // Reset after reading
        return key;
    }

    // Provides the current state of all relevant keys, useful for player update
    getState() {
        return this.keys;
    }
}
