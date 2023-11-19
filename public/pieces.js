pieceInfo = {
	"king": {"description": "A normal king", "price": 9},
	"queen": {"description": "A normal queen", "price": 18},
	"rook": {"description": "A normal rook", "price": 10},
	"knight": {"description": "A normal knight", "price": 6},
	"bishop": {"description": "A normal bishop", "price": 6},		
	"pawn": {"description": "Your good old pawn", "price": 2},

	"wazir": {"description": "It can move 1 step horizontally or vertically.", "price": 3},
	"nightrider": {"description": "A knight that can move any number of steps in the same direction.", "price": 10},

	"delete": {"description": "Remove a piece", "price": 0},
}

// money needed for full set: 8*2 + 9 + 18 + 2*(6+6+10) = 87
// lets give everyone 100 money.

pieceShop = document.getElementById("pieceShop");
selectedPieceName = document.getElementById("selectedPieceName");
selectedPieceDesc = document.getElementById("selectedPieceDesc");

pieceShop_selectedPieceName = "";

var money = 100;

for (var name in pieceInfo) {
	var img = document.createElement("img");
	img.pieceName = name;
	img.src = "/sprites/" + name + "/white.svg";

	img.onclick = function() {pieceShop_selectedPieceName = this.pieceName}
	img.onmouseover = function() {selectedPieceName.innerHTML = this.pieceName + " (" + pieceInfo[this.pieceName].price.toString() + "<img src=\"sprites/goldcoin.png\" style=\"width:15px;height:15px;\"> )"; selectedPieceDesc.innerHTML = pieceInfo[this.pieceName].description; }
	img.onmouseout = function() {selectedPieceName.innerHTML = "Select a piece!"; selectedPieceDesc.innerHTML = "....."; }

	pieceShop.appendChild(img);
}

function updateMoneyDisplay() {
	var money_DIV = document.getElementById("money");
	money_DIV.innerHTML = money.toString();
}

class Piece {
	constructor(chessboard, x, y, isBlack, name) {
		this.chessboard = chessboard;
		this.y = y;
		this.x = x;
		this.isBlack = isBlack;
		this.chessboard.cells[this.y][this.x].piece = this;
		this.name = name;

		this.createSprite();
	}

	createSprite() {
		if (this.isBlack) {
			this.DOM = this.chessboard.cells[this.y][this.x].setSprite("/sprites/" + this.name + "/black.svg");
		} else {
			this.DOM = this.chessboard.cells[this.y][this.x].setSprite("/sprites/" + this.name + "/white.svg");
		}
		
	}

	getLegalMoves() {
		return [];
	}

	highlightLegalMoves() {
		var moves = this.getLegalMoves();
		for (var i = 0; i < moves.length; i++) {
			this.chessboard.cells[moves[i][1]][moves[i][0]].highlight(true, "magenta");
		}
	}

	canMoveTo(x, y) {
		var moves = this.getLegalMoves();

		for (var i = 0; i < moves.length; i++) {
			if (moves[i][0] == x && moves[i][1] == y) {
				return true;
			}
		}
		return false;
	}

	moveTo(x, y) {
		NW_movePiece(this.x, this.y, x, y);
	}

	onDelete() {

	}

	onHit() {

	}

	onMove(fromX, fromY, toX, toY) {

	}
}

class PKing extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "king");

		nw_player_kings[isBlack ? 1 : 0]++;
	}

	getLegalMoves() {
		var moves = [];
		for (var i = -1; i <= 1; i++) {
			for (var j = -1; j <= 1; j++) {
				if (i == 0 && j == 0) {
					continue;
				}
				var newX = this.x + i;
				var newY = this.y + j;

				if (!this.chessboard.isValidPosition(newX, newY)) {
					continue;
				}

				if (this.chessboard.cells[newY][newX].piece == null || (this.chessboard.cells[newY][newX].piece.isBlack != this.isBlack)) {
					moves.push([newX,newY]);
				}
			}
		}

		return moves;
	}

	onDelete() {
		nw_player_kings[this.isBlack ? 1 : 0]--;
	}

	onHit() {
		nw_player_kings[this.isBlack ? 1 : 0]--;

		if (nw_player_kings[this.isBlack ? 1 : 0] == 0) {
			alert(this.isBlack ? "White wins!" : "Black wins!");
			location.reload();
		}
	}
}

