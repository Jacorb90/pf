const whitePieces = ["♙","♖","♘","♗","♕","♔"];
const blackPieces = ["♟","♜","♞","♝","♛","♚"];
const pieceWorth = [1,5,3,3,9,0];


class ChessGame {
    constructor(r, c, board, cg = null, canCastle=true, options=[], forceOptions=false) {
        
        if (cg == null) {
            this.rows = r;
            this.cols = c;
            this.board = board;

            this.turn = !options[1]; // white's turn
            this.clickedSquare = false;
            this.legalMoves = [];
            this.legalEnPassant = false;
            this.remainingCastlings = canCastle ? [true,true,true,true] : [false,false,false,false];
            this.winner = false;
            this.kingStartCols = [this.findPiece(12) ? this.findPiece(12)[1] : null, this.findPiece(6) ? this.findPiece(6)[1] : null];
            this.rookStartCols = [this.findPiece(8) ? [this.findPiece(8,true)[1], this.findPiece(8)[1]] : null, this.findPiece(2) ? [this.findPiece(2,true)[1], this.findPiece(2)[1]] : null];
            
            this.options = options;
            this.pieces = options[1] ? [" ", ...blackPieces, ...whitePieces] : [" ", ...whitePieces, ...blackPieces];
        
            if ((options[0] && options[1]) || (options[2] && !options[1])) this.computerMove();
        } else {
            this.rows = cg.rows;
            this.cols = cg.cols;
            this.board = JSON.parse(JSON.stringify(cg.board));

            this.turn = cg.turn;
            this.clickedSquare = cg.clickedSquare;
            this.legalMoves = cg.legalMoves;
            this.legalEnPassant = cg.legalEnPassant;
            this.remainingCastlings = cg.remainingCastlings;
            this.winner = cg.winner;
            this.kingStartCols = cg.kingStartCols;
            this.rookStartCols = cg.rookStartCols;

            this.options = forceOptions ? options : cg.options;
            this.pieces = cg.pieces;
        }
    }

    canClick(r,c) {
        if (this.clickedSquare == false) {
            let pieceID = this.board[r][c];
            return pieceID > 0 && ((pieceID < 7 && this.turn) || (pieceID > 6 && !this.turn))
        } else return this.legalMoves.some(move => move[0] == r && move[1] == c);
    }

    makeMove(r,c,legalMove) {
        if (legalMove[2] == 1) this.board[r+1][c] = 0;
        else if (legalMove[2] == 2) this.board[r-1][c] = 0;
        else if (legalMove[2] == 3 && this.kingStartCols[1] != null) {
            this.board[7][7] = 0;
            this.board[7][this.kingStartCols[1]+1] = 2;
        } else if (legalMove[2] == 4 && this.kingStartCols[1] != null) {
            this.board[7][0] = 0;
            this.board[7][this.kingStartCols[1]-1] = 2;
        } else if (legalMove[2] == 5 && this.kingStartCols[0] != null) {
            this.board[0][7] = 0;
            this.board[0][this.kingStartCols[0]+1] = 8;
        } else if (legalMove[2] == 6 && this.kingStartCols[0] != null) {
            this.board[0][0] = 0;
            this.board[0][this.kingStartCols[0]-1] = 8;
        }
        if (this.board[this.clickedSquare[0]][this.clickedSquare[1]] == 1 && r == 0) this.board[this.clickedSquare[0]][this.clickedSquare[1]] = 5;
        if (this.board[this.clickedSquare[0]][this.clickedSquare[1]] == 7 && r == this.rows - 1) this.board[this.clickedSquare[0]][this.clickedSquare[1]] = 11;

        this.board[r][c] = this.board[this.clickedSquare[0]][this.clickedSquare[1]];
        this.board[this.clickedSquare[0]][this.clickedSquare[1]] = 0;
        this.turn = !this.turn;
    }

