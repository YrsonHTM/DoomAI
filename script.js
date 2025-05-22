        // Configuración inicial
        const canvas3d = document.getElementById("view3d");
        const canvas2d = document.getElementById("view2d");
        const ctx3d = canvas3d.getContext("2d");
        const ctx2d = canvas2d.getContext("2d");

        // Tamaño de los canvases
        canvas3d.width = window.innerWidth * 0.7;
        canvas3d.height = window.innerHeight;
        canvas2d.width = window.innerWidth * 0.3;
        canvas2d.height = window.innerHeight;

        // Mapa simple (1 = muro, 0 = espacio vacío, 2 = puerta)
        const map = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 2, 0, 0, 2, 0, 1, 1], // Puerta en (3,3)
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
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

        // Jugador
        const player = {
            x: 1.5,
            y: 1.5,
            angle: 0,
            fov: Math.PI / 3 // Campo de visión de 60 grados
        };

        // Estado de las puertas (inicialización automática)
        const doors = {};

        // Buscar todas las puertas en el mapa e inicializar su estado
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 2) {
                    const key = `${y},${x}`;
                    doors[key] = { isOpen: false, timer: 0 };
                }
            }
        }

        // Sistema de input
        const keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            a: false,
            s: false,
            d: false,
            ' ': false
        };

        // Configuración de velocidad
        const settings = {
            moveSpeed: 0.05,
            rotSpeed: 0.03,
            strafeSpeed: 0.03
        };

        // Dibujar mapa 2D
        function draw2dMap() {
            const cellSize = Math.min(canvas2d.width, canvas2d.height) / 10;
            ctx2d.fillStyle = "#000";
            ctx2d.fillRect(0, 0, canvas2d.width, canvas2d.height);

            // Dibujar celdas del mapa
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                    ctx2d.fillStyle = map[y][x] === 1 ? "#f00" : 
                                      map[y][x] === 2 ? "#a52" : "#333";
                    ctx2d.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    ctx2d.strokeStyle = "#000";
                    ctx2d.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }

            // Dibujar jugador
            ctx2d.fillStyle = "#0f0";
            ctx2d.beginPath();
            ctx2d.arc(
                player.x * cellSize,
                player.y * cellSize,
                cellSize / 4,
                0,
                Math.PI * 2
            );
            ctx2d.fill();

            // Dibujar dirección del jugador
            ctx2d.strokeStyle = "#0f0";
            ctx2d.beginPath();
            ctx2d.moveTo(player.x * cellSize, player.y * cellSize);
            ctx2d.lineTo(
                (player.x + Math.cos(player.angle)) * cellSize,
                (player.y + Math.sin(player.angle)) * cellSize
            );
            ctx2d.stroke();
        }
        function draw3dView() {
            // Limpiar el canvas
            ctx3d.fillStyle = "#111";
            ctx3d.fillRect(0, 0, canvas3d.width, canvas3d.height);
        
            // Dibujar techo (parte superior de la pantalla)
            const ceilingGradient = ctx3d.createLinearGradient(0, 0, 0, canvas3d.height / 2);
            ceilingGradient.addColorStop(0, "#222244"); // Azul oscuro
            ceilingGradient.addColorStop(1, "#111122");
            ctx3d.fillStyle = ceilingGradient;
            ctx3d.fillRect(0, 0, canvas3d.width, canvas3d.height / 2);
        
            // Dibujar piso (parte inferior de la pantalla)
            const floorGradient = ctx3d.createLinearGradient(0, canvas3d.height / 2, 0, canvas3d.height);
            floorGradient.addColorStop(0, "#332211"); // Marrón oscuro
            floorGradient.addColorStop(1, "#553322");
            ctx3d.fillStyle = floorGradient;
            ctx3d.fillRect(0, canvas3d.height / 2, canvas3d.width, canvas3d.height / 2);
        
            // Dibujar rayos (paredes)
            const numRays = canvas3d.width;
            for (let i = 0; i < numRays; i++) {
                const rayAngle = player.angle - player.fov / 2 + (i / numRays) * player.fov;
                let distance = 0;
                let hitWall = false;
                let wallType = 'wall';
                let wallX = 0, wallY = 0;
                let hitSide = ''; // 'x' o 'y' para saber qué lado fue golpeado
        
                // Raycasting
                while (!hitWall && distance < 20) {
                    distance += 0.1;
                    const testX = player.x + Math.cos(rayAngle) * distance;
                    const testY = player.y + Math.sin(rayAngle) * distance;
                    const mapX = Math.floor(testX);
                    const mapY = Math.floor(testY);
        
                    // Verificar colisión
                    if (map[mapY] && map[mapY][mapX] === 1) {
                        hitWall = true;
                        wallType = 'wall';
                        wallX = mapX;
                        wallY = mapY;
                        
                        // Determinar qué lado de la pared fue golpeado
                        const testXDecimal = testX - mapX;
                        const testYDecimal = testY - mapY;
                        
                        // Calculamos qué lado del bloque fue golpeado
                        if (Math.abs(testXDecimal - 0.5) > Math.abs(testYDecimal - 0.5)) {
                            hitSide = testXDecimal < 0.5 ? 'left' : 'right';
                        } else {
                            hitSide = testYDecimal < 0.5 ? 'top' : 'bottom';
                        }
                        
                        // Verificar si hay una puerta adyacente en el lado golpeado
                        let adjacentX = mapX, adjacentY = mapY;
                        if (hitSide === 'left') adjacentX--;
                        else if (hitSide === 'right') adjacentX++;
                        else if (hitSide === 'top') adjacentY--;
                        else if (hitSide === 'bottom') adjacentY++;
                        
                        if (map[adjacentY] && map[adjacentY][adjacentX] === 2) {
                            wallType = 'door_wall'; // Solo este lado tendrá el color especial
                        }
                        
                    } else if (map[mapY] && map[mapY][mapX] === 2) {
                        if (!doors[`${mapY},${mapX}`]?.isOpen) {
                            hitWall = true;
                            wallType = 'door';
                        }
                    }
                }
        
                if (hitWall) {
                    const wallHeight = Math.min(canvas3d.height, (canvas3d.height * 1.5) / distance);
                    const wallBrightness = Math.min(255, 255 / (distance * 0.5));
                    
                    if (wallType === 'door') {
                        ctx3d.fillStyle = `rgb(${wallBrightness}, ${wallBrightness * 0.5}, 0)`;
                    } else if (wallType === 'door_wall') {
                        ctx3d.fillStyle = `rgb(${wallBrightness}, ${wallBrightness * 0.4}, ${wallBrightness * 0.1})`;
                    } else {
                        ctx3d.fillStyle = `rgb(${wallBrightness}, ${wallBrightness * 0.3}, ${wallBrightness * 0.3})`;
                    }
                    
                    ctx3d.fillRect(i, (canvas3d.height - wallHeight) / 2, 2, wallHeight);
                }
            }
        }

