var GameBoard = {};

GameBoard.pieces = new Array(NUM_SPACES).fill(0);
GameBoard.turn = COLORS.RED;
GameBoard.move = 1;

GameBoard.kingSquare = KING_SQUARE.slice();

GameBoard.winner;

GameBoard.history = [];
GameBoard.posKey = 0;

GameBoard.hisPly = 0; // maintains count for all moves made in the game from the start
GameBoard.ply = 0; // number of half moves made in the search tree, used for generating moves

GameBoard.pieceCount = PIECE_COUNT.slice(); // keeps track of how many of each type of piece is on the board, indexed by piece
GameBoard.pieceList = PIECE_LIST.slice(); // keeps track of the location of every piece on each side (no promotions in xiangqi)

// generate the score differential of piece material on the board
// a lower score is preferential for black, a higher score is preferential for red
function scoreMaterial() {
	var square;
	var piece;
	var score = 0;
	
	for( square = 0; square < NUM_SPACES; square++) {
		piece = GameBoard.pieces[square];
		if (piece) {
			score += PIECE_VALUES[piece];
		}
	}
    
    return score;
}

function setUp() {
	
	// RED
	// back file
	GameBoard.pieces[0] = PIECES.rR;
	GameBoard.pieces[1] = PIECES.rH;
	GameBoard.pieces[2] = PIECES.rE;
	GameBoard.pieces[3] = PIECES.rA;
	GameBoard.pieces[4] = PIECES.rG;
	GameBoard.pieces[5] = PIECES.rA;
	GameBoard.pieces[6] = PIECES.rE;
	GameBoard.pieces[7] = PIECES.rH;
	GameBoard.pieces[8] = PIECES.rR;
	// cannon
	GameBoard.pieces[19] = PIECES.rC;
	GameBoard.pieces[25] = PIECES.rC;
	// soldiers
	GameBoard.pieces[27] = PIECES.rS;
	GameBoard.pieces[29] = PIECES.rS;
	GameBoard.pieces[31] = PIECES.rS;
	GameBoard.pieces[33] = PIECES.rS;
	GameBoard.pieces[35] = PIECES.rS;
	
	// BLACK
	// back file
	GameBoard.pieces[81] = PIECES.bR;
	GameBoard.pieces[82] = PIECES.bH;
	GameBoard.pieces[83] = PIECES.bE;
	GameBoard.pieces[84] = PIECES.bA;
	GameBoard.pieces[85] = PIECES.bG;
	GameBoard.pieces[86] = PIECES.bA;
	GameBoard.pieces[87] = PIECES.bE;
	GameBoard.pieces[88] = PIECES.bH;
	GameBoard.pieces[89] = PIECES.bR;
	// cannon
	GameBoard.pieces[64] = PIECES.bC;
	GameBoard.pieces[70] = PIECES.bC;
	// soldiers
	GameBoard.pieces[54] = PIECES.bS;
	GameBoard.pieces[56] = PIECES.bS;
	GameBoard.pieces[58] = PIECES.bS;
	GameBoard.pieces[60] = PIECES.bS;
	GameBoard.pieces[62] = PIECES.bS;

}

function getSquare(rank, file) {
	return (rank * RANK_SIZE) + file;
}

function getRank(square) {
	return Math.floor((square / RANK_SIZE));
}

function getFile(square) {
	return (square % RANK_SIZE);
}

function getPiece(pos) {
	return GameBoard.pieces[pos];
}

function setPiece(pos, piece) {
    GameBoard.pieces[pos] = piece;
}

function onBoard(square) {
	if (square < NUM_SPACES && square >= 0) {
		return true;
	}
	else {
		return false;
	}
}

function inPalace(square) {

	if ((getRank(square) <= RANKS.RANK_3 || getRank(square) >= RANKS.RANK_8) &&
		getFile(square) >= FILES.FILE_D && getFile(square) <= FILES.FILE_F) {	
		return true;
	}
	else {
		return false;
	}	
}

function printBoard() {
	
    console.log("");
    console.log("PRINTING BOARD");
    console.log("");
    
	for (var i = (FILE_SIZE - 1); i >= 0; i--) {
        var rank = " ";
		for (var j = 0; j < 9; j++) {
			rank += " " + getPiece((i*RANK_SIZE) + j);
		}
        console.log("File " + i + rank);
	}
}

