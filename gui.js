function buildBoardGUI() {
	
	var div_string;
	var square;
	
	for (var rank = RANKS.RANK_10; rank >= RANKS.RANK_1; rank--) {
		for (var file = FILES.FILE_I; file >= FILES.FILE_A; file--) {
			
			square = (rank * RANK_SIZE) + file;
			div_string = "<div id=\"" + square + "\" class=\"board_space";
			
			if (GameBoard.pieces[square]) {
				div_string += " occupied\"><img src=\"" + REV_PIECES[GameBoard.pieces[square]] + ".svg\" />";
			}
			else {
				div_string += "\">"
			}
			
			div_string += "</div>";
			
			var board = document.getElementById('board');
			board.innerHTML = board.innerHTML + div_string;
		}
	}
	
	for (var rank = RANKS.RANK_10; rank >= RANKS.RANK_1; rank--) {
		for (var file = FILES.FILE_I; file >= FILES.FILE_A; file--) {
			
			square = (rank * RANK_SIZE) + file;
			
			document.getElementById(String(square)).addEventListener("click", function() { selectPieceGUI(this.id)} );
		}
	}
	
    setInterval(function() {
        if (GameBoard.turn) {
            makeCompMoveGUI();
        }
    }, 1000);
    
    // start the clock
	// startGame();
}

function getPieceCharGUI(square) {
	return PIECE_CHARS[GameBoard.pieces[square]];
}

function getChineseNotationGUI(prevSquare, newSquare, color) {
	var piece = getPieceCharGUI(newSquare);
	var prevRank = getRank(prevSquare) + 1;
	var prevFile = getFile(prevSquare) + 1;
	var newRank = getRank(newSquare) + 1;
	var newFile = getFile(newSquare) + 1;
	
	return piece + " (" + prevRank + prevFile + ")–" + newRank + newFile;
}

function selectPieceGUI(id) {
	
	var element = document.getElementById(id);
	var classes = element.classList;
	
    // if the div selected is a valid move
	if (classes.contains("valid_move")) {
        
		var selected = document.getElementsByClassName("selected");
		var piece_captured = move(parseInt(selected[0].id), parseInt(id));
		if (piece_captured) {
			var captured_id = COLOR_NAMES[GameBoard.turn ^ 1] + "_captured";
			var captured = document.getElementById(captured_id);
			captured.innerHTML += "<img src=\"" + REV_PIECES[piece_captured] + ".svg\" width=\"32px\" height=\"32px\" />";
		}
		
		
		var record = document.getElementById("record");
		if (!GameBoard.turn) {
			record.innerHTML += "<tr><td>" + GameBoard.move + ".</td>";
		}
		record.innerHTML += "<td>" + getChineseNotationGUI(parseInt(selected[0].id), parseInt(id)) + "</td>";
		if (GameBoard.turn) {
			GameBoard.move++;
			record.innerHTML += "</tr>";
		}
		
		
		element.innerHTML = selected[0].innerHTML;
		element.className += " occupied";
		selected[0].innerHTML = "";
		selected[0].classList.remove("occupied");
        
        GameBoard.turn = GameBoard.turn ^ 1;
		//clockRunning(GameBoard.turn);
          
        if (isMated(GameBoard.turn)) {
            record.innerHTML = COLOR_NAMES[(GameBoard.turn ^ 1)] + " WINS";
        }
        
        clearSelectedGUI();
        clearMovesGUI();
        
        var loading = document.getElementById("black_clock");
        loading.innerHTML = "<img src=\"loading.gif\" />";
        //setTimeout(makeCompMoveGUI(), 2000);
	}
	
	else if (Math.floor((GameBoard.pieces[parseInt(id)] - 1) / 7) == GameBoard.turn) {

        clearSelectedGUI();
        clearMovesGUI();
        
		element.classList.add("selected");
		getMovesGUI(id);
	}
    
}

function makeCompMoveGUI() {
    
    var move = minMax(2);
    var from = moveGetFrom(move);
    var to = moveGetTo(move);
    var captured = moveGetCaptured(move);
    
    var fromSquare = document.getElementById(String(from));
    var toSquare = document.getElementById(String(to));
    
    
    toSquare.innerHTML = fromSquare.innerHTML;
	toSquare.className += " occupied";
	fromSquare.innerHTML = "";
	fromSquare.classList.remove("occupied");
    
    var piece_captured = makeMove(move);
    
    var record = document.getElementById("record");
		record.innerHTML += "<td> " + getChineseNotationGUI(moveGetFrom(move), moveGetTo(move)) + "</td>";
		if (!GameBoard.turn) {
			GameBoard.move++;
			record.innerHTML += "</tr><br />";
		}
    
	if (piece_captured) {
		var captured_id = COLOR_NAMES[GameBoard.turn] + "_captured";
		var cap = document.getElementById(captured_id);
		cap.innerHTML += "<img src=\"" + REV_PIECES[piece_captured] + ".svg\" width=\"32px\" height=\"32px\" />";
	  }
      
      var loading = document.getElementById("black_clock");
      loading.innerHTML = "";
}

function clearMovesGUI() {
	var old_valid_moves = document.getElementsByClassName("valid_move");
	for (var j = 0; j < old_valid_moves.length; ) {
		old_valid_moves[j].classList.remove("valid_move");
	}
}

function clearSelectedGUI() {
	var old_selected = document.getElementsByClassName("selected");
	for (var i = 0; i < old_selected.length; ) {
		old_selected[i].classList.remove("selected");
	}
}

function getMovesGUI(id) {
	
	clearMovesGUI();
	
	if (GameBoard.pieces[parseInt(id)]) {
		var moves = getMoves(parseInt(id));
		for (var i = 0; i < moves.length; i++) {
			document.getElementById(String(moveGetTo(moves[i]))).className += " valid_move";
		}
	}
}

// move some of this that isn't just part of the gui. Maybe split so some is GUI and some isnt.
var redTime;
var redClock;
var blackTime;
var blackClock;

function startGame() {
    
    redTime = 15 * 60;
    blackTime = 15 * 60;
    
    redClock = document.getElementById("red_clock");
    blackClock = document.getElementById("black_clock");

    redClock.innerHTML = redTime / 60 + ":" + padSeconds(redTime % 60);
    blackClock.innerHTML = blackTime / 60 + ":" + padSeconds(blackTime % 60);
    
    clockRunning(GameBoard.turn);
}

function clockRunning(turn) {
    
    var runningTime;
    var runningClock;
    
    if (!turn) {
        runningClock = redClock;
        runningTime = redTime;
    }
    else {
        runningClock = blackClock;
        runningTime = blackTime;
    }
    
    var time = new Date();
    
    var interval = setInterval(function() {
        
        if (runningTime <= 0 || GameBoard.turn != turn) {
            clearInterval(interval);
            return;
        }
        var ctime = new Date();
        var timegone = (ctime.getTime() - time.getTime()) / 1000;
        time = ctime;
        runningTime -= timegone;
        var displayTime = Math.ceil(runningTime);
        if (!turn) {
            redTime = runningTime;
        }
        else {
            blackTime = runningTime;
        }
        runningClock.innerHTML = Math.floor(displayTime / 60) + ":" + padSeconds(displayTime % 60);
    }, 10);
}

function switchTime() {
    clockRunning(GameBoard.turn);
}

// takes a number and returns it as two digits
function padSeconds(n) {
    n = Math.floor(n);
    return (n < 10) ? ("0" + n) : n;
}