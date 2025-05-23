// js/core/player.js
import Weapon from './weapon.js';

export default class Player {
    constructor(x, y, angle, map, renderer3d = null) {
        this.renderer3d = renderer3d; // Referencia al renderer3d
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.fov = Math.PI / 3; // Campo de visión (60 grados)
        this.map = map; // Referencia al mapa
        this.health = 100; // Vida inicial del jugador
        this.settings = {
            moveSpeed: 0.05,
            rotSpeed: 0.03,
            strafeSpeed: 0.03
        };
        this.weapon = new Weapon("Pistola", 20, 0.001);
    }

    shoot(npc, currentTime) {
        const damage = this.weapon.shoot(currentTime); // Intentar disparar con el arma
        if (damage > 0) {
            const dx = npc.x - this.x;
            const dy = npc.y - this.y;
            const distanceToNPC = Math.sqrt(dx * dx + dy * dy);
    
            // Calcular el ángulo hacia el NPC
            let angleToNPC = Math.atan2(dy, dx) - this.angle;
            angleToNPC = ((angleToNPC + Math.PI) % (2 * Math.PI)) - Math.PI; // Normalizar entre -PI y PI
    
            const halfFOV = this.fov / 2;
    
            // Verificar si el NPC está dentro del campo de visión y no bloqueado por una pared
            if (angleToNPC >= -halfFOV && angleToNPC <= halfFOV) {
                const steps = Math.ceil(distanceToNPC / 0.1); // Dividir la distancia en pasos pequeños
                for (let i = 0; i < steps; i++) {
                    const testX = this.x + (dx / steps) * i;
                    const testY = this.y + (dy / steps) * i;
    
                    const mapX = Math.floor(testX);
                    const mapY = Math.floor(testY);
    
                    if (this.map.isWall(mapX, mapY)) {
                        console.log("El disparo fue bloqueado por una pared.");
                        return; // Hay una pared bloqueando la línea de visión
                    }
                }
    
                // Si no hay obstrucciones, hacer daño al NPC
                npc.takeDamage(damage);
                console.log("¡Disparo exitoso! NPC recibió daño.");
    
                // Activar el destello de disparo
                if (this.renderer3d) {
                    this.renderer3d.isShootingActive = true;
                } else {
                    console.error("renderer3d no está definido.");
                }
            }
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount); // Reducir vida sin bajar de 0
        if (this.health === 0) {
            this.die();
        }
    }

    die() {
        console.log("El jugador ha muerto.");
        const deathScreen = document.getElementById('deathScreen');
        deathScreen.style.display = 'flex'; // Mostrar la pantalla de muerte
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
    update(inputState, npc, currentTime) {
        if (inputState.ArrowLeft) this.rotateLeft();
        if (inputState.ArrowRight) this.rotateRight();

        if (inputState.ArrowUp || inputState.w) this.moveForward();
        if (inputState.ArrowDown || inputState.s) this.moveBackward();

        if (inputState[' ']) {
            this.shoot(npc, currentTime);
        }

        if (inputState.a) this.strafeLeft();
        if (inputState.d) this.strafeRight();
    }
}