    click(r,c) {
        if (this.clickedSquare == false) {
            if (this.canClick(r,c)) {
                this.clickedSquare = [r,c];
                this.legalMoves = this.getLegalMoves(r,c);
            }
        } else {
            if (this.canClick(r,c)) {
                this.checkForCastles();

                this.legalEnPassant = (this.turn ? (this.clickedSquare[0] == this.rows - 2 && r == this.rows - 4) : (this.clickedSquare[0] == 1 && r == 3)) ? [r,c] : false;

                let legalMove = this.legalMoves.find(move => move[0] == r && move[1] == c);
  
                this.makeMove(r,c,legalMove)

                this.checkForCastles();
            }
            this.clickedSquare = false;
            this.legalMoves = [];

            if (this.checkForMate()) this.winner = (ChessGame.InCheck(this, [0,0], [0,0], this.findPiece(this.turn ? 6 : 12)) || !this.canFindAny(this.turn ? [1,2,3,4,5,6] : [7,8,9,10,11,12])) ? (this.turn ? "Black" : "White") : "Tie";
            else if (this.options[0] && !this.turn) this.computerMove();
            else if (this.options[2] && this.turn) this.computerMove();
        }
    }

    checkForCastles() {
        if (this.remainingCastlings[0] && this.kingStartCols[1] != null && (this.board[7][this.rookStartCols[1][1]] != 2 || this.board[7][this.kingStartCols[1]] != 6)) this.remainingCastlings[0] = false;
        if (this.remainingCastlings[1] && this.kingStartCols[1] != null && (this.board[7][this.rookStartCols[1][0]] != 2 || this.board[7][this.kingStartCols[1]] != 6)) this.remainingCastlings[1] = false;
        if (this.remainingCastlings[2] && this.kingStartCols[0] != null && (this.board[0][this.rookStartCols[0][1]] != 8 || this.board[0][this.kingStartCols[0]] != 12)) this.remainingCastlings[2] = false;
        if (this.remainingCastlings[3] && this.kingStartCols[0] != null && (this.board[0][this.rookStartCols[0][0]] != 8 || this.board[0][this.kingStartCols[0]] != 12)) this.remainingCastlings[3] = false;
    }

    checkForMate() {
        let clickables = this.getClickables()

        if (clickables.some(pos => this.getLegalMoves(pos[0],pos[1]).length > 0)) return false;

        return true;
    }

    getLegalMoves(r,c,ignoreCheck=false) {
        let lgm = this._getLegalMoves(r,c);

        if (!ignoreCheck) lgm = lgm.filter(move => !ChessGame.InCheck(this, [r,c], move, this.findPiece(this.turn ? 6 : 12)));

        return lgm;
    }

