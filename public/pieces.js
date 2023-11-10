pieceInfo = {
	"king": {"description": "A normal king", "price": 10},	
	"pawn": {"description": "Your good old pawn", "price": 1},
	"delete": {"description": "Remove a piece", "price": 0},
}

pieceShop = document.getElementById("pieceShop");
selectedPieceName = document.getElementById("selectedPieceName");
selectedPieceDesc = document.getElementById("selectedPieceDesc");

pieceShop_selectedPieceName = "";

for (var name in pieceInfo) {
	var img = document.createElement("img");
	img.pieceName = name;
	img.src = "/sprites/" + name + "/white.svg";

	img.onclick = function() {pieceShop_selectedPieceName = this.pieceName}
	img.onmouseover = function() {selectedPieceName.innerHTML = this.pieceName; selectedPieceDesc.innerHTML = pieceInfo[this.pieceName].description; }
	img.onmouseout = function() {selectedPieceName.innerHTML = "Select a piece!"; selectedPieceDesc.innerHTML = "....."; }

	pieceShop.appendChild(img);
}

class Piece {
	constructor(chessboard, x, y, isBlack, name) {
		this.chessboard = chessboard;
		this.y = y;
		this.x = x;
		this.isBlack = isBlack;
		this.chessboard.cells[this.y][this.x].piece = this;

		if (isBlack) {
			this.createSprite("/sprites/" + name + "/black.svg");
		} else {
			this.createSprite("/sprites/" + name + "/white.svg");
		}
	}

	createSprite(spritelnk) {
		this.DOM = this.chessboard.cells[this.y][this.x].setSprite(spritelnk);
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
}

class PKing extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "king");
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
}

class PPawn extends Piece {
	constructor(chessboard, x, y, isBlack) {
		super(chessboard, x, y, isBlack, "pawn");
	}

	getLegalMoves() {
		var moves = [];
		return moves;
	}
}

function spawnPieceByName(name, x, y, isBlack) {
	if (name == "king") {
		var k = new PKing(board, x, y, isBlack);
	}
	else if (name == "pawn") {
		var p = new PPawn(board, x, y, isBlack);
	}
}