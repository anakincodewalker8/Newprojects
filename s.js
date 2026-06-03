const gameGrid = document.getElementById('gameGrid');
const searchBar = document.getElementById('searchBar');
const gameModal = document.getElementById('gameModal');
const gameFrame = document.getElementById('gameFrame');
const closeBtn = document.getElementById('closeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');

let gamesData = [];

// 3D Star Wars Jedi Starfighter Game Core
const localCombatCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Jedi Starfighter 3D Simulator</title>
    <style>
        body { margin: 0; overflow: hidden; background-color: #000; font-family: 'Courier New', monospace; }
        #hud { position: absolute; top: 20px; left: 20px; color: #00ffcc; font-size: 18px; pointer-events: none; text-shadow: 0 0 8px #00ffcc; }
        #controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: #ff0055; font-size: 12px; pointer-events: none; text-align: center; }
        #gameover { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #fff; font-size: 40px; text-align: center; text-shadow: 0 0 15px #ff0055; }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>

    <div id="hud">JEDI_CORE_ONLINE // SCORE: <span id="score">0</span> // SHIELD: <span id="shields">100</span>%</div>
    <div id="controls">MOUSE / TRACKPAD: Move Ship // CLICK: Fire Lasers</div>
    <div id="gameover">CRITICAL DAMAGE<br><span style="font-size:20px; color:#00ffcc;">CLICK TO REBOOT SYSTEM</span></div>

    <script>
        let scene, camera, renderer, ship, score = 0, shields = 100, alive = true;
        let obstacles = [], lasers = [], stars = [];
        let mouse = { x: 0, y: 0 };

        function init() {
            // Setup 3D Scene
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x333333);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0x00ffcc, 1);
            directionalLight.position.set(1, 1, 1).normalize();
            scene.add(directionalLight);

            // Build Player Ship (Jedi Starfighter Geometry)
            const shipGroup = new THREE.Group();
            
            // Main Wing/Body
            const bodyGeo = new THREE.ConeGeometry(1.2, 5, 4);
            bodyGeo.rotateX(Math.PI / 2);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            shipGroup.add(body);

            // Left Wing
            const leftWingGeo = new THREE.BoxGeometry(3, 0.1, 3);
            const wingMat = new THREE.MeshStandardMaterial({ color: 0x990000 });
            const leftWing = new THREE.Mesh(leftWingGeo, wingMat);
            leftWing.position.set(-1.5, 0, 0);
            shipGroup.add(leftWing);

            // Right Wing
            const rightWing = leftWing.clone();
            rightWing.position.set(1.5, 0, 0);
            shipGroup.add(rightWing);

            ship = shipGroup;
            scene.add(ship);
            ship.position.z = -5;

            // Starfield Background
            const starGeo = new THREE.BufferGeometry();
            const starCount = 500;
            const starPos = new Float32Array(starCount * 3);
            for(let i=0; i<starCount*3; i+=3) {
                starPos[i] = (Math.random() - 0.5) * 100;
                starPos[i+1] = (Math.random() - 0.5) * 100;
                starPos[i+2] = -Math.random() * 400;
            }
            starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
            const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
            const starField = new THREE.Points(starGeo, starMat);
            scene.add(starField);

            camera.position.z = 5;

            // Event Listeners
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('click', onMouseClick);
            window.addEventListener('resize', onWindowResize);

            animate();
        }

        function onMouseMove(e) {
            // Normalize mouse vector coordinates between -1 and 1
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }

        function onMouseClick() {
            if (!alive) {
                resetGame();
                return;
            }
            // Fire Dual Lasers
            fireLaser(-0.8);
            fireLaser(0.8);
        }

        function fireLaser(offsetX) {
            const laserGeo = new THREE.CylinderGeometry(0.08, 0.08, 2);
            laserGeo.rotateX(Math.PI / 2);
            const laserMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
            const laser = new THREE.Mesh(laserGeo, laserMat);
            
            laser.position.set(ship.position.x + offsetX, ship.position.y, ship.position.z - 2);
            scene.add(laser);
            lasers.push(laser);
        }

        function spawnObstacle() {
            if(Math.random() > 0.08) return; // Control spawn density rate

            // Generate an asteroid or space debris
            const size = Math.random() * 2 + 1;
            const geo = new THREE.DodecahedronGeometry(size, 1);
            const mat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 });
            const obstacle = new THREE.Mesh(geo, mat);

            obstacle.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20,
                -200
            );
            scene.add(obstacle);
            obstacles.push(obstacle);
        }

        function animate() {
            requestAnimationFrame(animate);

            if (alive) {
                // Smoothly slide ship toward target mouse coordinate boundaries
                ship.position.x += (mouse.x * 15 - ship.position.x) * 0.1;
                ship.position.y += (mouse.y * 10 - ship.position.y) * 0.1;

                // Subtle rotational banking effect based on speed movement
                ship.rotation.z = -(ship.position.x - mouse.x * 15) * 0.05;
                ship.rotation.y = (ship.position.x - mouse.x * 15) * 0.02;

                spawnObstacle();

                // Process lasers tracking forward
                for (let i = lasers.length - 1; i >= 0; i--) {
                    lasers[i].position.z -= 4;
                    if (lasers[i].position.z < -250) {
                        scene.remove(lasers[i]);
                        lasers.splice(i, 1);
                    }
                }

                // Process space debris physics movement forward
                for (let i = obstacles.length - 1; i >= 0; i--) {
                    let obs = obstacles[i];
                    obs.position.z += 1.5; // Game speed metric
                    obs.rotation.x += 0.01;
                    obs.rotation.y += 0.02;

                    // Laser hits debris check
                    for (let j = lasers.length - 1; j >= 0; j--) {
                        if (lasers[j] && obs.position.distanceTo(lasers[j].position) < 3) {
                            scene.remove(obs);
                            obstacles.splice(i, 1);
                            scene.remove(lasers[j]);
                            lasers.splice(j, 1);
                            score += 100;
                            document.getElementById('score').innerText = score;
                            break;
                        }
                    }

                    // Ship crashes into debris collision check
                    if (obs && obs.position.distanceTo(ship.position) < 2.5) {
                        scene.remove(obs);
                        obstacles.splice(i, 1);
                        shields -= 25;
                        document.getElementById('shields').innerText = shields;

                        if (shields <= 0) {
                            alive = false;
                            document.getElementById('gameover').style.display = "block";
                        }
                    }

                    // Clean up missed objects
                    if (obs && obs.position.z > 10) {
                        scene.remove(obs);
                        obstacles.splice(i, 1);
                        score += 10; // Gain passive score points for avoiding targets
                        document.getElementById('score').innerText = score;
                    }
                }
            }

            renderer.render(scene, camera);
        }

        function resetGame() {
            obstacles.forEach(o => scene.remove(o));
            lasers.forEach(l => scene.remove(l));
            obstacles = [];
            lasers = [];
            score = 0;
            shields = 100;
            alive = true;
            ship.position.set(0, 0, -5);
            document.getElementById('score').innerText = score;
            document.getElementById('shields').innerText = shields;
            document.getElementById('gameover').style.display = "none";
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        init();
    </script>
</body>
</html>`;

async function fetchGames() {
    try {
        const response = await fetch('games.json');
        gamesData = await response.json();
        displayGames(gamesData);
    } catch (err) {
        console.error("DATA ERROR:", err);
    }
}

function displayGames(list) {
    gameGrid.innerHTML = "";
    list.forEach(game => {
        const card = document.createElement('div');
        card.classList.add('game-card');
        card.innerHTML = `
            <img src="${game.thumbnail}" alt="${game.title}">
            <h3>${game.title}</h3>
        `;
        card.addEventListener('click', () => launchFrame(game.attributes));
        gameGrid.appendChild(card);
    });
}

function launchFrame(attrs) {
    if (attrs.src === "local_combat") {
        const blob = new Blob([localCombatCode], { type: 'text/html' });
        gameFrame.src = URL.createObjectURL(blob);
    } else {
        gameFrame.src = attrs.src;
    }
    
    gameFrame.setAttribute('scrolling', attrs.scrolling);
    gameFrame.setAttribute('frameborder', attrs.frameborder);
    if (attrs.allowfullscreen === "true") {
        gameFrame.setAttribute('allowfullscreen', 'true');
    }
    gameModal.style.display = "flex";
}

function terminateFrame() {
    gameModal.style.display = "none";
    gameFrame.removeAttribute('src');
}

closeBtn.addEventListener('click', terminateFrame);

fullscreenBtn.addEventListener('click', () => {
    if (gameFrame.requestFullscreen) gameFrame.requestFullscreen();
    else if (gameFrame.webkitRequestFullscreen) gameFrame.webkitRequestFullscreen();
});

searchBar.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = gamesData.filter(g => g.title.toLowerCase().includes(term));
    displayGames(filtered);
});

fetchGames();
