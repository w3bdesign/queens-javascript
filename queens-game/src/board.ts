interface BoardPosition {
  row: number;
  col: number;
}

interface BoardValidation {
  isValid: boolean;
  reason?: string;
}

export class Board {
  private static readonly BOARD_SIZE = 5;
  private static readonly QUEEN_SYMBOL = '♛';

  private boardState: (string | null)[][];
  private boardElement: HTMLElement;

  // Define color regions for the board (1-3 represent different colored areas)
  private readonly colorRegions: number[][] = [
    [1, 1, 2, 2, 2],
    [1, 1, 2, 3, 2],
    [1, 2, 2, 3, 3],
    [2, 2, 3, 3, 3],
    [2, 2, 3, 3, 3],
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
  private createEmptyBoard(): (string | null)[][] {
    return Array(Board.BOARD_SIZE)
      .fill(null)
      .map(() => Array(Board.BOARD_SIZE).fill(null));
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
    const { row, col } = position;
    const hasQueen = this.boardState[row][col] !== null;

    if (hasQueen) {
      this.removeQueen(position);
    } else {
      const validation = this.validateQueenPlacement(position);

      if (validation.isValid) {
        this.placeQueen(position);
        this.checkWinCondition();
      } else {
        this.showInvalidPlacement(position, validation.reason);
      }
    }
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
    const hasQueen = this.boardState[row].some((cell) => cell !== null);
    return {
      isValid: !hasQueen,
      reason: hasQueen ? 'Row already contains a queen' : undefined,
    };
  }

  /**
   * Validates column placement
   */
  private validateColumn({ col }: BoardPosition): BoardValidation {
    const hasQueen = this.boardState.some((row) => row[col] !== null);
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
        if (this.colorRegions[r][c] === region && this.boardState[r][c] !== null) {
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
        if (this.boardState[r][c] !== null) {
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
        if (this.boardState[row][col] !== null) {
          queenCount++;
        }
      }
    }

    if (queenCount === Board.BOARD_SIZE) {
      setTimeout(() => {
        alert('Congratulations! You solved the puzzle!');
      }, 500);
    }
  }
}
