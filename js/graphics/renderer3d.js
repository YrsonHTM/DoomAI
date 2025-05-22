// js/graphics/renderer3d.js

export default class Renderer3D {
    constructor(canvas, map, player) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.map = map;     // Reference to the map object
        this.player = player; // Reference to the player object

        // Adjust canvas size
        this.canvas.width = window.innerWidth * 0.7;
        this.canvas.height = window.innerHeight; // Assume full height for 3D view
    }

    render() {
        // Clear the canvas (or draw background)
        this.ctx.fillStyle = "#111"; // Original background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ceiling
        const ceilingGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height / 2);
        ceilingGradient.addColorStop(0, "#222244"); // Dark blue
        ceilingGradient.addColorStop(1, "#111122");
        this.ctx.fillStyle = ceilingGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);

        // Draw floor
        const floorGradient = this.ctx.createLinearGradient(0, this.canvas.height / 2, 0, this.canvas.height);
        floorGradient.addColorStop(0, "#332211"); // Dark brown
        floorGradient.addColorStop(1, "#553322");
        this.ctx.fillStyle = floorGradient;
        this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);

        // Raycasting logic from original draw3dView
        const numRays = this.canvas.width;
        for (let i = 0; i < numRays; i++) {
            const rayAngle = this.player.angle - this.player.fov / 2 + (i / numRays) * this.player.fov;
            let distance = 0;
            let hitWall = false;
            let wallType = 'wall'; // 'wall', 'door'
            // let wallX = 0, wallY = 0; // For potential texture mapping later
            // let hitSide = ''; // For different shading on sides, if needed

            // Cast the ray
            while (!hitWall && distance < 20) { // Max distance
                distance += 0.1; // Step increment
                const testX = this.player.x + Math.cos(rayAngle) * distance;
                const testY = this.player.y + Math.sin(rayAngle) * distance;
                const mapX = Math.floor(testX);
                const mapY = Math.floor(testY);

                if (mapY < 0 || mapY >= this.map.mapData.length || mapX < 0 || mapX >= this.map.mapData[mapY].length) {
                    hitWall = true; // Hit out of bounds, treat as a far wall
                    distance = 20;
                    wallType = 'wall'; // Or some other indicator for "void"
                    continue;
                }
                
                const cell = this.map.mapData[mapY][mapX];

                if (cell === 1) { // Wall
                    hitWall = true;
                    wallType = 'wall';
                    // wallX = mapX; wallY = mapY;
                    // Add hitSide detection if needed for advanced shading, like in original
                } else if (cell === 2) { // Door
                    if (!this.map.isDoorOpen(mapX, mapY)) {
                        hitWall = true;
                        wallType = 'door';
                        // wallX = mapX; wallY = mapY;
                    }
                    // If door is open, ray continues through
                }
            }

            if (hitWall) {
                // Correct for fisheye distortion (optional, but good for realism)
                // const correctedDistance = distance * Math.cos(rayAngle - this.player.angle);
                // const wallHeight = Math.min(this.canvas.height, (this.canvas.height * 1.5) / correctedDistance);
                
                const wallHeight = Math.min(this.canvas.height, (this.canvas.height * 1.5) / distance);


                const wallBrightness = Math.min(255, 255 / (distance * 0.5)); // Simple brightness based on distance

                if (wallType === 'door') {
                    this.ctx.fillStyle = `rgb(${wallBrightness}, ${wallBrightness * 0.5}, 0)`; // Brownish-orange for doors
                } else { // 'wall' or other types
                    this.ctx.fillStyle = `rgb(${wallBrightness * 0.7}, ${wallBrightness * 0.7}, ${wallBrightness * 0.7})`; // Grey for walls, slightly dimmer
                }
                
                // Simplified shading from original, can be expanded
                // For 'door_wall' effect from original, more complex logic for hitSide and adjacent cells is needed.
                // This simplified version just distinguishes between 'wall' and 'door'.

                this.ctx.fillRect(i, (this.canvas.height - wallHeight) / 2, 1, wallHeight); // Draw a single vertical strip for the wall
            }
        }
    }

    resize() {
        this.canvas.width = window.innerWidth * 0.7;
        this.canvas.height = window.innerHeight;
        this.render(); // Re-render on resize
    }
}