class PPawn extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "pawn");
		this.movedBefore = false;
	}

	getLegalMoves() {
		var moves = [];

		var newYForward = this.y + (this.isBlack ? 1 : -1);
		var newXForward = this.x;

		console.log([newYForward, newXForward])
		var canMoveForwardOnce = false;
		if (this.chessboard.isValidPosition(newYForward, newXForward) && this.chessboard.cells[newYForward][newXForward].piece == null) {
			moves.push([newXForward, newYForward]);
			canMoveForwardOnce = true;
		}

		// double move if not moved before
		if (!this.movedBefore && canMoveForwardOnce) {
			var newYForward2 = this.y + (this.isBlack ? 2 : -2);
			var newXForward2 = this.x;
			if (this.chessboard.isValidPosition(newYForward2, newXForward2) && this.chessboard.cells[newYForward2][newXForward2].piece == null) {
				moves.push([newXForward2, newYForward2]);
			}
		}

		var newYSide1 = this.y + (this.isBlack ? 1 : -1);
		var newXSide1 = this.x - 1;
		if (this.chessboard.isValidPosition(newYSide1, newXSide1) && this.chessboard.cells[newYSide1][newXSide1].piece != null && this.chessboard.cells[newYSide1][newXSide1].piece.isBlack != isStartingPlayer) {
			moves.push([newXSide1, newYSide1]);
		}

		var newYSide2 = this.y + (this.isBlack ? 1 : -1);
		var newXSide2 = this.x + 1;
		if (this.chessboard.isValidPosition(newYSide2, newXSide2) && this.chessboard.cells[newYSide2][newXSide2].piece != null && this.chessboard.cells[newYSide2][newXSide2].piece.isBlack != isStartingPlayer) {
			moves.push([newXSide2, newYSide2]);
		}

		return moves;
	}

	onMove(fx,fy,tx,ty) {
		this.movedBefore = true;

		// promote to queen
		if (this.isBlack && this.y == 7) {
			NW_spawnPiece("queen", this.x, this.y, this.isBlack);
		} else if (!this.isBlack && this.y == 0) {
			NW_spawnPiece("queen", this.x, this.y, this.isBlack);
		}
	}
}

class PRook extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "rook");
	}

	getLegalMoves() {
		var moves = [];
		var directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];

		for (var i = 0; i < directions.length; i++) {
			var dir = directions[i];

			var cx = this.x + dir[0];
			var cy = this.y + dir[1];

			while (this.chessboard.isValidPosition(cx,cy)) {
				var cell = this.chessboard.cells[cy][cx];

				if (cell.piece == null) {
					moves.push([cx,cy]);
					
					cx += dir[0];
					cy += dir[1];
					continue;
				} else if (cell.piece.isBlack != this.isBlack) {
					moves.push([cx,cy]);
					break;
				} else {
					break;
				}
			}
		}
		return moves;
	}
}

class PBishop extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "bishop");
	}

	getLegalMoves() {
		var moves = [];
		var directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

		for (var i = 0; i < directions.length; i++) {
			var dir = directions[i];

			var cx = this.x + dir[0];
			var cy = this.y + dir[1];

			while (this.chessboard.isValidPosition(cx,cy)) {
				var cell = this.chessboard.cells[cy][cx];

				if (cell.piece == null) {
					moves.push([cx,cy]);
					
					cx += dir[0];
					cy += dir[1];
					continue;
				} else if (cell.piece.isBlack != this.isBlack) {
					moves.push([cx,cy]);
					break;
				} else {
					break;
				}
			}
		}
		return moves;
	}
}


