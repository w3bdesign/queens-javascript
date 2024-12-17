interface BoardPosition {
  row: number;
  col: number;
}

interface BoardValidation {
  isValid: boolean;
  reason?: string;
}

type CellState = null | 'X' | '♛';

export class Board {
  private static readonly BOARD_SIZE = 5;
  private static readonly QUEEN_SYMBOL = '♛';
  private static readonly X_SYMBOL = 'X';
  private static readonly DOUBLE_CLICK_DELAY = 300; // ms
  
  private boardState: CellState[][];
  private boardElement: HTMLElement;
  private lastClickTime: number = 0;
  private lastClickPosition: BoardPosition | null = null;
  
  private readonly colorRegions: number[][] = [
    [1, 1, 2, 2, 2],
    [1, 1, 2, 2, 2],
    [1, 2, 2, 3, 3],
    [2, 2, 3, 3, 3],
    [2, 2, 3, 3, 3]
  ];

  constructor() {
    // Initialize empty board state
    this.boardState = this.createEmptyBoard();

    // Get board element from DOM
    const element = document.getElementById('game-board');
    if (!element) throw new Error('Game board element not found');
    this.boardElement = element;

    this.initializeBoard();
  }

  /**
   * Creates an empty board grid
   */
  private createEmptyBoard(): CellState[][] {
    const board: CellState[][] = Array(Board.BOARD_SIZE)
      .fill(null)
      .map(() => Array(Board.BOARD_SIZE).fill(null));
    return board;
  }

  /**
   * Places an X marker on the board at the specified position
   */
  private placeX(position: BoardPosition): void {
    const { row, col } = position;
    this.boardState[row][col] = Board.X_SYMBOL;

    const cell = this.getCellElement(position);
    if (cell) {
      cell.textContent = Board.X_SYMBOL;
      cell.classList.add('marked');
    }
  }

  /**
   * Removes an X marker from the specified position
   */
  private removeX(position: BoardPosition): void {
    const { row, col } = position;
    this.boardState[row][col] = null;

    const cell = this.getCellElement(position);
    if (cell) {
      cell.textContent = '';
      cell.classList.remove('marked');
    }
  }

  /**
   * Initializes the game board by creating cells and adding event listeners
   */
  private initializeBoard(): void {
    for (let row = 0; row < Board.BOARD_SIZE; row++) {
      for (let col = 0; col < Board.BOARD_SIZE; col++) {
        const cell = this.createBoardCell({ row, col });
        this.boardElement.appendChild(cell);
      }
    }
  }

  /**
   * Creates a single board cell with appropriate styling and event listeners
   */
  private createBoardCell(position: BoardPosition): HTMLElement {
    const { row, col } = position;
    const cell = document.createElement('div');

    // Set cell properties
    cell.className = `cell region-${this.colorRegions[row][col]}`;
    cell.dataset.row = row.toString();
    cell.dataset.col = col.toString();

    // Add click handler
    cell.addEventListener('click', () => this.handleCellClick(position));

    return cell;
  }

  /**
   * Handles cell click events
   */
  private handleCellClick(position: BoardPosition): void {
    const currentTime = Date.now();
    const { row, col } = position;

    // Check if this is a double click on the same cell
    const isDoubleClick =
      this.lastClickPosition &&
      this.lastClickPosition.row === row &&
      this.lastClickPosition.col === col &&
      currentTime - this.lastClickTime < Board.DOUBLE_CLICK_DELAY;

    if (isDoubleClick) {
      // Double click - try to place queen
      if (this.boardState[row][col] !== Board.QUEEN_SYMBOL) {
        const validation = this.validateQueenPlacement(position);
        if (validation.isValid) {
          this.placeQueen(position);
          this.checkWinCondition();
        } else {
          this.showInvalidPlacement(position, validation.reason);
        }
      }
    } else {
      // Single click - toggle X mark only if it's a valid X position
      if (this.boardState[row][col] === null) {
        if (this.isValidXPlacement(position)) {
          this.placeX(position);
        }
      } else if (this.boardState[row][col] === Board.X_SYMBOL) {
        this.removeX(position);
      }
    }

    this.lastClickTime = currentTime;
    this.lastClickPosition = position;
  }

