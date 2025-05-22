export default class NPC {
    constructor(x, y, map, player, speed = 0.2) {
        this.x = x;
        this.y = y;
        this.map = map;
        this.player = player;
        this.speed = speed;
        this.detectionRadius = 5;
        this.attackRadius = 1;
        this.damage = 10;
        this.health = 100; // Vida inicial del NPC
        this.state = 'patrolling'; // Estados: 'patrolling', 'chasing', 'attacking'
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health === 0) {
            this.die();
        }
    }

    die() {
        console.log("El NPC ha muerto.");
        const deathScreen = document.getElementById('deathScreen');
        deathScreen.style.display = 'flex'; // Mostrar la pantalla de muerte
    }

    update(deltaTime) {
        if (this.health <= 0) return;
        if (this.health <= 0) return; // No hacer nada si está muerto
    
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    
        if (distanceToPlayer <= this.attackRadius) {
            this.state = 'attacking';
        } else if (distanceToPlayer <= this.detectionRadius) {
            this.state = 'chasing';
        } else {
            this.state = 'patrolling';
        }
    
        if (this.state === 'patrolling') {
            this.patrol(deltaTime);
        } else if (this.state === 'chasing') {
            this.chasePlayer(deltaTime);
        } else if (this.state === 'attacking') {
            this.attackPlayer();
        }
    }

    patrol(deltaTime) {
        if (!this.patrolDirection) {
            this.patrolDirection = 1; // Dirección inicial (1 = adelante, -1 = atrás)
            this.patrolAngle = Math.random() * Math.PI * 2; // Ángulo inicial aleatorio
        }
    
        const newX = this.x + Math.cos(this.patrolAngle) * this.speed * deltaTime * this.patrolDirection;
        const newY = this.y + Math.sin(this.patrolAngle) * this.speed * deltaTime * this.patrolDirection;
    
        if (this.map.canMove(newX, newY)) {
            // Si puede moverse, actualiza la posición
            this.x = newX;
            this.y = newY;
        } else {
            // Si no puede moverse, cambia la dirección y ajusta el ángulo
            this.patrolDirection *= -1; // Cambiar dirección
            this.patrolAngle += Math.PI / 2; // Girar 90 grados
        }
    }
    
    chasePlayer(deltaTime) {
        const startX = Math.floor(this.x);
        const startY = Math.floor(this.y);
        const targetX = Math.floor(this.player.x);
        const targetY = Math.floor(this.player.y);
    
        const path = this.map.findPath(startX, startY, targetX, targetY);
    
        if (path && path.length > 0) {
            const nextStep = path[0]; // Siguiente celda en el camino
            const dx = nextStep.x + 0.5 - this.x; // Ajustar al centro de la celda
            const dy = nextStep.y + 0.5 - this.y;
            this.patrolAngle = Math.atan2(dy, dx);
            const angleToNextStep = Math.atan2(dy, dx);
    
            const newX = this.x + Math.cos(angleToNextStep) * this.speed * deltaTime;
            const newY = this.y + Math.sin(angleToNextStep) * this.speed * deltaTime;
    
            if (this.map.canMove(newX, newY)) {
                this.x = newX;
                this.y = newY;
            }
        }
    }

    attackPlayer() {
        this.player.takeDamage(this.damage);
    }
}