    _getLegalMoves(r,c) {
        // legal move codes:
        // 1: white-side enpassant
        // 2: black-side enpassant
        // 3: white-side short-castle
        // 4: white-side long-castle
        // 5: black-side short-castle
        // 6: black-side long-castle

        let pieceID = this.board[r][c];
        let moves = [];
        
        switch(pieceID) {
            case 0: 
                return []
            case 1:
                if (r == 0) return [];

                if (this.board[r-1][c] == 0) moves.push([r-1,c]);
                if (r == this.rows - 2 && this.board[r-1][c] == 0 && this.board[r-2][c] == 0) moves.push([r-2,c]);
                if (this.board[r-1][c-1] > 6) moves.push([r-1,c-1]);
                if (this.board[r-1][c+1] > 6) moves.push([r-1,c+1]);
                if (this.legalEnPassant != false && this.legalEnPassant[0] == r) {
                    if (this.legalEnPassant[1] == c-1) moves.push([r-1,c-1,1]);
                    if (this.legalEnPassant[1] == c+1) moves.push([r-1,c+1,1]);
                }

                return moves;
            case 2:
                return this.getLegalRookMoves(r,c,[7,8,9,10,11,12]);
            case 3:
                if (r > 1) {
                    if (c > 0 && (this.board[r-2][c-1] > 6 || this.board[r-2][c-1] == 0)) moves.push([r-2,c-1]);
                    if (c < this.cols - 1 && (this.board[r-2][c+1] > 6 || this.board[r-2][c+1] == 0)) moves.push([r-2,c+1]);
                }
                if (r < this.rows - 2) {
                    if (c > 0 && (this.board[r+2][c-1] > 6 || this.board[r+2][c-1] == 0)) moves.push([r+2,c-1]);
                    if (c < this.cols - 1 && (this.board[r+2][c+1] > 6 || this.board[r+2][c+1] == 0)) moves.push([r+2,c+1]);
                }
                if (c > 1) {
                    if (r > 0 && (this.board[r-1][c-2] > 6 || this.board[r-1][c-2] == 0)) moves.push([r-1,c-2]);
                    if (r < this.rows - 1 && (this.board[r+1][c-2] > 6 || this.board[r+1][c-2] == 0)) moves.push([r+1,c-2]);
                }
                if (c < this.cols - 2) {
                    if (r > 0 && (this.board[r-1][c+2] > 6 || this.board[r-1][c+2] == 0)) moves.push([r-1,c+2]);
                    if (r < this.rows - 1 && (this.board[r+1][c+2] > 6 || this.board[r+1][c+2] == 0)) moves.push([r+1,c+2]);
                }

                return moves;
            case 4:
                return this.getLegalBishopMoves(r,c,[7,8,9,10,11,12]);
            case 5:
                return this.getLegalRookMoves(r,c,[7,8,9,10,11,12]).concat(this.getLegalBishopMoves(r,c,[7,8,9,10,11,12]));
            case 6:
                if (r > 0) {
                    if (this.board[r-1][c] > 6 || this.board[r-1][c] == 0) moves.push([r-1,c]);
                    if (c > 0 && (this.board[r-1][c-1] > 6 || this.board[r-1][c-1] == 0)) moves.push([r-1,c-1]);
                    if (c < this.cols - 1 && (this.board[r-1][c+1] > 6 || this.board[r-1][c+1] == 0)) moves.push([r-1,c+1]);
                }
                if (r < this.rows - 1) {
                    if (this.board[r+1][c] > 6 || this.board[r+1][c] == 0) moves.push([r+1,c])
                    if (c > 0 && (this.board[r+1][c-1] > 6 || this.board[r+1][c-1] == 0)) moves.push([r+1,c-1]);
                    if (c < this.cols - 1 && (this.board[r+1][c+1] > 6 || this.board[r+1][c+1] == 0)) moves.push([r+1,c+1]);
                }
                if (c > 0 && (this.board[r][c-1] > 6 || this.board[r][c-1] == 0)) moves.push([r,c-1]);
                if (c < this.cols - 1 && (this.board[r][c+1] > 6 || this.board[r][c+1] == 0)) moves.push([r,c+1]);

                if (this.remainingCastlings[0] && this.kingStartCols[1] != null && this.board[7][this.kingStartCols[1]+1] == 0 && this.board[7][this.kingStartCols[1]+2] == 0) moves.push([7,this.kingStartCols[1]+2,3])
                if (this.remainingCastlings[1] && this.kingStartCols[1] != null && this.board[7][this.kingStartCols[1]-1] == 0 && this.board[7][this.kingStartCols[1]-2] == 0 && this.board[7][this.kingStartCols[1]-3] == 0) moves.push([7,this.kingStartCols[1]-2,4]);

                return moves;
            case 7:
                if (r == this.rows - 1) return [];

                if (this.board[r+1][c] == 0) moves.push([r+1,c]);
                if (r == 1 && this.board[2][c] == 0 && this.board[3][c] == 0) moves.push([3,c]);
                if (this.board[r+1][c-1] < 7 && this.board[r+1][c-1] != 0) moves.push([r+1,c-1]);
                if (this.board[r+1][c+1] < 7 && this.board[r+1][c+1] != 0) moves.push([r+1,c+1]);
                if (this.legalEnPassant != false && this.legalEnPassant[0] == r) {
                    if (this.legalEnPassant[1] == c-1) moves.push([r+1,c-1,2]);
                    if (this.legalEnPassant[1] == c+1) moves.push([r+1,c+1,2]);
                }

                return moves;
            case 8:
                return this.getLegalRookMoves(r,c,[1,2,3,4,5,6]);
            case 9:
                    if (r > 1) {
                        if (c > 0 && this.board[r-2][c-1] < 7) moves.push([r-2,c-1]);
                        if (c < this.cols - 1 && this.board[r-2][c+1] < 7) moves.push([r-2,c+1]);
                    }
                    if (r < this.rows - 2) {
                        if (c > 0 && this.board[r+2][c-1] < 7) moves.push([r+2,c-1]);
                        if (c < this.cols - 1 && this.board[r+2][c+1] < 7) moves.push([r+2,c+1]);
                    }
                    if (c > 1) {
                        if (r > 0 && this.board[r-1][c-2] < 7) moves.push([r-1,c-2]);
                        if (r < this.rows - 1 && this.board[r+1][c-2] < 7) moves.push([r+1,c-2]);
                    }
                    if (c < this.cols - 2) {
                        if (r > 0 && this.board[r-1][c+2] < 7) moves.push([r-1,c+2]);
                        if (r < this.rows - 1 && this.board[r+1][c+2] < 7) moves.push([r+1,c+2]);
                    }
    
                    return moves;
            case 10:
                return this.getLegalBishopMoves(r,c,[1,2,3,4,5,6]);
            case 11:
                return this.getLegalRookMoves(r,c,[1,2,3,4,5,6]).concat(this.getLegalBishopMoves(r,c,[1,2,3,4,5,6]));
            case 12:
                if (r > 0) {
                    if (this.board[r-1][c] < 7) moves.push([r-1,c]);
                    if (c > 0 && (this.board[r-1][c-1] < 7)) moves.push([r-1,c-1]);
                    if (c < this.cols - 1 && (this.board[r-1][c+1] < 7)) moves.push([r-1,c+1]);
                }
                if (r < this.rows - 1) {
                    if (this.board[r+1][c] < 7) moves.push([r+1,c])
                    if (c > 0 && (this.board[r+1][c-1] < 7)) moves.push([r+1,c-1]);
                    if (c < this.cols - 1 && (this.board[r+1][c+1] < 7)) moves.push([r+1,c+1]);
                }
                if (c > 0 && (this.board[r][c-1] < 7)) moves.push([r,c-1]);
                if (c < this.cols - 1 && (this.board[r][c+1] < 7)) moves.push([r,c+1]);

                if (this.remainingCastlings[2] && this.kingStartCols[0] != null && this.board[0][this.kingStartCols[0]+1] == 0 && this.board[0][this.kingStartCols[0]+2] == 0) moves.push([0,this.kingStartCols[0]+2,5])
                if (this.remainingCastlings[3] && this.kingStartCols[0] != null && this.board[0][this.kingStartCols[0]-1] == 0 && this.board[0][this.kingStartCols[0]-2] == 0 && this.board[0][this.kingStartCols[0]-1] == 0) moves.push([0,this.kingStartCols[0]-2,6]);

                return moves;
            default:
                return [];
        }
    }

