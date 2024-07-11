const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

const loader = new THREE.GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const board = [];
const pieces = [];
let selectedPiece = null;
let currentTurn = 'white';
const turnIndicator = document.getElementById('turn-indicator');

// Set up lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Set up camera and controls
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Set up sky background
const skyTexture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg');
skyTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = skyTexture;

// Create floating chessboard
const boardTexture = textureLoader.load('Board.png');
const boardGeometry = new THREE.BoxGeometry(8, 0.2, 8);
const boardMaterial = new THREE.MeshPhongMaterial({ map: boardTexture });
const boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
scene.add(boardMesh);

// Create chess pieces
const pieceModels = {
    'pawn': 'https://raw.githubusercontent.com/thecodemodule/3DChessGame/main/models/pawn.glb',
    'rook': 'https://raw.githubusercontent.com/thecodemodule/3DChessGame/main/models/rook.glb',
    'knight': 'https://raw.githubusercontent.com/thecodemodule/3DChessGame/main/models/knight.glb',
    'bishop': 'https://raw.githubusercontent.com/thecodemodule/3DChessGame/main/models/bishop.glb',
    'queen': 'https://raw.githubusercontent.com/thecodemodule/3DChessGame/main/models/queen.glb',
    'king': 'https://raw.githubusercontent.com/thecodemodule/3DChessGame/main/models/king.glb'
};

function createPiece(type, color, x, z) {
    return new Promise((resolve) => {
        loader.load(pieceModels[type], (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5);
            model.position.set(x - 3.5, 0.1, z - 3.5);
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.setHex(color === 'white' ? 0xFFFFFF : 0x333333);
                }
            });
            model.userData = { type, color };
            scene.add(model);
            pieces.push(model);
            resolve(model);
        });
    });
}

// Initial piece setup
const initialSetup = [
    { type: 'rook', positions: [[0, 0], [7, 0], [0, 7], [7, 7]] },
    { type: 'knight', positions: [[1, 0], [6, 0], [1, 7], [6, 7]] },
    { type: 'bishop', positions: [[2, 0], [5, 0], [2, 7], [5, 7]] },
    { type: 'queen', positions: [[3, 0], [3, 7]] },
    { type: 'king', positions: [[4, 0], [4, 7]] },
    { type: 'pawn', positions: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6]] }
];

async function setupBoard() {
    for (const { type, positions } of initialSetup) {
        for (const [x, z] of positions) {
            await createPiece(type, z <= 1 ? 'white' : 'black', x, z);
        }
    }
}

setupBoard();

// Raycaster for piece selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(pieces, true);

    if (intersects.length > 0) {
        const clickedPiece = intersects[0].object.parent;
        if (clickedPiece.userData.color === currentTurn) {
            if (selectedPiece) {
                selectedPiece.traverse((child) => {
                    if (child.isMesh) {
                        child.material.emissive.setHex(0x000000);
                    }
                });
            }
            selectedPiece = clickedPiece;
            selectedPiece.traverse((child) => {
                if (child.isMesh) {
                    child.material.emissive.setHex(0x00ff00);
                }
            });
        } else if (selectedPiece) {
            movePiece(selectedPiece, clickedPiece.position);
        }
    } else if (selectedPiece) {
        const boardIntersects = raycaster.intersectObject(boardMesh);
        if (boardIntersects.length > 0) {
            movePiece(selectedPiece, boardIntersects[0].point);
        }
    }
}

function movePiece(piece, targetPosition) {
    const fromX = Math.round(piece.position.x + 3.5);
    const fromZ = Math.round(piece.position.z + 3.5);
    const toX = Math.round(targetPosition.x + 3.5);
    const toZ = Math.round(targetPosition.z + 3.5);

    if (isValidMove(piece.userData.type, piece.userData.color, fromX, fromZ, toX, toZ)) {
        const capturedPiece = pieces.find(p => 
            Math.round(p.position.x + 3.5) === toX && 
            Math.round(p.position.z + 3.5) === toZ && 
            p.userData.color !== piece.userData.color
        );

        if (capturedPiece) {
            capturePiece(capturedPiece);
        }

        gsap.to(piece.position, {
            x: toX - 3.5,
            z: toZ - 3.5,
            y: 1,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(piece.position, {
                    y: 0.1,
                    duration: 0.2,
                    ease: "bounce.out",
                    onComplete: () => {
                        piece.traverse((child) => {
                            if (child.isMesh) {
                                child.material.emissive.setHex(0x000000);
                            }
                        });
                        selectedPiece = null;
                        switchTurn();
                    }
                });
            }
        });
    }
}

function isValidMove(pieceType, pieceColor, fromX, fromZ, toX, toZ) {
    const dx = Math.abs(toX - fromX);
    const dz = Math.abs(toZ - fromZ);

    switch (pieceType) {
        case 'pawn':
            if (pieceColor === 'white') {
                return (toZ === fromZ + 1 && dx === 0) || (fromZ === 1 && toZ === 3 && dx === 0);
            } else {
                return (toZ === fromZ - 1 && dx === 0) || (fromZ === 6 && toZ === 4 && dx === 0);
            }
        case 'rook':
            return dx === 0 || dz === 0;
        case 'knight':
            return (dx === 1 && dz === 2) || (dx === 2 && dz === 1);
        case 'bishop':
            return dx === dz;
        case 'queen':
            return dx === 0 || dz === 0 || dx === dz;
        case 'king':
            return dx <= 1 && dz <= 1;
        default:
            return false;
    }
}

function capturePiece(piece) {
    gsap.to(piece.position, {
        y: 2,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            scene.remove(piece);
            pieces.splice(pieces.indexOf(piece), 1);
        }
    });
}

function switchTurn() {
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    turnIndicator.textContent = `${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}'s Turn`;
}

document.getElementById('reset-game').addEventListener('click', resetGame);

async function resetGame() {
    pieces.forEach(piece => scene.remove(piece));
    pieces.length = 0;
    await setupBoard();
    currentTurn = 'white';
    turnIndicator.textContent = "White's Turn";
}

window.addEventListener('mousemove', onMouseMove);
window.addEventListener('click', onMouseClick);

// Add floating animation to the board
function animateBoard() {
    const time = performance.now() * 0.001;
    boardMesh.position.y = Math.sin(time) * 0.1;
    requestAnimationFrame(animateBoard);
}

animateBoard();

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});