  private isValidXPlacement(position: BoardPosition): boolean {
    const { row, col } = position;

    // Can't place X where a queen is
    if (this.boardState[row][col] === Board.QUEEN_SYMBOL) {
      return false;
    }

    // Check if this position is attacked by any queen
    for (let r = 0; r < Board.BOARD_SIZE; r++) {
      for (let c = 0; c < Board.BOARD_SIZE; c++) {
        if (this.boardState[r][c] === Board.QUEEN_SYMBOL) {
          // Same row or column
          if (r === row || c === col) {
            return true;
          }
          // Diagonal
          if (Math.abs(row - r) === Math.abs(col - c)) {
            return true;
          }
          // Same color region
          if (this.colorRegions[r][c] === this.colorRegions[row][col]) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Places a queen on the board at the specified position
   */
  private placeQueen(position: BoardPosition): void {
    const { row, col } = position;
    this.boardState[row][col] = Board.QUEEN_SYMBOL;

    const cell = this.getCellElement(position);
    if (cell) {
      cell.innerHTML = `<span class="queen">${Board.QUEEN_SYMBOL}</span>`;
      cell.classList.add('valid');
    }
  }

  /**
   * Removes a queen from the specified position
   */
  private removeQueen(position: BoardPosition): void {
    const { row, col } = position;
    this.boardState[row][col] = null;

    const cell = this.getCellElement(position);
    if (cell) {
      cell.innerHTML = '';
      cell.classList.remove('valid');
    }
  }

  /**
   * Shows invalid placement animation and optional tooltip
   */
  private showInvalidPlacement(position: BoardPosition, reason?: string): void {
    const cell = this.getCellElement(position);
    if (cell) {
      cell.classList.add('invalid');

      // Create temporary queen for visual feedback
      const tempQueen = document.createElement('span');
      tempQueen.textContent = Board.QUEEN_SYMBOL;
      tempQueen.classList.add('queen', 'invalid');
      cell.appendChild(tempQueen);

      // Show reason tooltip if provided
      if (reason) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = reason;
        cell.appendChild(tooltip);
      }

      // Remove temporary elements and invalid class
      setTimeout(() => {
        cell.classList.remove('invalid');
        cell.innerHTML = '';
      }, 500);
    }
  }

  /**
   * Validates if a queen can be placed at the specified position
   */
  private validateQueenPlacement(position: BoardPosition): BoardValidation {
    const { row, col } = position;

    // Can't place queen on X
    if (this.boardState[row][col] === Board.X_SYMBOL) {
      return {
        isValid: false,
        reason: 'Cannot place queen on an X marker'
      };
    }

    const rowCheck = this.validateRow(position);
    if (!rowCheck.isValid) return rowCheck;

    const colCheck = this.validateColumn(position);
    if (!colCheck.isValid) return colCheck;

    const regionCheck = this.validateColorRegion(position);
    if (!regionCheck.isValid) return regionCheck;

    const diagonalCheck = this.validateDiagonals(position);
    if (!diagonalCheck.isValid) return diagonalCheck;

    return { isValid: true };
  }

  /**
   * Validates row placement
   */
  private validateRow({ row }: BoardPosition): BoardValidation {
    const hasQueen = this.boardState[row].some((cell) => cell === Board.QUEEN_SYMBOL);
    return {
      isValid: !hasQueen,
      reason: hasQueen ? 'Row already contains a queen' : undefined,
    };
  }

  /**
   * Validates column placement
   */
  private validateColumn({ col }: BoardPosition): BoardValidation {
    const hasQueen = this.boardState.some((row) => row[col] === Board.QUEEN_SYMBOL);
    return {
      isValid: !hasQueen,
      reason: hasQueen ? 'Column already contains a queen' : undefined,
    };
  }

  /**
   * Validates color region placement
   */
  private validateColorRegion(position: BoardPosition): BoardValidation {
    const { row, col } = position;
    const region = this.colorRegions[row][col];

    for (let r = 0; r < Board.BOARD_SIZE; r++) {
      for (let c = 0; c < Board.BOARD_SIZE; c++) {
        if (this.colorRegions[r][c] === region && this.boardState[r][c] === Board.QUEEN_SYMBOL) {
          return {
            isValid: false,
            reason: 'Color region already contains a queen',
          };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Validates diagonal placement
   */
  private validateDiagonals(position: BoardPosition): BoardValidation {
    const { row, col } = position;

    for (let r = 0; r < Board.BOARD_SIZE; r++) {
      for (let c = 0; c < Board.BOARD_SIZE; c++) {
        if (this.boardState[r][c] === Board.QUEEN_SYMBOL) {
          if (Math.abs(row - r) === Math.abs(col - c)) {
            return {
              isValid: false,
              reason: 'Queen can be attacked diagonally',
            };
          }
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Gets the DOM element for a cell at the specified position
   */
  private getCellElement({ row, col }: BoardPosition): HTMLElement | null {
    return this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  /**
   * Checks if the current board state represents a winning condition
   */
  private checkWinCondition(): void {
    let queenCount = 0;
    for (let row = 0; row < Board.BOARD_SIZE; row++) {
      for (let col = 0; col < Board.BOARD_SIZE; col++) {
        if (this.boardState[row][col] === Board.QUEEN_SYMBOL) {
          queenCount++;
        }
      }
    }

    // Get number of unique regions
    const uniqueRegions = new Set(this.colorRegions.flat()).size;
    
    // Win when we have exactly one queen in each region
    if (queenCount === uniqueRegions) {
      setTimeout(() => {
        alert('Congratulations! You solved the puzzle!');
      }, 500);
    }
  }
}
