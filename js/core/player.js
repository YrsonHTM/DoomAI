// js/core/player.js

export default class Player {
    constructor(x, y, angle, map) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.fov = Math.PI / 3; // Field of vision (60 degrees)
        this.map = map; // Reference to the map object for collision detection

        // Player settings from original script
        this.settings = {
            moveSpeed: 0.05,
            rotSpeed: 0.03,
            strafeSpeed: 0.03
        };
    }

    // Rotate left
    rotateLeft() {
        this.angle -= this.settings.rotSpeed;
    }

    // Rotate right
    rotateRight() {
        this.angle += this.settings.rotSpeed;
    }

    // Move forward
    moveForward() {
        const newX = this.x + Math.cos(this.angle) * this.settings.moveSpeed;
        const newY = this.y + Math.sin(this.angle) * this.settings.moveSpeed;
        if (this.map.canMove(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }

    // Move backward
    moveBackward() {
        const newX = this.x - Math.cos(this.angle) * this.settings.moveSpeed;
        const newY = this.y - Math.sin(this.angle) * this.settings.moveSpeed;
        if (this.map.canMove(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }

    // Strafe left
    strafeLeft() {
        const newX = this.x + Math.cos(this.angle - Math.PI / 2) * this.settings.strafeSpeed;
        const newY = this.y + Math.sin(this.angle - Math.PI / 2) * this.settings.strafeSpeed;
        if (this.map.canMove(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }

    // Strafe right
    strafeRight() {
        const newX = this.x + Math.cos(this.angle + Math.PI / 2) * this.settings.strafeSpeed;
        const newY = this.y + Math.sin(this.angle + Math.PI / 2) * this.settings.strafeSpeed;
        if (this.map.canMove(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }

    // Update player based on input state
    // Input state would be an object like { ArrowUp: true, ArrowLeft: false, ... }
    update(inputState) {
        if (inputState.ArrowLeft) this.rotateLeft();
        if (inputState.ArrowRight) this.rotateRight();

        if (inputState.ArrowUp || inputState.w) this.moveForward();
        if (inputState.ArrowDown || inputState.s) this.moveBackward();

        if (inputState.a) this.strafeLeft();
        if (inputState.d) this.strafeRight();
    }
}
