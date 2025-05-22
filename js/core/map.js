// js/core/map.js

export default class Map {
    constructor() {
        this.mapData = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 2, 0, 0, 2, 0, 1, 1], // Door at (3,3) and (6,3) by coordinates
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 2, 1, 1, 1, 1], // Door at (5,6) by coordinates
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
        this.doors = {};
        this.initializeDoors();
    }

    initializeDoors() {
        for (let y = 0; y < this.mapData.length; y++) {
            for (let x = 0; x < this.mapData[y].length; x++) {
                if (this.mapData[y][x] === 2) { // 2 represents a door
                    const key = `${y},${x}`;
                    this.doors[key] = { isOpen: false, timer: 0 };
                }
            }
        }
    }

    getCell(x, y) {
        const mapX = Math.floor(x);
        const mapY = Math.floor(y);
        if (mapY < 0 || mapY >= this.mapData.length || mapX < 0 || mapX >= this.mapData[mapY].length) {
            return -1; // Out of bounds
        }
        return this.mapData[mapY][mapX];
    }

    isWall(x, y) {
        const cell = this.getCell(x,y);
        return cell === 1;
    }
    
    isDoor(x,y){
        const cell = this.getCell(x,y);
        return cell === 2;
    }

    isDoorOpen(x, y) {
        const key = `${Math.floor(y)},${Math.floor(x)}`;
        return this.doors[key] && this.doors[key].isOpen;
    }

    canMove(x, y) {
        const mapX = Math.floor(x);
        const mapY = Math.floor(y);
    
        // Verificar si las coordenadas están dentro del mapa
        if (mapX < 0 || mapY < 0 || mapX >= this.mapData[0].length || mapY >= this.mapData.length) {
            return false;
        }
    
        // Verificar si la celda es un muro o una puerta cerrada
        const cell = this.mapData[mapY][mapX];
        return cell === 0 || (cell === 2 && this.isDoorOpen(mapX, mapY)); // 0 = espacio libre, 2 = puerta abierta
    }
    toggleDoor(x, y) {
        const key = `${y},${x}`; // Note: original script used y,x for key
        if (this.doors[key]) {
            this.doors[key].isOpen = !this.doors[key].isOpen;
            this.doors[key].timer = Date.now(); // For potential timed closing later
            console.log(`Door at ${x},${y} is now ${this.doors[key].isOpen ? 'open' : 'closed'}`);
        }
    }

    findPath(startX, startY, targetX, targetY) {
        const openSet = [];
        const cameFrom = {};
        const gScore = {};
        const fScore = {};
    
        const key = (x, y) => `${x},${y}`;
        const neighbors = [
            { x: 0, y: -1 }, // Arriba
            { x: 1, y: 0 },  // Derecha
            { x: 0, y: 1 },  // Abajo
            { x: -1, y: 0 }  // Izquierda
        ];
    
        const heuristic = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);
    
        const startKey = key(startX, startY);
        const targetKey = key(targetX, targetY);
    
        openSet.push({ x: startX, y: startY });
        gScore[startKey] = 0;
        fScore[startKey] = heuristic(startX, startY, targetX, targetY);
    
        while (openSet.length > 0) {
            // Encuentra el nodo con el menor fScore
            openSet.sort((a, b) => fScore[key(a.x, a.y)] - fScore[key(b.x, b.y)]);
            const current = openSet.shift();
            const currentKey = key(current.x, current.y);
    
            if (current.x === targetX && current.y === targetY) {
                // Reconstruir el camino
                const path = [];
                let tempKey = currentKey;
                while (tempKey in cameFrom) {
                    const [x, y] = tempKey.split(',').map(Number);
                    path.unshift({ x, y });
                    tempKey = cameFrom[tempKey];
                }
                return path;
            }
    
            for (const neighbor of neighbors) {
                const neighborX = current.x + neighbor.x;
                const neighborY = current.y + neighbor.y;
                const neighborKey = key(neighborX, neighborY);
    
                if (!this.canMove(neighborX, neighborY)) continue; // Ignorar celdas no transitables
    
                const tentativeGScore = gScore[currentKey] + 1;
    
                if (!(neighborKey in gScore) || tentativeGScore < gScore[neighborKey]) {
                    cameFrom[neighborKey] = currentKey;
                    gScore[neighborKey] = tentativeGScore;
                    fScore[neighborKey] = tentativeGScore + heuristic(neighborX, neighborY, targetX, targetY);
    
                    if (!openSet.some(n => n.x === neighborX && n.y === neighborY)) {
                        openSet.push({ x: neighborX, y: neighborY });
                    }
                }
            }
        }
    
        return null; // No se encontró un camino
    }

    // This function needs player's current position to check proximity.
    // It might be better placed in the Game class or Player class, 
    // or take player coordinates as arguments.
    // For now, let's assume it takes player coords.
    checkNearDoor(playerX, playerY) {
        const checkRadius = 1.2;
        const playerMapX = Math.floor(playerX);
        const playerMapY = Math.floor(playerY);

        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }  // Left
        ];

        for (const dir of directions) {
            const checkX = playerMapX + dir.x;
            const checkY = playerMapY + dir.y;

            if (this.mapData[checkY] && this.mapData[checkY][checkX] === 2) { // Is a door
                const doorCenterX = checkX + 0.5;
                const doorCenterY = checkY + 0.5;
                const distance = Math.sqrt(
                    Math.pow(playerX - doorCenterX, 2) +
                    Math.pow(playerY - doorCenterY, 2)
                );

                if (distance <= checkRadius) {
                    return { x: checkX, y: checkY }; // Returns map coordinates of the door
                }
            }
        }
        return null;
    }
}
