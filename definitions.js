var NUM_PIECES = 15;
var PIECES_PER_SIDE = 16;
var PIECES = { EMPTY : 0,
			         rG : 1, rA : 2, rE : 3, rH : 4, rR : 5, rC : 6, rS : 7,
			         bG : 8, bA : 9, bE : 10, bH : 11, bR : 12, bC : 13, bS : 14 };
var PIECE_COUNT = [0, 1, 2, 2, 2, 2, 2, 5, 1, 2, 2, 2, 2, 2, 5];
var PIECE_LIST_INDEX = [0, 0, 1, 3, 5, 7, 9, 11, 16, 17, 19, 21, 23, 25, 27];
var PIECE_LIST = [4, 3, 5, 2, 6, 1, 7, 0, 8, 19, 25, 27, 29, 31, 33, 35,
                  85, 84, 86, 83, 87, 82, 88, 81, 89, 64, 70, 54, 56, 58, 60, 62];

var REV_PIECES = [0, "rG", "rA", "rE", "rH", "rR", "rC", "rS", "bG", "bA", "bE", "bH", "bR", "bC", "bS"];
var PIECE_CHARS = [ 0,
						        "帥", "仕", "相", "傌", "俥", "炮", "兵",
						        "將", "士", "象", "馬", "車", "砲", "卒" ];
// piece values for evlauating positions/moves
// source: Yen et al. 2004, "Computer Chinese Chess" ICGA Journal
var PIECE_VALUES = [0, 6000, 120, 120, 270, 600, 285, 30, -6000, -120, -120, -270, -600, -285, -30];
var NUM_SPACES = 90;
var RANK_SIZE = 9;
var FILE_SIZE = 10;
var POS_NEG = [-1, 1];
var RANKS = { RANK_1 : 0, RANK_2 : 1, RANK_3 : 2, RANK_4 : 3, RANK_5 : 4,
			  RANK_6 : 5, RANK_7 : 6, RANK_8 : 7, RANK_9 : 8, RANK_10 : 9};
var FILES = { FILE_A : 0, FILE_B : 1, FILE_C : 2, FILE_D : 3, FILE_E : 4,
              FILE_F : 5, FILE_G : 6, FILE_H : 7, FILE_I : 8 };
var COLORS = { RED : 0, BLACK : 1};
var COLOR_NAMES = ["red", "black"];
var KING_SQUARE = [4, 85];
var RED_STARTING_SQUARES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 19, 25, 27, 29, 31, 33, 35];
var BLACK_STARTING_SQUARES = [81, 82, 83, 84, 85, 86, 87, 88, 89, 64, 70, 54, 56, 58, 60, 62];

// vars for generating game moves
var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;

// infinite used for seaching
var INFINITE = Number.MAX_SAFE_INTEGER;
var MATE_VALUE = Number.MAX_SAFE_INTEGER - 1;

// parsing the move represented by an integer
function fromSquare(move) {
    return move & 0x7F;
}

function toSquare(move) {
    return move >> 7 & 0x7F;
}

function captured(move) {
    return move >> 14 & 0xF;
}

var MIRROR_BOARD = [
    89, 88, 87, 86, 85, 84, 83, 82, 81,
    80, 79, 78, 77, 76, 75, 74, 73, 72,
    71, 70, 69, 68, 67, 66, 65, 64, 63,
    62, 61, 60, 59, 58, 57, 56, 55, 54,
    53, 52, 51, 50, 49, 48, 47, 46, 45,
    44, 43, 42, 41, 40, 39, 38, 37, 36,
    35, 34, 33, 32, 31, 30, 29, 28, 27,
    26, 25, 24, 23, 22, 21, 20, 19, 18,
    17, 16, 15, 14, 13, 12, 11, 10,  9,
     8,  7,  6,  5,  4,  3,  2,  1,  0
]