    getLegalRookMoves(r,c,capturables) {
        let moves = [];

        for (let i=r+1;i<this.rows;i++) {
            let pieceID = this.board[i][c];
            
            if (pieceID == 0) moves.push([i,c]);
            else if (capturables.includes(pieceID)) {
                moves.push([i,c]);
                break;
            } else break;
        }

        for (let i=r-1;i>=0;i--) {
            let pieceID = this.board[i][c];
            
            if (pieceID == 0) moves.push([i,c]);
            else if (capturables.includes(pieceID)) {
                moves.push([i,c]);
                break;
            } else break;
        }

        for (let i=c+1;i<this.cols;i++) {
            let pieceID = this.board[r][i];
            
            if (pieceID == 0) moves.push([r,i]);
            else if (capturables.includes(pieceID)) {
                moves.push([r,i]);
                break;
            } else break;
        }

        for (let i=c-1;i>=0;i--) {
            let pieceID = this.board[r][i];
            
            if (pieceID == 0) moves.push([r,i]);
            else if (capturables.includes(pieceID)) {
                moves.push([r,i]);
                break;
            } else break;
        }

        return moves;
    }

    getLegalBishopMoves(r,c,capturables) {
        let moves = [];

        for (let i=1;i<Math.min(this.rows - r, this.cols - c);i++) {
            let pieceID = this.board[r+i][c+i];
            
            if (pieceID == 0) moves.push([r+i,c+i]);
            else if (capturables.includes(pieceID)) {
                moves.push([r+i,c+i]);
                break;
            } else break;
        }

        for (let i=1;i<Math.min(r+1, this.cols - c);i++) {
            let pieceID = this.board[r-i][c+i];
            
            if (pieceID == 0) moves.push([r-i,c+i]);
            else if (capturables.includes(pieceID)) {
                moves.push([r-i,c+i]);
                break;
            } else break;
        }

        for (let i=1;i<Math.min(this.rows - r, c+1);i++) {
            let pieceID = this.board[r+i][c-i];
            
            if (pieceID == 0) moves.push([r+i,c-i]);
            else if (capturables.includes(pieceID)) {
                moves.push([r+i,c-i]);
                break;
            } else break;
        }

        for (let i=1;i<Math.min(r+1, c+1);i++) {
            let pieceID = this.board[r-i][c-i];
            
            if (pieceID == 0) moves.push([r-i,c-i]);
            else if (capturables.includes(pieceID)) {
                moves.push([r-i,c-i]);
                break;
            } else break;
        }

        return moves;
    }

