import confetti from 'canvas-confetti';

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
  private boardState: CellState[][];
  private boardElement: HTMLElement;
  private autoXMode: boolean = true;

  private readonly colorRegions: number[][] = [
    [1, 1, 2, 2, 2],
    [1, 1, 2, 2, 2],
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

    // Set up auto-X toggle listener
    const toggle = document.getElementById('auto-x-toggle') as HTMLInputElement;
    if (toggle) {
      this.autoXMode = toggle.checked;
      toggle.addEventListener('change', () => {
        this.autoXMode = toggle.checked;
      });
    }

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

    // Add left click handler for X markers
    cell.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleLeftClick(position);
    });

    // Add right click handler for queens
    cell.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleRightClick(position);
    });

    return cell;
  }

  /**
   * Handles left click events (X markers)
   */
  private handleLeftClick(position: BoardPosition): void {
    const { row, col } = position;

    if (this.boardState[row][col] === null) {
      // Empty cell - try to place X
      if (this.isValidXPlacement(position)) {
        this.placeX(position);
      } else {
        // Show feedback for why X can't be placed here
        this.showInvalidPlacement(position, 'This square is not attacked by any queen');
      }
    } else if (this.boardState[row][col] === Board.X_SYMBOL) {
      // X exists - remove it
      this.removeX(position);
    } else if (this.boardState[row][col] === Board.QUEEN_SYMBOL) {
      // Show feedback that queens are placed with right click
      this.showInvalidPlacement(position, 'Right click to remove queens');
    }
  }

  /**
   * Handles right click events (queens)
   */
  private handleRightClick(position: BoardPosition): void {
    const { row, col } = position;

    if (this.boardState[row][col] === Board.QUEEN_SYMBOL) {
      // Remove existing queen
      this.removeQueen(position);
    } else {
      // Try to place new queen
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
   * Checks if a position can have an X placed on it.
   * A position is valid for X if it's attacked by any queen (same row, column, diagonal, or color region).
   */
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
          // Position is attacked if:
          const sameRow = r === row; // Queen in same row
          const sameCol = c === col; // Queen in same column
          const sameDiagonal = Math.abs(row - r) === Math.abs(col - c); // Queen on diagonal
          const sameRegion = this.colorRegions[r][c] === this.colorRegions[row][col]; // Queen in same region

          if (sameRow || sameCol || sameDiagonal || sameRegion) {
            return true; // Position is attacked, can place X
          }
        }
      }
    }

    return false; // Position is not attacked by any queen
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

    // Automatically mark attacked squares if auto-X mode is enabled
    if (this.autoXMode) {
      this.markAttackedSquares(position);
    }
  }

  /**
   * Automatically marks all squares attacked by a queen with X
   */
  private markAttackedSquares(queenPosition: BoardPosition): void {
    const { row, col } = queenPosition;

    // Check each cell on the board
    for (let r = 0; r < Board.BOARD_SIZE; r++) {
      for (let c = 0; c < Board.BOARD_SIZE; c++) {
        // Skip the queen's position and already marked positions
        if ((r === row && c === col) || this.boardState[r][c] !== null) {
          continue;
        }

        const position = { row: r, col: c };
        // If the position can have an X placed, place it
        if (this.isValidXPlacement(position)) {
          this.placeX(position);
        }
      }
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
        reason: 'Cannot place queen on an X marker',
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
      this.showWinAnimation();
    }
  }

  /**
   * Shows winning animation with confetti and toast
   */
  private showWinAnimation(): void {
    // Create and show toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'Congratulations! You solved the puzzle! 👑';
    const container = document.getElementById('toast-container');
    if (container) {
      container.appendChild(toast);
      setTimeout(() => container.removeChild(toast), 3000);
    }

    // Trigger confetti animation
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#f1c40f', '#e74c3c', '#2ecc71', '#3498db'],
    };

    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    };

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }
}
