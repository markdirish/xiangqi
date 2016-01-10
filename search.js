function minMax(depth) {
    
    var bestMove;
    
    // if red, best is -INFINTE
    // if black, best is INFINITE
    var bestScore = -INFINITE * (GameBoard.turn * -1);
    var posScore;
    var moves = generateMoves();
    
    for (var i = 0; i < moves.length; i++) {
        
        makeMove(moves[i]);
        
        posScore = searchScores(depth);
        
        //posScore = evalPosition();
        
        if (!GameBoard.turn && posScore < bestScore || GameBoard.turn && posScore > bestScore) {
        //if (posScore < bestScore) {
            bestScore = posScore;
            bestMove = moves[i];
        }
        
        takeMove();
    }
    
    return bestMove;
}

function searchScores(depth) {
    var bestScore = -INFINITE * (GameBoard.turn * -1);
    var posScore;
    var moves = generateMoves();
    
    for (var i = 0; i < moves.length; i++) {
        makeMove(moves[i]);
        if (depth > 0) {
            posScore = searchScores(depth-1);
        }
        else {
            posScore = evalPosition();
        }
        
        if (!GameBoard.turn && posScore < bestScore || GameBoard.turn && posScore > bestScore) {
            bestScore = posScore;
        }
        
        takeMove();
    }
    
    return bestScore;
}