    canFindAny(pieces) {
        return pieces.some(pID => this.findPiece(pID) != null);
    }

    findPiece(pieceID, first=false) {
        let found = null;

        for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) {
            if (this.board[r][c] == pieceID) {
                found = [r,c];
                if (first) return found;
            }
        }

        return found;
    }

    getClickables() {
        let clickables = [];
        for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) {
            if (this.canClick(r,c)) clickables.push([r,c]);
        }
        return clickables;
    }

    async computerMove() {
        await new Promise(resolve => setTimeout(resolve, 200));

        let targetPieceMove = this.getTargetPieceMove();

        this.click(targetPieceMove[0][0], targetPieceMove[0][1]);
        this.click(targetPieceMove[1][0], targetPieceMove[1][1]);
    }

    getTargetPieceMove() {
        let clickables = this.getClickables().filter(cl => this.getLegalMoves(cl[0], cl[1]).length > 0);
        let c = clickables[Math.floor(Math.random() * clickables.length)];

        let possibleMoves = this.getLegalMoves(c[0], c[1]);

        return [c, possibleMoves[Math.floor(Math.random() * possibleMoves.length)]];
    }

    static InCheck(cb, piecePos, mov, kingPos) {
        if (kingPos == null) return false;

        cb = new ChessGame(cb.rows,cb.cols,cb.board,cb);

        let kingPositions = [kingPos];

        if (piecePos[0] == kingPos[0] && piecePos[1] == kingPos[1]) {
            if (Math.abs(mov[1] - kingPos[1]) > 1) kingPositions.push([mov[0],(mov[1] > kingPos[1]) ? kingPos[1]+1 : kingPos[1]-1]);
            else kingPositions = [];
            kingPositions.push([mov[0],mov[1]]);
        }

        cb.clickedSquare = piecePos;
        cb.makeMove(mov[0],mov[1],mov);

        cb.clickedSquare = false;

        let otherSide = cb.getClickables();

        if (otherSide.some(coords => cb.getLegalMoves(coords[0], coords[1], true).some(move => kingPositions.some(kingPos => kingPos[0] == move[0] && kingPos[1] == move[1])))) return true;

        return false;
    }
}