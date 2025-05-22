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

    canMove(newX, newY) {
        const mapX = Math.floor(newX);
        const mapY = Math.floor(newY);

        if (mapY < 0 || mapY >= this.mapData.length || mapX < 0 || mapX >= this.mapData[mapY].length) {
            return false; // Cannot move out of bounds
        }

        const cellType = this.mapData[mapY][mapX];
        if (cellType === 1) { // Wall
            return false;
        }
        if (cellType === 2 && !this.isDoorOpen(mapX, mapY)) { // Closed door
            return false;
        }
        return true; // Can move
    }

    toggleDoor(x, y) {
        const key = `${y},${x}`; // Note: original script used y,x for key
        if (this.doors[key]) {
            this.doors[key].isOpen = !this.doors[key].isOpen;
            this.doors[key].timer = Date.now(); // For potential timed closing later
            console.log(`Door at ${x},${y} is now ${this.doors[key].isOpen ? 'open' : 'closed'}`);
        }
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
