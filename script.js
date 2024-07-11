const board = document.getElementById('board');
const movesList = document.getElementById('moves');
let selectedPiece = null;
let rotationX = 45;
let rotationY = 0;

function createBoard() {
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.classList.add((i + Math.floor(i / 8)) % 2 === 0 ? 'white' : 'black');
        square.style.transform = `translate3d(${(i % 8) * 12.5}%, ${Math.floor(i / 8) * 12.5}%, 0)`;
        square.addEventListener('click', () => handleSquareClick(i));
        board.appendChild(square);
    }
}

function createPiece(type, color, position) {
    const piece = document.createElement('div');
    piece.classList.add('piece');
    piece.textContent = type;
    piece.style.color = color;
    piece.style.transform = `translate3d(${(position % 8) * 12.5}%, ${Math.floor(position / 8) * 12.5}%, 5px)`;
    piece.addEventListener('click', () => selectPiece(piece));
    board.appendChild(piece);
    return piece;
}

function selectPiece(piece) {
    if (selectedPiece) {
        selectedPiece.style.boxShadow = '';
    }
    selectedPiece = piece;
    piece.style.boxShadow = '0 0 10px #fff';
}

function handleSquareClick(position) {
    if (selectedPiece) {
        movePiece(selectedPiece, position);
    }
}

function movePiece(piece, position) {
    piece.style.transform = `translate3d(${(position % 8) * 12.5}%, ${Math.floor(position / 8) * 12.5}%, 5px)`;
    selectedPiece.style.boxShadow = '';
    selectedPiece = null;
    addMoveToHistory(piece.textContent, position);
}

function addMoveToHistory(piece, position) {
    const move = document.createElement('li');
    move.textContent = `${piece} to ${String.fromCharCode(97 + (position % 8))}${8 - Math.floor(position / 8)}`;
    movesList.appendChild(move);
}

function updateBoardRotation() {
    board.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
}

document.getElementById('rotateLeft').addEventListener('click', () => {
    rotationY -= 45;
    updateBoardRotation();
});

document.getElementById('rotateRight').addEventListener('click', () => {
    rotationY += 45;
    updateBoardRotation();
});

document.getElementById('resetView').addEventListener('click', () => {
    rotationX = 45;
    rotationY = 0;
    updateBoardRotation();
});

createBoard();

// Initial piece setup
const pieces = [
    {type: '♔', color: 'white', position: 4},
    {type: '♕', color: 'white', position: 3},
    {type: '♖', color: 'white', position: 0},
    {type: '♖', color: 'white', position: 7},
    {type: '♗', color: 'white', position: 2},
    {type: '♗', color: 'white', position: 5},
    {type: '♘', color: 'white', position: 1},
    {type: '♘', color: 'white', position: 6},
    {type: '♙', color: 'white', position: 8},
    {type: '♙', color: 'white', position: 9},
    {type: '♙', color: 'white', position: 10},
    {type: '♙', color: 'white', position: 11},
    {type: '♙', color: 'white', position: 12},
    {type: '♙', color: 'white', position: 13},
    {type: '♙', color: 'white', position: 14},
    {type: '♙', color: 'white', position: 15},
    {type: '♚', color: 'black', position: 60},
    {type: '♛', color: 'black', position: 59},
    {type: '♜', color: 'black', position: 56},
    {type: '♜', color: 'black', position: 63},
    {type: '♝', color: 'black', position: 58},
    {type: '♝', color: 'black', position: 61},
    {type: '♞', color: 'black', position: 57},
    {type: '♞', color: 'black', position: 62},
    {type: '♟', color: 'black', position: 48},
    {type: '♟', color: 'black', position: 49},
    {type: '♟', color: 'black', position: 50},
    {type: '♟', color: 'black', position: 51},
    {type: '♟', color: 'black', position: 52},
    {type: '♟', color: 'black', position: 53},
    {type: '♟', color: 'black', position: 54},
    {type: '♟', color: 'black', position: 55},
];

pieces.forEach(piece => createPiece(piece.type, piece.color, piece.position));

// Add subtle board movement on mouse move
document.addEventListener('mousemove', (e) => {
    const subtleRotationX = (e.clientY / window.innerHeight - 0.5) * 5;
    const subtleRotationY = (e.clientX / window.innerWidth - 0.5) * 5;
    board.style.transform = `rotateX(${rotationX + subtleRotationX}deg) rotateY(${rotationY + subtleRotationY}deg)`;
});