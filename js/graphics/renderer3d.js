// js/graphics/renderer3d.js

export default class Renderer3D {
    constructor(canvas, map, player, npc) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.map = map;     // Referencia al mapa
        this.player = player; // Referencia al jugador
        this.npc = npc; // Referencia al NPC
        // Ajustar tamaño del canvas
        this.canvas.width = window.innerWidth * 0.7;
        this.canvas.height = window.innerHeight;
        this.isShootingActive = false;
    }

render() {
    // Limpiar el canvas
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar animación de disparo si está activa
    if (this.isShootingActive) {
        this.renderShotFlash();
        this.isShootingActive = false;
    }

    // Dibujar techo
    const ceilingGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height / 2);
    ceilingGradient.addColorStop(0, "#222244");
    ceilingGradient.addColorStop(1, "#111122");
    this.ctx.fillStyle = ceilingGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);

    // Dibujar piso
    const floorGradient = this.ctx.createLinearGradient(0, this.canvas.height / 2, 0, this.canvas.height);
    floorGradient.addColorStop(0, "#332211");
    floorGradient.addColorStop(1, "#553322");
    this.ctx.fillStyle = floorGradient;
    this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);

    // Lista de objetos para renderizar
    const renderObjects = [];

    // Raycasting para paredes
    const numRays = this.canvas.width;
    for (let i = 0; i < numRays; i++) {
        const rayAngle = this.player.angle - this.player.fov / 2 + (i / numRays) * this.player.fov;
        let distance = 0;
        let hitWall = false;
        let wallType = "wall"; // Por defecto, asumimos que es una pared
    
        while (!hitWall && distance < 20) {
            distance += 0.1;
            const testX = this.player.x + Math.cos(rayAngle) * distance;
            const testY = this.player.y + Math.sin(rayAngle) * distance;
            const mapX = Math.floor(testX);
            const mapY = Math.floor(testY);
    
            if (mapY < 0 || mapY >= this.map.mapData.length || mapX < 0 || mapX >= this.map.mapData[mapY].length) {
                hitWall = true;
                distance = 20;
                continue;
            }
    
            const cell = this.map.mapData[mapY][mapX];
            if (cell === 1) {
                hitWall = true;
                wallType = "wall"; // Es una pared
            } else if (cell === 2) {
                if (!this.map.isDoorOpen(mapX, mapY)) {
                    hitWall = true;
                    wallType = "door"; // Es una puerta cerrada
                }
            }
        }
    
        if (hitWall) {
            const wallHeight = Math.min(this.canvas.height, (this.canvas.height * 1.5) / distance);
            renderObjects.push({
                type: wallType, // Puede ser "wall" o "door"
                distance: distance,
                screenX: i,
                height: wallHeight,
            });
        }
    }

    const dx = this.npc.x - this.player.x;
    const dy = this.npc.y - this.player.y;
    const npcDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Calcular el ángulo hacia el NPC y normalizarlo
    let angleToNPC = Math.atan2(dy, dx) - this.player.angle;
    angleToNPC = ((angleToNPC + Math.PI) % (2 * Math.PI)) - Math.PI; // Normalizar entre -PI y PI
    
    const halfFOV = this.player.fov / 2;
    
    // Verificar si el NPC está dentro del campo de visión
    if (angleToNPC >= -halfFOV && angleToNPC <= halfFOV) {
        const screenX = (this.canvas.width / 2) * (1 + Math.tan(angleToNPC) / Math.tan(halfFOV));
        const npcHeight = Math.min(this.canvas.height, this.canvas.height / npcDistance);
        const npcWidth = npcHeight / 2;
    
        renderObjects.push({
            type: "npc",
            distance: npcDistance,
            screenX: screenX,
            height: npcHeight,
            width: npcWidth,
        });
    }

    // Ordenar objetos por distancia (descendente)
    renderObjects.sort((a, b) => b.distance - a.distance);

    // Dibujar objetos en orden
    for (const obj of renderObjects) {
        if (obj.type === "wall") {
            this.ctx.fillStyle = "#888"; // Gris para las paredes
            this.ctx.fillRect(obj.screenX, (this.canvas.height - obj.height) / 2, 1, obj.height);
        } else if (obj.type === "door") {
            this.ctx.fillStyle = "#FFD700"; // Amarillo brillante para las puertas
            this.ctx.fillRect(obj.screenX, (this.canvas.height - obj.height) / 2, 1, obj.height);
        } else     if (obj.type === "npc") {
            // Verificar si el NPC está parpadeando
            if (this.npc.isBlinking && Math.floor(this.npc.blinkTimer * 10) % 2 === 0) {
                continue; // Saltar el renderizado del NPC durante el parpadeo
            }
    
            if (this.npc.health > 0) {
                this.ctx.fillStyle = "#f00"; // Rojo para el NPC vivo
            } else {
                this.ctx.fillStyle = "#ff6666"; // Rojo claro para el NPC muerto
            }
            this.ctx.fillRect(
                obj.screenX - obj.width / 2,
                this.canvas.height / 2 - obj.height / 2,
                obj.width,
                obj.height
            );
        }
    }

}
    renderNPC() {
        if (!this.npc) return; // Verifica que el NPC esté definido
    
        const dx = this.npc.x - this.player.x;
        const dy = this.npc.y - this.player.y;
    
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angleToNPC = Math.atan2(dy, dx) - this.player.angle;
    
        const halfFOV = this.player.fov / 2;
        if (angleToNPC < -halfFOV || angleToNPC > halfFOV) {
            return; // NPC fuera del campo de visión
        }
    
        // Verificar si hay una pared bloqueando la línea de visión
        const steps = Math.ceil(distance / 0.1); // Dividir la distancia en pasos pequeños
        for (let i = 0; i < steps; i++) {
            const testX = this.player.x + (dx / steps) * i;
            const testY = this.player.y + (dy / steps) * i;
    
            const mapX = Math.floor(testX);
            const mapY = Math.floor(testY);
    
            if (this.map.isWall(mapX, mapY)) {
                return; // Hay una pared bloqueando la línea de visión
            }
        }
    
        // Calcular posición en pantalla
        const screenX = (this.canvas.width / 2) * (1 + Math.tan(angleToNPC) / Math.tan(halfFOV));
        const npcHeight = Math.min(this.canvas.height, this.canvas.height / distance);
        const npcWidth = npcHeight / 2;
    
        // Dibujar NPC como un rectángulo
        this.ctx.fillStyle = "#f00"; // Rojo para el NPC
        this.ctx.fillRect(
            screenX - npcWidth / 2,
            (this.canvas.height - npcHeight) / 2,
            npcWidth,
            npcHeight
        );
    }

    renderShotFlash() {
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // Amarillo semitransparente
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize() {
        this.canvas.width = window.innerWidth * 0.7;
        this.canvas.height = window.innerHeight;
        this.render(); // Re-render on resize
    }
}