function move(source, destination) {
	
	var captured_piece = getPiece(destination);
	
	var piece = getPiece(source);
           
    setPiece(source, PIECES.EMPTY);
    setPiece(destination, piece);
            
    // if the piece was a king, update the king positions
    if (getPiece(destination) % 7 == 1) {
        var color = Math.floor(getPiece(destination) / 7);
        KING_SQUARE[color] = destination;
    }
	
	return captured_piece;
}

function makeMove(mv) {
    
    var from = moveGetFrom(mv);
    var to = moveGetTo(mv);
    
    var captured = move(from, to);
    
    GameBoard.history[GameBoard.hisPly] = mv;
    
    GameBoard.hisPly++;
    
    GameBoard.turn ^= 1;
    
    return captured;
}

function takeMove() {
    
    GameBoard.hisPly--;
    var mv = GameBoard.history[GameBoard.hisPly];
    
    var from = moveGetFrom(mv);
    var to = moveGetTo(mv);
    var captured = moveGetCaptured(mv);
    
    GameBoard.turn ^= 1;
    
    move(to, from);
    
    if (captured) {
        GameBoard.pieces[to] = captured;
    }
}

function getMoves(square, attack) {
    
    if (attack === undefined) {
        attack = 0;
    }
	
	var piece = getPiece(square);
	
	if (piece != PIECES.EMPTY) {
		var color;
		if (piece >= PIECES.bG) {
			color = COLORS.BLACK;
		}
		else {
			color = COLORS.RED;
		}
        
        var moves = [];
		
		switch(piece) {
			case PIECES.rG:
			case PIECES.bG:
				moves = generalMoves(square, color);
				break;
			case PIECES.rA:
			case PIECES.bA:
				moves = advisorMoves(square, color);
				break;
			case PIECES.rE:
			case PIECES.bE:
				moves = elephantMoves(square, color);
				break;
			case PIECES.rH:
			case PIECES.bH:
				moves = horseMoves(square, color);
				break;
			case PIECES.rR:
			case PIECES.bR:
				moves = chariotMoves(square, color);
				break;
			case PIECES.rC:
			case PIECES.bC:
				moves = cannonMoves(square, color, attack);
				break;
			case PIECES.rS:
			case PIECES.bS:
				moves = soldierMoves(square, color);
				break;
		}
        
        moves = filterCheckMoves(moves, color);
        return moves;
	}
}

// takes an array of pseudo legal moves and eliminate those that place your king in check
function filterCheckMoves(moves, color) {
    
    var legal_moves = new Array();
    var temp = [];
    
    for (var i = 0; i < moves.length; i++) {
        
        temp = GameBoard.pieces.slice();
        var king = KING_SQUARE[color];
        
        move(moveGetFrom(moves[i]), moveGetTo(moves[i]));
        
        if (!squareAttacked(KING_SQUARE[color], (color^1))) {
            legal_moves.push(moves[i]);
        }
        
        KING_SQUARE[color] = king;
        GameBoard.pieces = temp.slice();
    }
    
    return legal_moves;
}

function isMated(color) {
    
    var moves = [];
    
    for (var i = 0; i < NUM_SPACES; i++) {
        if (Math.floor((GameBoard.pieces[i] - 1) / 7) == color) {
            moves = moves.concat(getMoves(i));
        }
        if (moves.length != 0) {
            return false;
        }
    }
    
    return true;
}

function generalMoves(square, color) {
	
	var moves = new Array(0);
	
	for (var i = 0; i < POS_NEG.length; i++) {
		
		var to = square + POS_NEG[i];
		
		if ((onBoard(to)) &&
			(inPalace(to)) &&
			((GameBoard.pieces[to] == PIECES.EMPTY) || ((GameBoard.pieces[to] >= PIECES.bG) != color))) {


			moves.push(buildMove(square, to, GameBoard.pieces[to]));
		}
			
		to = square + (POS_NEG[i] * RANK_SIZE);
			
		if ((onBoard(to)) &&
			(inPalace(to)) &&
			((GameBoard.pieces[to] == PIECES.EMPTY) || ((GameBoard.pieces[to] >= PIECES.bG) != color))) {

			moves.push(buildMove(square, to, GameBoard.pieces[to]));
		}
	}
    
	return moves;
}

