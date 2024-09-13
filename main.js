// main.js

// Get references to DOM elements
const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');

const loadingScreen = document.getElementById('loading-screen');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');

const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

let gameRunning = false;

if (!gl) {
    alert('WebGL not supported');
} else {
    // Hide the loading screen and show the start screen immediately
    loadingScreen.style.display = 'none';
    startScreen.style.display = 'flex';

    // Proceed with the rest of the code inside an anonymous function
    (function() {

        // Vertex shader program
        const vsSource = `
      attribute vec2 aVertexPosition;
      uniform vec2 uResolution;
      uniform vec2 uTranslation;

      void main() {
        vec2 position = aVertexPosition + uTranslation;
        vec2 zeroToOne = position / uResolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      }
    `;

        // Fragment shader program
        const fsSource = `
      precision mediump float;
      uniform vec4 uColor;

      void main() {
        gl_FragColor = uColor;
      }
    `;

        // Initialize shaders
        function initShaderProgram(gl, vsSource, fsSource) {
            const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

            // Create the shader program
            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            // Check for errors
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert('Unable to initialize the shader program: ' +
                    gl.getProgramInfoLog(shaderProgram));
                return null;
            }

            return shaderProgram;
        }

        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);

            // Send the source to the shader object
            gl.shaderSource(shader, source);

            // Compile the shader program
            gl.compileShader(shader);

            // Check for errors
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert('An error occurred compiling the shaders: ' +
                    gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }

        const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
        gl.useProgram(shaderProgram);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
                translation: gl.getUniformLocation(shaderProgram, 'uTranslation'),
                color: gl.getUniformLocation(shaderProgram, 'uColor'),
            },
        };

        // Create a buffer for the square's positions.
        const positionBuffer = gl.createBuffer();

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Set up the positions.
        const tileSize = 32;
        const positions = [
            0, 0,
            tileSize, 0,
            0, tileSize,
            0, tileSize,
            tileSize, 0,
            tileSize, tileSize,
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Variables for game state
        let mapWidth, mapHeight, mapData, trinkets, trinketPoints, player, score, level, userPosition, offsetX, offsetY;
        let gameId; // Unique game ID

        // Handle keyboard input
        const keysPressed = {};

        window.addEventListener('keydown', (e) => {
            if (gameRunning) {
                keysPressed[e.key] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (gameRunning) {
                keysPressed[e.key] = false;
            }
        });

        // Initialize the game
        function initGame() {
            // Clear keysPressed to prevent automatic movement
            for (let key in keysPressed) {
                keysPressed[key] = false;
            }

            // Generate a unique game ID
            gameId = generateGameId();

            // Map data
            mapWidth = 20;
            mapHeight = 15;

            // Generate a simple map with walls around the edges
            mapData = [];
            for (let y = 0; y < mapHeight; y++) {
                const row = [];
                for (let x = 0; x < mapWidth; x++) {
                    if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
                        row.push(1); // Brown block (wall)
                    } else {
                        row.push(0); // Green tile
                    }
                }
                mapData.push(row);
            }

            // Trinket point values
            trinketPoints = {
                0: 10, // Red
                1: 20, // Yellow
                2: 30, // Cyan
            };

            // Generate trinkets on accessible tiles
            generateTrinkets(5); // Generate 5 trinkets

            // Player
            player = {
                x: Math.floor(mapWidth / 2),
                y: Math.floor(mapHeight / 2),
                size: tileSize / 2,
                color: [1.0, 1.0, 1.0, 1.0], // White
            };

            // Score and Level
            score = 0;
            scoreElement.textContent = score;
            level = 1;
            levelElement.textContent = level;

            // Get user's GPS location
            userPosition = { x: player.x, y: player.y }; // Default position

            getUserLocation().then((position) => {
                // Map GPS coordinates to map coordinates
                userPosition = gpsToMapCoordinates(position.latitude, position.longitude);
                player.x = userPosition.x;
                player.y = userPosition.y;

                // Update offset to center the map on the player's position
                offsetX = canvas.width / 2 - player.x * tileSize;
                offsetY = canvas.height / 2 - player.y * tileSize;
            }).catch((error) => {
                console.error('Could not get user location:', error);

                // Update offset to center the map on the player's position
                offsetX = canvas.width / 2 - player.x * tileSize;
                offsetY = canvas.height / 2 - player.y * tileSize;
            });
        }

        function generateGameId() {
            // Simple UUID generator
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function generateTrinkets(numTrinkets) {
            trinkets = [];
            for (let i = 0; i < numTrinkets; i++) {
                let x, y;
                do {
                    x = Math.floor(Math.random() * (mapWidth - 2)) + 1; // Avoid walls
                    y = Math.floor(Math.random() * (mapHeight - 2)) + 1;
                } while (mapData[y][x] === 1); // Ensure not on brown block
                trinkets.push({ x, y, type: i % 3, collected: false });
            }
        }

        function getUserLocation() {
            return new Promise((resolve, reject) => {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            resolve({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                            });
                        },
                        (error) => {
                            reject(error);
                        }
                    );
                } else {
                    reject(new Error("Geolocation not supported"));
                }
            });
        }

        function gpsToMapCoordinates(latitude, longitude) {
            // Map latitude and longitude to map coordinates
            // Assuming latitude ranges from -90 to 90 and longitude from -180 to 180
            let x = Math.floor(((longitude + 180) / 360) * mapWidth);
            let y = Math.floor(((90 - latitude) / 180) * mapHeight);

            // Ensure x and y are within map bounds and not on walls
            if (x <= 0) x = 1;
            if (x >= mapWidth - 1) x = mapWidth - 2;
            if (y <= 0) y = 1;
            if (y >= mapHeight - 1) y = mapHeight - 2;

            // If tile is a brown block, find nearest accessible tile
            if (mapData[y][x] === 1) {
                // Find nearest accessible tile (simple approach)
                outer: for (let radius = 1; radius < Math.max(mapWidth, mapHeight); radius++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        for (let dy = -radius; dy <= radius; dy++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx > 0 && nx < mapWidth - 1 && ny > 0 && ny < mapHeight - 1 && mapData[ny][nx] !== 1) {
                                x = nx;
                                y = ny;
                                break outer;
                            }
                        }
                    }
                }
            }

            return { x, y };
        }

        function updatePlayerPosition() {
            let dx = 0;
            let dy = 0;

            if (keysPressed['ArrowUp']) dy -= 0.1;
            if (keysPressed['ArrowDown']) dy += 0.1;
            if (keysPressed['ArrowLeft']) dx -= 0.1;
            if (keysPressed['ArrowRight']) dx += 0.1;

            // Calculate new position
            const newX = player.x + dx;
            const newY = player.y + dy;

            // Check for collisions with brown blocks (tileType === 1)
            const tileX = Math.floor(newX);
            const tileY = Math.floor(newY);

            if (
                tileX >= 0 && tileX < mapWidth &&
                tileY >= 0 && tileY < mapHeight &&
                mapData[tileY][tileX] !== 1 // 1 is brown block
            ) {
                player.x = newX;
                player.y = newY;

                // Check for trinket collection
                checkTrinketCollection();
            }

            // Update offset to keep player centered
            offsetX = canvas.width / 2 - player.x * tileSize;
            offsetY = canvas.height / 2 - player.y * tileSize;
        }

        function checkTrinketCollection() {
            trinkets.forEach((trinket) => {
                if (!trinket.collected) {
                    const distance = Math.hypot(trinket.x - player.x, trinket.y - player.y);
                    if (distance < 0.5) {
                        trinket.collected = true;
                        score += trinketPoints[trinket.type];
                        scoreElement.textContent = score;

                        // Check if all trinkets are collected
                        if (trinkets.every(t => t.collected)) {
                            endGame();
                        }
                    }
                }
            });
        }

        // Adjust the canvas size
        function resizeCanvasToDisplaySize(canvas) {
            const displayWidth  = canvas.clientWidth;
            const displayHeight = canvas.clientHeight;

            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width  = displayWidth;
                canvas.height = displayHeight;
            }
        }

        function drawScene() {
            resizeCanvasToDisplaySize(gl.canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black
            gl.clear(gl.COLOR_BUFFER_BIT);

            // Set the resolution
            gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);

            // Draw map tiles
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                    const tileType = mapData[y][x];
                    let color;
                    switch (tileType) {
                        case 0:
                            color = [0.0, 0.5, 0.0, 1.0]; // Green
                            break;
                        case 1:
                            color = [0.5, 0.25, 0.0, 1.0]; // Brown (Block)
                            break;
                        case 2:
                            color = [0.0, 0.0, 0.5, 1.0]; // Blue
                            break;
                        default:
                            color = [1.0, 1.0, 1.0, 1.0]; // White
                    }

                    gl.uniform4fv(programInfo.uniformLocations.color, color);

                    const xPos = x * tileSize + offsetX;
                    const yPos = y * tileSize + offsetY;

                    gl.uniform2f(programInfo.uniformLocations.translation, xPos, yPos);

                    // Set up the position attribute
                    {
                        const numComponents = 2;
                        const type = gl.FLOAT;
                        const normalize = false;
                        const stride = 0;
                        const offset = 0;
                        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                        gl.vertexAttribPointer(
                            programInfo.attribLocations.vertexPosition,
                            numComponents,
                            type,
                            normalize,
                            stride,
                            offset);
                        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
                    }

                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                }
            }

            // Draw trinkets
            trinkets.forEach((trinket) => {
                if (!trinket.collected) {
                    let color;
                    switch (trinket.type) {
                        case 0:
                            color = [1.0, 0.0, 0.0, 1.0]; // Red
                            break;
                        case 1:
                            color = [1.0, 1.0, 0.0, 1.0]; // Yellow
                            break;
                        case 2:
                            color = [0.0, 1.0, 1.0, 1.0]; // Cyan
                            break;
                        default:
                            color = [1.0, 1.0, 1.0, 1.0]; // White
                    }

                    gl.uniform4fv(programInfo.uniformLocations.color, color);

                    const xPos = trinket.x * tileSize + offsetX;
                    const yPos = trinket.y * tileSize + offsetY;

                    gl.uniform2f(programInfo.uniformLocations.translation, xPos, yPos);

                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                }
            });

            // Draw player
            gl.uniform4fv(programInfo.uniformLocations.color, player.color);

            const playerXPos = player.x * tileSize - player.size / 2 + offsetX;
            const playerYPos = player.y * tileSize - player.size / 2 + offsetY;

            gl.uniform2f(programInfo.uniformLocations.translation, playerXPos, playerYPos);

            // Update the position buffer for the player size
            const playerSize = player.size;
            const playerPositions = [
                0, 0,
                playerSize, 0,
                0, playerSize,
                0, playerSize,
                playerSize, 0,
                playerSize, playerSize,
            ];

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(playerPositions), gl.STATIC_DRAW);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // Reset buffer to tile size
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        }

        // Game loop
        function gameLoop() {
            if (gameRunning) {
                updatePlayerPosition();
                drawScene();
                requestAnimationFrame(gameLoop);
            }
        }

        // Start the game after clicking the start button
        startButton.addEventListener('click', () => {
            startScreen.style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';
            canvas.style.display = 'block';
            gameRunning = true;
            initGame();
            gameLoop();
        });

        // Restart the game after clicking the restart button
        restartButton.addEventListener('click', () => {
            gameOverScreen.style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';
            canvas.style.display = 'block';
            gameRunning = true;
            initGame();
            gameLoop();
        });

        // End the game
        function endGame() {
            gameRunning = false;
            document.getElementById('game-container').style.display = 'none';
            gameOverScreen.style.display = 'flex';
            finalScoreElement.textContent = score;

            // Send game data to the server
            saveGameResult();
        }

        function saveGameResult() {
            const gameData = {
                gameId: gameId,
                score: score,
            };

            // Send a POST request to the server
            fetch('https://your-api-endpoint.com/save-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gameData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Game saved successfully:', data);
                })
                .catch((error) => {
                    console.error('Error saving game:', error);
                });
        }

    })(); // End of function
}
