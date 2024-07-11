const board = document.getElementById('board');
const movesList = document.getElementById('moves');
const turnIndicator = document.getElementById('turnIndicator');
const whiteCaptured = document.getElementById('whiteCaptured');
const blackCaptured = document.getElementById('blackCaptured');
let selectedPiece = null;
let rotationX = 45;
let rotationY = 0;
let currentTurn = 'white';
let moveHistory = [];

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
    piece.dataset.color = color;
    piece.style.transform = `translate3d(${(position % 8) * 12.5}%, ${Math.floor(position / 8) * 12.5}%, 5px)`;
    piece.addEventListener('click', (e) => selectPiece(piece, e));
    board.appendChild(piece);
    return piece;
}

function selectPiece(piece, event) {
    event.stopPropagation();
    if (piece.dataset.color !== currentTurn) return;

    if (selectedPiece) {
        selectedPiece.style.boxShadow = '';
        clearValidMoves();
    }
    selectedPiece = piece;
    piece.style.boxShadow = '0 0 10px #fff';
    showValidMoves(piece);
}

function showValidMoves(piece) {
    const position = getPosition(piece);
    const validMoves = getValidMoves(piece, position);
    validMoves.forEach(move => {
        const square = board.children[move];
        square.classList.add('validMove');
    });
}

function clearValidMoves() {
    document.querySelectorAll('.validMove').forEach(square => {
        square.classList.remove('validMove');
    });
}

function getPosition(piece) {
    const transform = piece.style.transform;
    const x = parseInt(transform.split('(')[1].split('%')[0]) / 12.5;
    const y = parseInt(transform.split(',')[1].split('%')[0]) / 12.5;
    return y * 8 + x;
}

function getValidMoves(piece, position) {
    // This is a simplified version. You should implement proper chess rules here.
    const validMoves = [];
    for (let i = 0; i < 64; i++) {
        if (i !== position) validMoves.push(i);
    }
    return validMoves;
}

function handleSquareClick(position) {
    if (selectedPiece) {
        movePiece(selectedPiece, position);
    }
}

function movePiece(piece, position) {
    const oldPosition = getPosition(piece);
    const capturedPiece = board.querySelector(`.piece[style*="translate3d(${(position % 8) * 12.5}%, ${Math.floor(position / 8) * 12.5}%"]`);
    
    if (capturedPiece) {
        capturePiece(capturedPiece);
    }

    piece.style.transform = `translate3d(${(position % 8) * 12.5}%, ${Math.floor(position / 8) * 12.5}%, 5px)`;
    selectedPiece.style.boxShadow = '';
    selectedPiece = null;
    clearValidMoves();

    addMoveToHistory(piece.textContent, oldPosition, position);
    switchTurn();
    checkForCheck();
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

document.getElementById('undoMove').addEventListener('click', () => {
    if (moveHistory.length > 0) {
        const lastMove = moveHistory.pop();
        const piece = board.querySelector(`.piece[style*="translate3d(${(lastMove.to % 8) * 12.5}%, ${Math.floor(lastMove.to / 8) * 12.5}%"]`);
        piece.style.transform = `translate3d(${(lastMove.from % 8) * 12.5}%, ${Math.floor(lastMove.from / 8) * 12.5}%, 5px)`;
        movesList.removeChild(movesList.lastChild);
        switchTurn();
    }
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

