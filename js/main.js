// js/main.js
import Game from './core/game.js';

function init() {
    console.log("Initializing game...");
    const game = new Game();
    game.start();

    // Optional: Add resize listener if your game needs to adapt to window changes
    window.addEventListener('resize', () => {
        game.resize(); // Assuming your Game class has a resize method
    });
}

// Wait for the DOM to be fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', init);

document.getElementById('restartButton').addEventListener('click', () => {
    location.reload(); // Recargar la página para reiniciar el juego
});