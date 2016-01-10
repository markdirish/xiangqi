function buildMove(from, to, captured) {
    return (from | (to << 7) | (captured << 14));
}

function moveGetFrom(move) {
    return move & 0x7F;
}

function moveGetTo(move) {
    return (move >> 7) & 0x7F;
}

function moveGetCaptured(move) {
    return (move >> 14) & 0xF;
}

function generateMoves() {
    
    var moves = new Array();
    
    for (var i = 0; i < NUM_SPACES; i++) {
        if (Math.floor((GameBoard.pieces[i] - 1) / 7) == GameBoard.turn) {
            moves = moves.concat(getMoves(i));
        }
    }
    
    return moves;
}