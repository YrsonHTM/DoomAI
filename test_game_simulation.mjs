// test_game_simulation.mjs
import Game from './js/core/game.js';
import InputHandler from './js/input/input_handler.js'; // Ensure this is correctly imported if used directly by Game or Player

const maxSimulationFrames = 20; // Moved to make it accessible to forceExitTimeout

// Mock DOM and window objects
global.window = {
    innerWidth: 1024,
    innerHeight: 768,
    requestAnimationFrame: (callback) => {
        // Simulate a delay before calling the callback, similar to how rAF works
        return setTimeout(() => callback(performance.now()), 16); // ~60 FPS, return timeoutId
    },
    cancelAnimationFrame: (id) => {
        clearTimeout(id);
    },
    addEventListener: () => {}, // Mock event listener
    removeEventListener: () => {} // Mock event listener
};

// Make rAF and cAF global as they are in browsers
global.requestAnimationFrame = global.window.requestAnimationFrame;
global.cancelAnimationFrame = global.window.cancelAnimationFrame;


global.document = {
    getElementById: (id) => {
        console.log(`Mock document.getElementById called for: ${id}`);
        if (id === 'view3d' || id === 'view2d') {
            return { // Mock canvas element
                getContext: () => ({ // Mock 2D context
                    fillRect: () => {},
                    strokeRect: () => {},
                    beginPath: () => {},
                    moveTo: () => {},
                    lineTo: () => {},
                    closePath: () => {},
                    stroke: () => {},
                    fill: () => {},
                    arc: () => {},
                    createLinearGradient: () => ({ addColorStop: () => {} }),
                    save: () => {},
                    translate: () => {},
                    rotate: () => {},
                    drawImage: () => {},
                    restore: () => {},
                    clearRect: () => {},
                    measureText: () => ({ width: 0 }),
                    fillText: () => {}
                }),
                width: 800,
                height: 600,
                style: {}
            };
        }
        if (id === 'interactionText' || id === 'healthBar' || id === 'deathScreen') {
            return { // Mock generic div element
                style: {},
                textContent: ''
            };
        }
        return null;
    },
    addEventListener: () => {}, // Mock event listener
    removeEventListener: () => {} // Mock event listener
};

global.performance = {
    now: () => Date.now() // Simple performance.now mock
};

console.log("Starting game simulation for testing...");

try {
    const game = new Game(); // This will initialize InputHandler, Player, NPC, Map, Renderers
    game.start(); // Start the game loop

    const player = game.player;
    const renderer3d = game.renderer3d;
    const inputHandler = game.inputHandler; // Game creates its own instance

    let simulationFrames = 0;
    // const maxSimulationFrames = 20; // Moved to top

    // This function is not strictly necessary anymore if game.start() correctly
    // drives the loop and we only rely on the final timeout to stop the game.
    // However, it can be used for periodic logging if desired.
    function checkSimulationProgress() {
        if (simulationFrames >= maxSimulationFrames) {
            console.log("Max simulation frames logged. Game should be stopped by timeout shortly.");
            return;
        }
        console.log(`Logging progress at frame: ${simulationFrames + 1}`);
        console.log(`  renderer3d.isShootingActive: ${renderer3d.isShootingActive}`);
        console.log(`  player weapon lastShotTime: ${player.weapon.lastShotTime}`);
        
        // Simulate pressing space for a few frames to test shooting
        // Player.update will call shoot if space is pressed.
        // Game.update calls Player.update.
        // Game.render calls renderer3d.render, which uses and resets isShootingActive.
        if (simulationFrames === 2 || simulationFrames === 3 || simulationFrames === 7 || simulationFrames === 12) {
            console.log(`  Simulating SPACE press for frame ${simulationFrames +1}.`);
            inputHandler.keys[' '] = true;
        } else {
            inputHandler.keys[' '] = false;
        }
        
        simulationFrames++;
    }
    
    const progressInterval = setInterval(checkSimulationProgress, 45); // Log progress roughly every 3 frames (45ms / 16ms per frame)


    setTimeout(() => {
        console.log("Stopping game after timeout to prevent infinite loop in test.");
        game.stop();
        clearInterval(progressInterval); // Ensure interval is cleared
        console.log(`Final player health: ${player.health}`);
        console.log(`Final NPC health: ${game.npc.health}`); // Access NPC via game instance
        console.log(`Final player weapon lastShotTime: ${player.weapon.lastShotTime}`);
        console.log(`Final renderer3d.isShootingActive: ${renderer3d.isShootingActive}`);
        // Force exit here if game.stop() doesn't make Node exit cleanly
        process.exit(0); 
    }, maxSimulationFrames * 50 + 500); // Wait a bit longer than max frames * typical frame time (50ms)

} catch (e) {
    console.error("Error during game simulation setup:", e);
    process.exit(1); // Exit with error if setup fails
}

console.log("Game simulation script setup complete. Game loop is running via mock rAF.");

// Add a final log to ensure Node process exits if it hangs due to open handles from the game's rAF loop.
process.on('exit', (code) => {
  console.log(`Node process exiting with code: ${code}`);
});

// This timeout is a failsafe; the one inside the try block should exit first.
const forceExitTimeout = setTimeout(() => {
    console.log("Force exiting Node.js process due to potential runaway rAF loop (outer failsafe).");
    process.exit(2); // Exit with a different error code
}, maxSimulationFrames * 100 + 2000); // e.g. 20 * 100 + 2000 = 4 seconds

// Clear the failsafe timeout if the process exits normally via the try block's process.exit(0)
process.on('beforeExit', () => {
    clearTimeout(forceExitTimeout);
});
