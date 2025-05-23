export default class Weapon {
    constructor(name, damage, cooldown) {
        this.name = name; // Nombre del arma
        this.damage = damage; // Daño que inflige
        this.cooldown = cooldown; // Tiempo de espera entre disparos (en segundos)
        this.lastShotTime = 0; // Tiempo del último disparo
    }

    canShoot(currentTime) {
        // Verificar si el cooldown ha terminado
        return currentTime - this.lastShotTime >= this.cooldown;
    }
 
    shoot(currentTime) {
        console.log(currentTime);
        if (this.canShoot(currentTime)) {
            console.log(`${this.name} disparó.`);
            this.lastShotTime = currentTime; // Actualizar el tiempo del último disparo
            console.log(`${this.name} disparó e infligió ${this.damage} de daño.`);
            return this.damage; // Retorna el daño infligido
        } else {
            console.log(`${this.name} está en cooldown.`);
            return 0; // No inflige daño si está en cooldown
        }
    }
}