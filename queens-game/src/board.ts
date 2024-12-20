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
  private solution: BoardPosition[] | null = null;

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

    // Load test puzzle
    this.loadPuzzle();
  }

  /**
   * Loads a puzzle from JSON and stores the solution
   */
  private async loadPuzzle(): Promise<void> {
    try {
      const response = await fetch('/puzzles/test-puzzle.json');
      const puzzle = await response.json();
      this.solution = puzzle.queens;
      console.log('Puzzle loaded successfully:', puzzle);
      console.log('Solution stored:', this.solution);
    } catch (error) {
      console.error('Failed to load puzzle:', error);
    }
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

    // Add touch event listeners for mobile devices
    let touchTimeout: number;
    let isTouchMoved = false;
    let touchStartTime = 0;

    cell.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartTime = Date.now();
      isTouchMoved = false;
      
      // Clear any existing timeout
      if (touchTimeout) {
        window.clearTimeout(touchTimeout);
      }

      // Add long-press class after a short delay
      cell.classList.add('long-press');

      // Set a timeout to detect long press
      touchTimeout = window.setTimeout(() => {
        if (!isTouchMoved) {
          cell.classList.remove('long-press');
          this.handleRightClick(position); // This will trigger placeQueen and auto-X
        }
      }, 500);
    });

    cell.addEventListener('touchmove', () => {
      isTouchMoved = true;
      cell.classList.remove('long-press');
    });

    cell.addEventListener('touchend', () => {
      if (touchTimeout) {
        window.clearTimeout(touchTimeout);
      }
      cell.classList.remove('long-press');

      // Handle tap for X markers
      if (!isTouchMoved && (Date.now() - touchStartTime) < 500) {
        this.handleLeftClick(position);
      }
    });

    cell.addEventListener('touchcancel', () => {
      if (touchTimeout) {
        window.clearTimeout(touchTimeout);
      }
      cell.classList.remove('long-press');
      isTouchMoved = false;
    });

    return cell;
  }

  /**
   * Handles left click events (X markers)
   */
  private handleLeftClick(position: BoardPosition): void {
    const { row, col } = position;

    if (this.boardState[row][col] === Board.QUEEN_SYMBOL) {
      // Show feedback that queens are placed with right click
      this.showInvalidPlacement(position, 'Right click to remove queens');
      return;
    }

    if (this.boardState[row][col] === Board.X_SYMBOL) {
      // X exists - remove it
      this.removeX(position);
      return;
    }

    // Check if position is attacked by any queen
    for (let r = 0; r < Board.BOARD_SIZE; r++) {
      for (let c = 0; c < Board.BOARD_SIZE; c++) {
        if (this.boardState[r][c] === Board.QUEEN_SYMBOL) {
          const sameRow = r === row;
          const sameCol = c === col;
          const sameDiagonal = Math.abs(row - r) === Math.abs(col - c);
          const sameRegion = this.colorRegions[r][c] === this.colorRegions[row][col];

          if (sameRow || sameCol || sameDiagonal || sameRegion) {
            this.placeX(position);
            return;
          }
        }
      }
    }

    // Show feedback for why X can't be placed here
    this.showInvalidPlacement(position, 'This square is not attacked by any queen');
  }

  /**
   * Handles right click events (queens)
   */
  private handleRightClick(position: BoardPosition): void {
    const { row, col } = position;
    console.log('Right click at position:', position);

    if (this.boardState[row][col] === Board.QUEEN_SYMBOL) {
      // Remove existing queen
      this.removeQueen(position);
    } else if (this.boardState[row][col] === Board.X_SYMBOL) {
      // Show invalid placement message for X markers
      
      
      this.showInvalidPlacement(
        position,
        'Cannot place queen on attacked square (Left click to remove marker)'
      );


    } else {
      // Try to place new queen on empty square
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
        // Skip queen positions
        if (this.boardState[r][c] === Board.QUEEN_SYMBOL) {
          continue;
        }

        const position = { row: r, col: c };
        // Check if position is attacked by this queen
        const sameRow = r === row;
        const sameCol = c === col;
        const sameDiagonal = Math.abs(row - r) === Math.abs(col - c);
        const sameRegion = this.colorRegions[r][c] === this.colorRegions[row][col];

        if (sameRow || sameCol || sameDiagonal || sameRegion) {
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

    // Store positions of all queens before removal
    const queens: BoardPosition[] = [];
    for (let r = 0; r < Board.BOARD_SIZE; r++) {
      for (let c = 0; c < Board.BOARD_SIZE; c++) {
        if (this.boardState[r][c] === Board.QUEEN_SYMBOL && (r !== row || c !== col)) {
          queens.push({ row: r, col: c });
        }
      }
    }

    // Remove the queen
    this.boardState[row][col] = null;
    const cell = this.getCellElement(position);
    if (cell) {
      cell.innerHTML = '';
      cell.classList.remove('valid');
    }

    if (this.autoXMode) {
      // Clear all X markers
      for (let r = 0; r < Board.BOARD_SIZE; r++) {
        for (let c = 0; c < Board.BOARD_SIZE; c++) {
          if (this.boardState[r][c] === Board.X_SYMBOL) {
            this.removeX({ row: r, col: c });
          }
        }
      }

      // Recalculate X markers for each remaining queen
      queens.forEach((queen) => {
        this.markAttackedSquares(queen);
      });
    }
  }

  /**
   * Shows invalid placement animation and optional tooltip
   */
  private showInvalidPlacement(position: BoardPosition, reason?: string): void {
    const cell = this.getCellElement(position);
    if (cell) {
      cell.classList.add('invalid');

      // Store original content
      const originalContent = cell.innerHTML;

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

      // Remove temporary elements and invalid class, restore original content
      setTimeout(() => {
        cell.classList.remove('invalid');
        cell.innerHTML = originalContent;
      }, 500);
    }
  }

  /**
   * Validates if a queen can be placed at the specified position
   */
  private validateQueenPlacement(position: BoardPosition): BoardValidation {
    const { row, col } = position;

    // Can't place queen on X (attacked square)
    if (this.boardState[row][col] === Board.X_SYMBOL) {
      return {
        isValid: false,
        reason: 'Cannot place queen on attacked square (Left click to remove marker)',
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
   * Checks if the current board state matches the solution
   */
  private checkWinCondition(): void {
    // Get current queen positions
    const currentQueens: BoardPosition[] = [];
    for (let row = 0; row < Board.BOARD_SIZE; row++) {
      for (let col = 0; col < Board.BOARD_SIZE; col++) {
        if (this.boardState[row][col] === Board.QUEEN_SYMBOL) {
          currentQueens.push({ row, col });
        }
      }
    }

    // Check if we have the right number of queens (one per region)
    const uniqueRegions = new Set(this.colorRegions.flat());
    if (currentQueens.length !== uniqueRegions.size) return;

    // Check if each queen is in a unique region
    const queenRegions = new Set();
    for (const queen of currentQueens) {
      const region = this.colorRegions[queen.row][queen.col];
      if (queenRegions.has(region)) return;
      queenRegions.add(region);
    }

    // All queens are placed correctly
    console.log('Puzzle solved!');
    this.showWinAnimation();
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
