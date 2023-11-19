DOM_center = document.getElementById("chessboard_holder");

DOM_chessboard = document.createElement('table');

var selectedPiece = null;

class ChessBoard {
	constructor(DOM_board) {
		this.DOM = DOM_board;
		this.cells = [];
	}

	isValidPosition(x,y) {
		if (y >= 0 && y < this.cells.length) {
			if (x >= 0 && x < this.cells[y].length) {
				return true;
			}
		}
		return false;
	}
}

function ClearAllHighlights(chessboard) {
	for (var i = 0; i < chessboard.cells.length; i++) {
		for (var j = 0; j < chessboard.cells[i].length; j++) {
			chessboard.cells[i][j].highlight(false, "");
		}
	}
}

class Cell {
	constructor(chessboard, DOM_cell, x, y) {
		this.chessboard = chessboard;
		this.DOM = DOM_cell;
		this.sprite = null;
		this.piece = null;
		this.color = "white";

		this.x = x;
		this.y = y;

		this.DOM.onclick = this.onclick;
		this.DOM.cell = this;
	}

	onclick() { // here "this" refers to the DOM element
		ClearAllHighlights(this.cell.chessboard);
		if (pieceShopEnabled && ((isStartingPlayer && this.cell.y <= 2) || (!isStartingPlayer && this.cell.y >= 5))) {
			if (pieceShop_selectedPieceName == "delete" && this.cell.piece != null && this.cell.piece.isBlack == isStartingPlayer) {
				money += pieceInfo[this.cell.piece.name].price;
				NW_deletePiece(this.cell.x,this.cell.y);
				updateMoneyDisplay();
			}
			else if (pieceShop_selectedPieceName != "" && this.cell.piece == null && money >= pieceInfo[pieceShop_selectedPieceName].price) {
				NW_spawnPiece(pieceShop_selectedPieceName, this.cell.x, this.cell.y, isStartingPlayer);
				money -= pieceInfo[pieceShop_selectedPieceName].price
				updateMoneyDisplay();
			}
		} else {
			if (this.cell.piece != null && this.cell.piece.isBlack == isStartingPlayer) {
				this.cell.piece.highlightLegalMoves();
				selectedPiece = this.cell.piece;
			} else {
				this.cell.highlight(true, "grey");
				if (selectedPiece != null && isStartingPlayer == startingPlayerToMove) {
					if (selectedPiece.canMoveTo(this.cell.x, this.cell.y)) {
						selectedPiece.moveTo(this.cell.x, this.cell.y);
					}
					selectedPiece = null;
				}
			}
		}
	}

	setColor(color_name) {
		this.color = color_name;
		this.DOM.style.backgroundColor = color_name;
	}

	highlight(enable, color) {
		if (enable) {
			this.DOM.style.backgroundColor = color;
		} else {
			this.DOM.style.backgroundColor = this.color;
		}
	}

	removeSprite() {
		if (this.sprite != null) {
			this.sprite.remove();
			this.sprite = null;
		}
	}

	setSprite(link) {
		var img = document.createElement('img');
		img.src = link;
		img.setAttribute('class', 'sprite');

		this.DOM.appendChild(img);

		this.sprite = img;
		return img;
	}
}

board = new ChessBoard(DOM_chessboard);
var board_separatorLine;
function generateTiles(flipped) {

	// create tile array filled with nulls
	for (var i = 0; i < 8; i++) {
		board.cells.push([]);
		for (var j = 0; j < 8; j++) {
			board.cells[i].push(null);
		}
	}

	// create board tiles
	for (var i = 0; i < 8; i++) {

		// create a row
		var row = document.createElement('tr');

		if (i == 5) {
			var line = document.createElement('br')
			DOM_chessboard.appendChild(line);
			board_separatorLine = line;
		}
		
		for (var j = 0; j < 8; j++) {
			
		// create a cell
			var DOM_cell = document.createElement('td');

			DOM_cell.setAttribute('class', 'cell');

			x = flipped ? 7-j : j;
			y =  flipped ? 7-i : i;

			cell = new Cell(board, DOM_cell, x, y);
		
			if ((i + j)%2 == 1) {
				cell.setColor("CornflowerBlue");
			} else {
				cell.setColor("AliceBlue");
			}

			board.cells[y][x] = cell;

			row.appendChild(DOM_cell);
		}

		DOM_chessboard.appendChild(row);
	}
}

DOM_center.appendChild(DOM_chessboard);
document.body.appendChild(DOM_center);