function advisorMoves(square, color) {
	
	var moves = new Array(0);
	
	for (var i = 0; i < POS_NEG.length; i++) {
		for (var j = 0; j < POS_NEG.length; j++) {
			var to = square + (POS_NEG[i] * RANK_SIZE) + POS_NEG[j];

			if ((onBoard(to)) &&
				(inPalace(to)) &&
				((GameBoard.pieces[to] == PIECES.EMPTY) || ((GameBoard.pieces[to] >= PIECES.bG) != color))) {
				
				moves.push(buildMove(square, to, GameBoard.pieces[to]));
			}
		}
	}
    
	return moves;
}

function elephantMoves(square, color) {
	
	var moves = new Array(0);
	
	for (var i = 0; i < POS_NEG.length; i++) {
		for (var j = 0; j < POS_NEG.length; j++) {
			
			var to = square + (POS_NEG[i] * (RANK_SIZE * 2)) + (POS_NEG[j] * 2);

			if ((onBoard(to)) &&
				(to < (NUM_SPACES/2) != color) &&
				(Math.abs(getFile(to) - getFile(square)) == 2) &&
				(GameBoard.pieces[(to + square)/2] == PIECES.EMPTY) &&
				((GameBoard.pieces[to] == PIECES.EMPTY) || ((GameBoard.pieces[to] >= PIECES.bG) != color))) {
					
				moves.push(buildMove(square, to, GameBoard.pieces[to]));
			}
		}
	}
    
	return moves;
}

function horseMoves(square, color) {
	
	var moves = new Array(0);
	
	for (var i = 0; i < POS_NEG.length; i++) {
		for (var j = 0; j < POS_NEG.length; j++) {
			
			var to = square + (POS_NEG[i] * (RANK_SIZE * 2)) + POS_NEG[j];

			if ((onBoard(to)) &&
				(Math.abs(getFile(to) - getFile(square)) == 1) &&
				(GameBoard.pieces[square + (POS_NEG[i] * RANK_SIZE)] == PIECES.EMPTY) &&
				((GameBoard.pieces[to] == PIECES.EMPTY) || ((GameBoard.pieces[to] >= PIECES.bG) != color))) {
				
				moves.push(buildMove(square, to, GameBoard.pieces[to]));
			}
			
			to = square + (POS_NEG[i] * 2) + (POS_NEG[j] * RANK_SIZE);
			
			if ((onBoard(to)) &&
				(Math.abs(getFile(to) - getFile(square)) == 2) &&
				(GameBoard.pieces[(square + (POS_NEG[i]))] == PIECES.EMPTY) &&
				((GameBoard.pieces[to] == PIECES.EMPTY) || ((GameBoard.pieces[to] >= PIECES.bG) != color))) {
				
				moves.push(buildMove(square, to, GameBoard.pieces[to]));
			}
		}
	}
    
	return moves;
}

function chariotMoves(square, color) {
	
	var moves = new Array(0);
	
	for (var i = 0; i < POS_NEG.length; i++) {
		
		var to;
		
		for (var j = 1; j < RANK_SIZE; j++) {
			to = square + (POS_NEG[i] * j);
			if ((onBoard(to)) &&
				(getRank(square) == getRank(to)) &&
                ((GameBoard.pieces[to] == PIECES.EMPTY) || ((GameBoard.pieces[to] >= PIECES.bG) != color))) {
                
                moves.push(buildMove(square, to, GameBoard.pieces[to]));
                
                if (GameBoard.pieces[to] != PIECES.EMPTY) {
                    break;
                }
				
			}
			else {
				break;
			}
		}
		
		for (j = 1; j < FILE_SIZE; j++) {
			to = square + (POS_NEG[i] * (RANK_SIZE * j));
			if ((onBoard(to)) &&
				((GameBoard.pieces[to] == PIECES.EMPTY) || ((GameBoard.pieces[to] >= PIECES.bG) != color))) {
				
				moves.push(buildMove(square, to, GameBoard.pieces[to]));
                
                if (GameBoard.pieces[to] != PIECES.EMPTY) {
                    break;
                }
			}
			else {
				break;
			}
		}
	}
    
	return moves;
}

