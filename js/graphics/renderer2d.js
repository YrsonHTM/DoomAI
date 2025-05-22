// js/graphics/renderer2d.js

export default class Renderer2D {
    constructor(canvas, map, player, npc) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.map = map; // Reference to the map object
        this.player = player; // Reference to the player object
        this.npc = npc; // Reference to the NPC object

        // Adjust canvas size (can be made more dynamic later)
        this.canvas.width = window.innerWidth * 0.3;
        this.canvas.height = window.innerHeight; // Assume full height for 2D view for now
    }

    render() {
        const cellSize = Math.min(this.canvas.width, this.canvas.height) / 30; // Based on original map size
        
        // Clear canvas
        this.ctx.fillStyle = "#000"; // Background color from original
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Draw map cells
        for (let y = 0; y < this.map.mapData.length; y++) {
            for (let x = 0; x < this.map.mapData[y].length; x++) {
                const cellType = this.map.mapData[y][x];
                let cellColor = "#333"; // Default for empty space
    
                if (cellType === 1) { // Wall
                    cellColor = "#f00";
                } else if (cellType === 2) { // Door
                    cellColor = this.map.isDoorOpen(x, y) ? "#0A0" : "#a52"; // Green if open, brown if closed
                }
                
                this.ctx.fillStyle = cellColor;
                this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                this.ctx.strokeStyle = "#000"; // Cell border
                this.ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    
        // Draw player
        this.ctx.fillStyle = "#0f0"; // Player color
        this.ctx.beginPath();
        this.ctx.arc(
            this.player.x * cellSize,
            this.player.y * cellSize,
            cellSize / 4, // Player size
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    
        // Draw player direction line
        this.ctx.strokeStyle = "#0f0";
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x * cellSize, this.player.y * cellSize);
        this.ctx.lineTo(
            (this.player.x + Math.cos(this.player.angle)) * cellSize,
            (this.player.y + Math.sin(this.player.angle)) * cellSize
        );
        this.ctx.stroke();
    
        // Draw NPC
        this.ctx.fillStyle = '#f00'; // Red for the NPC
        this.ctx.beginPath();
        this.ctx.arc(
            this.npc.x * cellSize,
            this.npc.y * cellSize,
            cellSize / 4, // NPC size
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    // Method to resize canvas if window size changes
    resize() {
        this.canvas.width = window.innerWidth * 0.3;
        this.canvas.height = window.innerHeight;
        // Re-render or adjust other parameters if needed upon resize
        this.render(); // Example: re-render immediately
    }
}