class PQueen extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "queen");
	}

	getLegalMoves() {
		var moves = [];
		var directions = [[1, 0], [0, 1], [-1, 0], [0, -1],		[1, 1], [-1, 1], [1, -1], [-1, -1]];

		for (var i = 0; i < directions.length; i++) {
			var dir = directions[i];

			var cx = this.x + dir[0];
			var cy = this.y + dir[1];

			while (this.chessboard.isValidPosition(cx,cy)) {
				var cell = this.chessboard.cells[cy][cx];

				if (cell.piece == null) {
					moves.push([cx,cy]);
					
					cx += dir[0];
					cy += dir[1];
					continue;
				} else if (cell.piece.isBlack != this.isBlack) {
					moves.push([cx,cy]);
					break;
				} else {
					break;
				}
			}
		}
		return moves;
	}
}

class PKnight extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "knight");
	}

	getLegalMoves() {
		var moves = [];
		var movesToCheck = [[2, 1], [2, -1], [-2, 1], [-2, -1], 		[1, 2], [-1, 2], [1, -2], [-1, -2]];

		for (var i = 0; i < movesToCheck.length; i++) {

			var cx = this.x + movesToCheck[i][0];
			var cy = this.y + movesToCheck[i][1];

			if (this.chessboard.isValidPosition(cx,cy)) {
				var cell = this.chessboard.cells[cy][cx];

				if (cell.piece == null || cell.piece.isBlack != this.isBlack) {
					moves.push([cx,cy]);
				}
			}
		}
		return moves;
	}
}

//derivative of knight
class PNightRider extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "nightrider");
	}

	getLegalMoves() {
		var moves = [];
		var movesToCheck = [[2, 1], [2, -1], [-2, 1], [-2, -1], 		[1, 2], [-1, 2], [1, -2], [-1, -2]];

		for (var i = 0; i < movesToCheck.length; i++) {

			var cx = this.x + movesToCheck[i][0];
			var cy = this.y + movesToCheck[i][1];

			while (this.chessboard.isValidPosition(cx,cy)) {
				var cell = this.chessboard.cells[cy][cx];

				if (cell.piece == null) {
					moves.push([cx,cy]);
					cx += movesToCheck[i][0];
					cy += movesToCheck[i][1];
				} else if (cell.piece.isBlack != this.isBlack) {
					moves.push([cx,cy]);
					break;
				} else {
					break;
				}
			}
		}
		return moves;
	}
}

class PWazir extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "wazir");
	}

	getLegalMoves() {
		var moves = [];
		var movesToCheck = [[1, 0], [-1, 0], [0, 1], [0, -1]];

		for (var i = 0; i < movesToCheck.length; i++) {

			var cx = this.x + movesToCheck[i][0];
			var cy = this.y + movesToCheck[i][1];

			if (this.chessboard.isValidPosition(cx,cy)) {
				var cell = this.chessboard.cells[cy][cx];
				if (cell.piece == null || cell.piece.isBlack != this.isBlack) {
					moves.push([cx,cy]);
				}
			}
		}
		return moves;
	}
}

function spawnPieceByName(name, x, y, isBlack) {
	
	var piece = null;
	if (name == "king") {
		piece = new PKing(board, x, y, isBlack);
	}
	else if (name == "pawn") {
		piece = new PPawn(board, x, y, isBlack);
	} else if (name == "rook") {
		piece = new PRook(board, x, y, isBlack);
	} else if (name == "queen") {
		piece = new PQueen(board, x, y, isBlack);
	} else if (name == "bishop") {
		piece = new PBishop(board, x, y, isBlack);
	} else if (name == "knight") {
		piece = new PKnight(board, x, y, isBlack);
	} else if (name == "nightrider") {
		piece = new PNightRider(board, x, y, isBlack);
	} else if (name == "wazir") {
		piece = new PWazir(board, x, y, isBlack);
	}
}