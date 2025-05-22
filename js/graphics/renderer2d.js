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
        const cellSize = Math.min(this.canvas.width, this.canvas.height) / 30; // Tamaño de las celdas del mapa
    
        // Limpiar el canvas
        this.ctx.fillStyle = "#000"; // Fondo negro
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Dibujar el mapa
        for (let y = 0; y < this.map.mapData.length; y++) {
            for (let x = 0; x < this.map.mapData[y].length; x++) {
                const cellType = this.map.mapData[y][x];
                let cellColor = "#333"; // Espacio vacío
    
                if (cellType === 1) { // Pared
                    cellColor = "#f00"; // Rojo para paredes
                } else if (cellType === 2) { // Puerta
                    cellColor = this.map.isDoorOpen(x, y) ? "#0A0" : "#ff0"; // Verde si está abierta, amarillo si está cerrada
                }
    
                this.ctx.fillStyle = cellColor;
                this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                this.ctx.strokeStyle = "#000"; // Bordes de las celdas
                this.ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    
        // Dibujar al jugador
        this.ctx.fillStyle = "#0f0"; // Verde para el jugador
        this.ctx.beginPath();
        this.ctx.arc(
            this.player.x * cellSize,
            this.player.y * cellSize,
            cellSize / 4, // Tamaño del jugador
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    
        // Dibujar la dirección del jugador
        this.ctx.strokeStyle = "#0f0";
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x * cellSize, this.player.y * cellSize);
        this.ctx.lineTo(
            (this.player.x + Math.cos(this.player.angle)) * cellSize,
            (this.player.y + Math.sin(this.player.angle)) * cellSize
        );
        this.ctx.stroke();
    
        // Dibujar al NPC
        this.ctx.fillStyle = "#f00"; // Rojo para el NPC
        this.ctx.beginPath();
        this.ctx.arc(
            this.npc.x * cellSize,
            this.npc.y * cellSize,
            cellSize / 4, // Tamaño del NPC
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    
        // Dibujar la dirección del NPC
        const npcAngle = Math.atan2(this.player.y - this.npc.y, this.player.x - this.npc.x); // Dirección hacia el jugador
        this.ctx.strokeStyle = "#f00"; // Rojo para la dirección del NPC
        this.ctx.beginPath();
        this.ctx.moveTo(this.npc.x * cellSize, this.npc.y * cellSize);
        this.ctx.lineTo(
            (this.npc.x + Math.cos(npcAngle)) * cellSize,
            (this.npc.y + Math.sin(npcAngle)) * cellSize
        );
        this.ctx.stroke();
    }

    // Method to resize canvas if window size changes
    resize() {
        this.canvas.width = window.innerWidth * 0.3;
        this.canvas.height = window.innerHeight;
        // Re-render or adjust other parameters if needed upon resize
        this.render(); // Example: re-render immediately
    }
}