// Función canMove (MODIFICADA)
function canMove(newX, newY) {
    // Coordenadas del mapa a verificar
    const mapX = Math.floor(newX);
    const mapY = Math.floor(newY);

    // Verificar límites del mapa
    if (mapY < 0 || mapY >= map.length || mapX < 0 || mapX >= map[mapY].length) {
        return false;
    }

    // Verificar si es un muro o puerta cerrada
    const cell = map[mapY][mapX];
    if (cell === 1 || (cell === 2 && !doors[`${mapY},${mapX}`]?.isOpen)) {
        return false;
    }

    return true;
}

// Función para abrir/cerrar puertas (MODIFICADA)
function toggleDoor(x, y) {
    const key = `${y},${x}`;
    if (doors[key]) {
        doors[key].isOpen = !doors[key].isOpen;
        doors[key].timer = Date.now();
        // No cambiamos el valor en el mapa, siempre queda como 2
    }
}


            // Verificar si el jugador está cerca de una puerta
            function checkNearDoor() {
                const checkRadius = 1.2; // Radio de interacción más amplio
                const playerMapX = Math.floor(player.x);
                const playerMapY = Math.floor(player.y);
                
                // Verificar las 4 celdas adyacentes
                const directions = [
                    {x: 0, y: -1}, // Arriba
                    {x: 1, y: 0},  // Derecha
                    {x: 0, y: 1},  // Abajo
                    {x: -1, y: 0}  // Izquierda
                ];
                
                for (const dir of directions) {
                    const checkX = playerMapX + dir.x;
                    const checkY = playerMapY + dir.y;
                    
                    // Verificar si es una puerta
                    if (map[checkY] && map[checkY][checkX] === 2) {
                        // Calcular distancia real a la puerta
                        const doorCenterX = checkX + 0.5;
                        const doorCenterY = checkY + 0.5;
                        const distance = Math.sqrt(
                            Math.pow(player.x - doorCenterX, 2) + 
                            Math.pow(player.y - doorCenterY, 2)
                        );
                        
                        if (distance <= checkRadius) {
                            return { x: checkX, y: checkY };
                        }
                    }
                }
                return null;
            }

        // Función de actualización del juego
        function update() {
            // Rotación
            if (keys.ArrowLeft) player.angle -= settings.rotSpeed;
            if (keys.ArrowRight) player.angle += settings.rotSpeed;

            // Movimiento adelante/atrás
            if (keys.ArrowUp || keys.w) {
                const newX = player.x + Math.cos(player.angle) * settings.moveSpeed;
                const newY = player.y + Math.sin(player.angle) * settings.moveSpeed;
                if (canMove(newX, newY)) {
                    player.x = newX;
                    player.y = newY;
                }
            }
            
            if (keys.ArrowDown || keys.s) {
                const newX = player.x - Math.cos(player.angle) * settings.moveSpeed;
                const newY = player.y - Math.sin(player.angle) * settings.moveSpeed;
                if (canMove(newX, newY)) {
                    player.x = newX;
                    player.y = newY;
                }
            }

            // Strafe (movimiento lateral)
            if (keys.a) {
                const newX = player.x + Math.cos(player.angle - Math.PI/2) * settings.strafeSpeed;
                const newY = player.y + Math.sin(player.angle - Math.PI/2) * settings.strafeSpeed;
                if (canMove(newX, newY)) {
                    player.x = newX;
                    player.y = newY;
                }
            }
            
            if (keys.d) {
                const newX = player.x + Math.cos(player.angle + Math.PI/2) * settings.strafeSpeed;
                const newY = player.y + Math.sin(player.angle + Math.PI/2) * settings.strafeSpeed;
                if (canMove(newX, newY)) {
                    player.x = newX;
                    player.y = newY;
                }
            }
        }

        document.addEventListener('keydown', (e) => {
            if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
            if (e.key === ' ') {
                const door = checkNearDoor(); // Usamos la nueva función
                if (door) toggleDoor(door.x, door.y);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
        });

        // Bucle del juego
        function gameLoop() {
            update();
            draw2dMap();
            draw3dView();
            
            // Mostrar u ocultar texto de interacción
            const interactionText = document.getElementById('interactionText');
            const nearDoor = checkNearDoor();
                if (nearDoor && !doors[`${nearDoor.y},${nearDoor.x}`]?.isOpen) {
                    interactionText.style.display = 'block';
                    interactionText.textContent = 'Presiona ESPACIO para abrir la puerta';
                } else {
                    interactionText.style.display = 'none';
                }
            
            requestAnimationFrame(gameLoop);
        }

        // Iniciar el juego
        gameLoop();