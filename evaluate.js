// piece tables for Xiangqi are from:
// Li, Cuanqi
// 2008   "Using AdaBoost to Implement Chinese Chess Evaluation Functions", UCLA thesis

var soldierTable = [
    0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0,  0,  0,  0,  0,  0,  0,  0,
    0,  0, -2,  0,  4,  0, -2,  0,  0,
    2,  0,  8,  0,  8,  0,  8,  0,  2,
    6,  12, 18, 18, 20, 18, 18, 12, 6,
    10, 20, 30, 34, 40, 34, 30, 20, 10,
    14, 26, 42, 60, 80, 60, 42, 26, 14,
    18, 36, 56, 80, 120, 80, 56, 36, 18,
    0,  3,  6,  9,  12,  9,  6,  3,  0
];

var horseTable = [
    0, -4, 0, 0, 0, 0, 0, -4, 0,
    0, 2, 4, 4, -2, 4, 4, 2, 0,
    4, 2, 8, 8, 4, 8, 8, 2, 4,
    2, 6, 8, 6, 10, 6, 8, 6, 2,
    4, 12, 16, 14, 12, 14, 16, 12, 4,
    6, 16, 14, 18, 16, 18, 14, 16, 6,
    8, 24, 18, 24, 20, 24, 18, 24, 8,
    12, 14, 16, 20, 18, 20, 16, 14, 12,
    4, 10, 28, 16, 8, 16, 28, 10, 4,
    4, 8, 16, 12, 4, 12, 16, 8, 4
];

var chariotTable = [
    -2, 10, 6, 14, 12, 14, 6, 10, -2,
    8, 4, 8, 16, 8, 16, 8, 4, 8,
    4, 8, 6, 14, 12, 14, 6, 8, 4,
    6, 10, 8, 14, 14, 14, 8, 10, 6,
    12, 16, 14, 20, 20, 20, 14, 16, 12,
    12, 14, 12, 18, 18, 18, 12, 14, 12,
    12, 18, 16, 22, 22, 22, 16, 18, 12,
    12, 12, 12, 18, 18, 18, 12, 12, 12,
    16, 20, 18, 24, 26, 24, 18, 20, 16,
    14, 14, 12, 18, 16, 18, 12, 14, 14
]

var cannonTable = [
    0, 0, 2, 6, 6, 6, 2, 0, 0,
    0, 2, 4, 6, 6, 6, 4, 2, 0,
    4, 0, 8, 6, 10, 6, 8, 0, 4,
    0, 0, 0, 2, 4, 2, 0, 0, 0,
    -2, 0, 4, 2, 6, 2, 4, 0, -2,
    0, 0, 0, 2, 8, 2, 0, 0, 0,
    0, 0, -2, 4, 10, 4, -2, 0, 0,
    2, 2, 0, -10, -8, -10, 0, 2, 2,
    2, 2, 0, -4, -14, -4, 0, 2, 2,
    6, 4, 0, -10, -12, -10, 0, 4, 6 
]
    
    
function evalPosition() {
    
    var score = scoreMaterial();
    var piece;
    
    var square = 0;
    for (square = 0; square < NUM_SPACES; square++) {
        
        piece = GameBoard.pieces[square];
        
        if (piece) {
            
            //switch statement?
            switch(piece) {
                case PIECES.rH:
                    score += horseTable[square];
                    break;
                case PIECES.rR:
                    score += chariotTable[square];
                    break;
                case PIECES.rC:
                    score += cannonTable[square];
                    break;
                case PIECES.rS:
                    score += soldierTable[square];
                    break;
                case PIECES.bH:
                    score -= horseTable[MIRROR_BOARD[square]];
                    break;
                case PIECES.bR:
                    score -= chariotTable[MIRROR_BOARD[square]];
                    break;
                case PIECES.bC:
                    score -= cannonTable[MIRROR_BOARD[square]];
                    break;
                case PIECES.bS:
                    score -= soldierTable[MIRROR_BOARD[square]];
                    break;
            }
        }
    }
    
    return score;
}