function cannonMoves(square, color, attack) {
    
    if (attack === undefined) {
        attack = 0;
    }
	
	var moves = new Array(0);
	
	for (var i = 0; i < POS_NEG.length; i++) {
        
		var to;
		var jumped = 0;
		
		for (var j = 1; j < RANK_SIZE; j++) {
			
			to = square + (POS_NEG[i] * j);
			
			if ((onBoard(to)) &&
				(getRank(square) == getRank(to))) {
					
				if (!jumped && (GameBoard.pieces[to] == PIECES.EMPTY)) {
                    if (attack == 0) {
                        moves.push(buildMove(square, to, GameBoard.pieces[to]));
                    }
				}
				else if (!jumped && (GameBoard.pieces[to] != PIECES.EMPTY)) {
					jumped = 1;
				}
				else if ((GameBoard.pieces[to] != PIECES.EMPTY) && jumped && ((GameBoard.pieces[to] >= PIECES.bG) != color)) {
                    moves.push(buildMove(square, to, GameBoard.pieces[to]));
					break;
				}
                
			}
			else {
				break;
			}
		}
		
		jumped = 0;
		
		for (j = 1; j < FILE_SIZE; j++) {
			
			to = square + (POS_NEG[i] * (RANK_SIZE * j));
			
			if (onBoard(to)) {
                
				if (!jumped && (GameBoard.pieces[to] == PIECES.EMPTY)) {
                    if (attack == 0) {
                        moves.push(buildMove(square, to, GameBoard.pieces[to]));
                    }
				}
				else if (!jumped && (GameBoard.pieces[to] != PIECES.EMPTY)) {
					jumped = 1;
				}
				else if ((GameBoard.pieces[to] != PIECES.EMPTY) && jumped && ((GameBoard.pieces[to] >= PIECES.bG) != color)) {
                    moves.push(buildMove(square, to, GameBoard.pieces[to]));
					break;
				}
			}
			else {
				break;
			}
		}
	}
    
	return moves;
}

function soldierMoves(square, color) {
	
	var moves = new Array(0);
	
	var to = square + (RANK_SIZE - (color * RANK_SIZE * 2));
	
	if (onBoard(to)) {
		moves.push(buildMove(square, to, GameBoard.pieces[to]));
	}
	
	if (square < (NUM_SPACES/2) == color) {
		for (var i = 0; i < POS_NEG.length; i++) {
			
			to = square + (POS_NEG[i]);
			
			if ((onBoard(to)) &&
				(getRank(square) == getRank(to)) &&
				((GameBoard.pieces[to] == PIECES.EMPTY) || ((GameBoard.pieces[to] >= PIECES.bG) != color))) {

				moves.push(buildMove(square, to, GameBoard.pieces[to]));
			}
		}
	}
    
	return moves;
}

