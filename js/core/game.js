// js/core/game.js

import Map from './map.js';
import Player from './player.js';
import InputHandler from '../input/input_handler.js';
import Renderer2D from '../graphics/renderer2d.js';
import Renderer3D from '../graphics/renderer3d.js';
import NPC from './npc.js';

export default class Game {
    constructor() {
        // DOM Elements
        this.canvas3d = document.getElementById('view3d');
        this.canvas2d = document.getElementById('view2d');
        this.interactionTextElement = document.getElementById('interactionText');

        // Core Components
        this.map = new Map();
        this.player = new Player(1.5, 1.5, 0, this.map); // Initial player state
        this.npc = new NPC(5, 10, this.map, this.player);
        this.inputHandler = new InputHandler();

        // Graphics Components
        this.renderer2d = new Renderer2D(this.canvas2d, this.map, this.player, this.npc);
        this.renderer3d = new Renderer3D(this.canvas3d, this.map, this.player, this.npc);

        this.isRunning = false;
        this.lastTime = 0;

        // Bind the gameLoop to this instance to maintain context
        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
        console.log("Game started.");
    }

    stop() {
        this.isRunning = false;
        console.log("Game stopped.");
    }

    update(deltaTime) {
        const inputState = this.inputHandler.getState();
        this.player.update(inputState);
        this.npc.update(deltaTime);
    
        // Simular daño al jugador (puedes reemplazar esto con lógica real)
        if (Math.random() < 0.01) { // Ejemplo: 1% de probabilidad de daño por frame
            this.player.takeDamage(5);
        }
    
        // Verificar si el jugador está muerto
        if (this.player.health === 0) {
            this.stop(); // Detener el juego
            return;
        }
    
        // Actualizar la barra de vida del jugador
        const healthBar = document.getElementById('healthBar');
        healthBar.style.width = `${this.player.health}%`;
    
        const action = this.inputHandler.getActionKey();
        if (action === 'Space') {
            const doorCoords = this.map.checkNearDoor(this.player.x, this.player.y);
            if (doorCoords) {
                this.map.toggleDoor(doorCoords.x, doorCoords.y);
            }
        }
    }

    render() {
        this.renderer2d.render();
        this.renderer3d.render();
        this.updateInteractionText();
    }

    updateInteractionText() {
        const nearDoor = this.map.checkNearDoor(this.player.x, this.player.y);
        if (nearDoor && !this.map.isDoorOpen(nearDoor.x, nearDoor.y)) {
            this.interactionTextElement.style.display = 'block';
            this.interactionTextElement.textContent = 'Presiona ESPACIO para abrir la puerta';
        } else {
            this.interactionTextElement.style.display = 'none';
        }
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = (currentTime - this.lastTime) / 1000; // Delta time in seconds
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    // Handle window resize
    resize() {
        // Canvas sizes are set internally by renderers for now,
        // but if a global resize logic is needed, it can be here.
        this.renderer2d.resize(); // Assuming renderers have resize methods
        this.renderer3d.resize();
        this.render(); // Re-render after resize
    }
}
