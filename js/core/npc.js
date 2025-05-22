export default class NPC {
    constructor(x, y, map, player) {
        this.x = x;
        this.y = y;
        this.map = map;
        this.player = player;
        this.speed = 0.02;
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
        this.patrolAngle += this.speed * deltaTime;
        this.x += Math.cos(this.patrolAngle) * this.speed * deltaTime;
        this.y += Math.sin(this.patrolAngle) * this.speed * deltaTime;
    }

    chasePlayer(deltaTime) {
        const dx = this.player.x - this.x;
        const dy = this.player.y - this.y;
        const angleToPlayer = Math.atan2(dy, dx);

        this.x += Math.cos(angleToPlayer) * this.speed * deltaTime;
        this.y += Math.sin(angleToPlayer) * this.speed * deltaTime;
    }

    attackPlayer() {
        this.player.takeDamage(this.damage);
    }
}