function squareAttacked(square, color) {
    
    var attacking;
    
    // GENERAL
    for (var i = 0; i < POS_NEG.length; i++) {
        
        attacking = square + POS_NEG[i];
        if (inPalace(attacking) && GameBoard.pieces[attacking] == (color * 7 + 1)) {
            return true;
        }
        
        attacking = square + (POS_NEG[i] * RANK_SIZE);
        if (inPalace(attacking) && GameBoard.pieces[attacking] == (color * 7 + 1)) {
            return true;
        }
    }
    
    // ADVISOR
    for (var i = 0; i < POS_NEG.length; i++) {
		for (var j = 0; j < POS_NEG.length; j++) {
			attacking = square + (POS_NEG[i] * RANK_SIZE) + POS_NEG[j];

			if ((onBoard(attacking)) &&
				(inPalace(attacking)) &&
				((GameBoard.pieces[attacking] == (color * 7 + 2)))) {
				
                return true;
			}
		}
	}
    
    // ELEPHANT
    // if the square is on the wrong side of the river, an elephant can't attack it
    if (square < (NUM_SPACES/2) != color) {
        for (var i = 0; i < POS_NEG.length; i++) {
            for (var j = 0; j < POS_NEG.length; j++) {
                attacking = square + (POS_NEG[i] * (RANK_SIZE * 2)) + (POS_NEG[j] * 2);
                if (onBoard(attacking) &&
                   (GameBoard.pieces[attacking] == (color * 7 + 3)) &&
                   (Math.abs(getFile(attacking) - getFile(square)) == 2) &&
				   (GameBoard.pieces[(attacking+square)/2] == PIECES.EMPTY)) {
                       return true;
                }
            }
        }
    }
    
    // HORSE
	for (var i = 0; i < POS_NEG.length; i++) {
		for (var j = 0; j < POS_NEG.length; j++) {
			
			attacking = square + (POS_NEG[i] * (RANK_SIZE * 2)) + POS_NEG[j];

			if ((onBoard(attacking)) &&
				(Math.abs(getFile(attacking) - getFile(square)) == 1) &&
				(GameBoard.pieces[square + (POS_NEG[i] * RANK_SIZE)] == PIECES.EMPTY) &&
				((GameBoard.pieces[attacking] == (color * 7 +4)))) {
				
                return true;
			}
			
			attacking = square + (POS_NEG[i] * 2) + (POS_NEG[j] * RANK_SIZE);
			
			if ((onBoard(attacking)) &&
				(Math.abs(getFile(attacking) - getFile(square)) == 2) &&
				(GameBoard.pieces[(square + (POS_NEG[i]))] == PIECES.EMPTY) &&
				((GameBoard.pieces[attacking] == (color * 7 + 4)))) {
				
				return true;
			}
		}
	}
    
    // CHARIOT
    for (var i = 0; i < POS_NEG.length; i++) {
        
        // iterating across the rank
        for (var j = 1; j < RANK_SIZE; j++) {
            attacking = square + (POS_NEG[i] * j);
            if (onBoard(attacking) && getRank(square) == getRank(attacking)) {
                    if (GameBoard.pieces[attacking] == (color * 7 + 5)) {
                        return true;
                    }
                    else if (GameBoard.pieces[attacking] != PIECES.EMPTY) {
                        break;
                    }
            }
            else {
                break;
            }
        }
        
        // iterating up and down the file
        for (j = 1; j < RANK_SIZE; j++) {
            attacking = square + (POS_NEG[i] * (RANK_SIZE * j));
            if (onBoard(attacking)) {
                if (GameBoard.pieces[attacking] == (color * 7 + 5)) {
                    return true;
                }
                else if (GameBoard.pieces[attacking] != PIECES.EMPTY) {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
    
    // CANNON
    for (var i = 0; i < POS_NEG.length; i++) {
        
        var jumped = 0;
        // iterating across the rank
        for (var j = 1; j < RANK_SIZE; j++) {
            attacking = square + (POS_NEG[i] * j);
            if (onBoard(attacking) && getRank(square) == getRank(attacking)) {
                    if (GameBoard.pieces[attacking] == (color * 7 + 6) && jumped) {
                        return true;
                    }
                    else if (GameBoard.pieces[attacking] != PIECES.EMPTY && !jumped) {
                        jumped = 1;
                    }
                    else if (GameBoard.pieces[attacking] != PIECES.EMPTY && jumped) {
                        break;
                    }
            }
            else {
                break;
            }
        }
        
        jumped = 0;
        // iterating up and down the file
        for (j = 1; j < RANK_SIZE; j++) {
            attacking = square + (POS_NEG[i] * (RANK_SIZE * j));
            if (onBoard(attacking)) {
                if ((GameBoard.pieces[attacking] == (color * 7 + 6)) && jumped) {
                    return true;
                }
                else if (GameBoard.pieces[attacking] != PIECES.EMPTY && !jumped) {
                    jumped = 1;
                }
                else if (GameBoard.pieces[attacking] != PIECES.EMPTY && jumped) {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
    
    // SOLDIERS
    // check if the square is being attacked by soldier of color
    attacking = square - (RANK_SIZE - (color * RANK_SIZE * 2));
    
    if (onBoard(attacking) && (GameBoard.pieces[attacking] == ((color * 7) + 7))) {
        return true;
    }
    
    // if the square is across the river from the color's starting side
    if (square < (NUM_SPACES/2) == color) {
        attacking = (square - 1);
        if (onBoard(attacking) && (getRank(square) == getRank(attacking)) && GameBoard.pieces[attacking] == ((color * 7) + 7)) {
            return true;
        }
        attacking = square + 1;
        if (onBoard(attacking) && (getRank(square) == getRank(attacking)) && GameBoard.pieces[attacking] == ((color * 7) + 7)) {
            return true;
        }
    }
    
    return false;
}

function printAttacks(color) {
    
    console.log("");
    console.log("PRINTING ATTACKS");
    console.log("");
    
    var rank = "rank 9: ";
    
    for (var i = (FILE_SIZE - 1); i >= 0; i--) {
        for (var j = 0; j < RANK_SIZE; j++) {
            var square = (i*RANK_SIZE) + j;
            var attacked = squareAttacked(square, color);
            if (attacked) {
                rank += "X ";
            }
            else {
                rank += "0 ";
            }
        }
        console.log(rank);
        rank = "rank " + (i - 1) + ": ";
    }
}