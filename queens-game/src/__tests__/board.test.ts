import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Board } from '../board';

describe('Board', () => {
  let board: Board;
  let gameBoard: HTMLElement;

  const setupGameBoard = async () => {
    // Clean up any existing elements
    document.body.innerHTML = '';

    // Create game board element
    gameBoard = document.createElement('div');
    gameBoard.id = 'game-board';
    document.body.appendChild(gameBoard);

    // Create auto-X toggle
    const toggle = document.createElement('input');
    toggle.id = 'auto-x-toggle';
    toggle.type = 'checkbox';
    toggle.checked = true;
    document.body.appendChild(toggle);

    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    // Initialize board
    board = new Board();

    // Wait for any DOM updates
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  beforeEach(async () => {
    await setupGameBoard();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('initializes with empty board state', async () => {
    const cells = gameBoard.querySelectorAll('.cell');
    expect(cells.length).toBe(25); // 5x5 board
    cells.forEach((cell) => {
      expect(cell.textContent).toBe('');
    });
  });

  describe('Queen placement', () => {
    it('allows placing a queen on right click', async () => {
      const queenRightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2, // Right click
      });
      queenRightClick.preventDefault = () => {}; // Mock preventDefault
      const cell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      cell?.dispatchEvent(queenRightClick);

      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time
      expect(cell?.querySelector('.queen')).toBeTruthy();
    });

    it('prevents placing a queen in the same row', async () => {
      it('prevents placing a queen in the same row', async () => {
        // Place first queen
        const event1 = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          button: 2  // Right click
        });
        event1.preventDefault = () => {}; // Mock preventDefault
        event1.stopPropagation = () => {}; // Mock stopPropagation
        const firstCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
        firstCell?.dispatchEvent(event1);
        await new Promise(resolve => setTimeout(resolve, 100)); // Increase wait time
        
        // Try to place second queen in same row
        const event2 = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          button: 2  // Right click
        });
        event2.preventDefault = () => {}; // Mock preventDefault
        event2.stopPropagation = () => {}; // Mock stopPropagation
        const secondCell = gameBoard.querySelector('[data-row="0"][data-col="2"]');
        secondCell?.dispatchEvent(event2);
        await new Promise(resolve => setTimeout(resolve, 100)); // Increase wait time
        
        const queens = gameBoard.querySelectorAll('.queen');
        expect(queens.length).toBe(1);
      });
    it('prevents placing a queen in the same color region', async () => {
      // Place first queen in blue region (top-left)
      const firstQueenRightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2, // Right click
      });
      firstQueenRightClick.preventDefault = () => {}; // Mock preventDefault
      const firstCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      firstCell?.dispatchEvent(firstQueenRightClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      // Try to place second queen in same region
      const secondQueenRightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2, // Right click
      });
      secondQueenRightClick.preventDefault = () => {}; // Mock preventDefault
      const secondCell = gameBoard.querySelector('[data-row="1"][data-col="0"]');
      secondCell?.dispatchEvent(secondQueenRightClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      const queens = gameBoard.querySelectorAll('.queen');
      expect(queens.length).toBe(1);
    });
  });

  describe('X marker placement', () => {
    it('automatically places X markers in auto-X mode', async () => {
      // Place a queen
      const queenRightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2, // Right click
      });
      queenRightClick.preventDefault = () => {}; // Mock preventDefault
      const queenCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      queenCell?.dispatchEvent(queenRightClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      // Check that X markers were automatically placed in attacked positions
      const xMarkers = gameBoard.querySelectorAll('.marked');
      expect(xMarkers.length).toBeGreaterThan(0);

      // Verify X in same row
    });

    it('allows manual X marker placement in attacked positions', async () => {
      // Place a queen
      const queenRightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2, // Right click
      });
      queenRightClick.preventDefault = () => {}; // Mock preventDefault
      const queenCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      queenCell?.dispatchEvent(queenRightClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      // Place X in attacked position (same row)
      const xMarkerLeftClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 0, // Left click
      });
      xMarkerLeftClick.preventDefault = () => {}; // Mock preventDefault
      const attackedCell = gameBoard.querySelector('[data-row="0"][data-col="1"]');
      attackedCell?.dispatchEvent(xMarkerLeftClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      expect(attackedCell?.textContent).toBe('X');
    });

    it('prevents placing X markers in non-attacked positions', async () => {
      // Place a queen
      const queenRightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2, // Right click
      });
      queenRightClick.preventDefault = () => {}; // Mock preventDefault
      const queenCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      queenCell?.dispatchEvent(queenRightClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      // Try to place X in non-attacked position
      const xMarkerLeftClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 0, // Left click
      });
      xMarkerLeftClick.preventDefault = () => {}; // Mock preventDefault
      const safeCell = gameBoard.querySelector('[data-row="4"][data-col="4"]');
      safeCell?.dispatchEvent(xMarkerLeftClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      expect(safeCell?.textContent).toBe('');
    });

    it('clears and recalculates X markers when removing a queen in auto-X mode', async () => {
      // Place first queen
      const firstQueenRightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2, // Right click
      });
      firstQueenRightClick.preventDefault = () => {}; // Mock preventDefault
      const firstQueen = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      firstQueen?.dispatchEvent(firstQueenRightClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      // Place second queen
      const secondQueenRightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2, // Right click
      });
      secondQueenRightClick.preventDefault = () => {}; // Mock preventDefault
      const secondQueen = gameBoard.querySelector('[data-row="2"][data-col="2"]');
      secondQueen?.dispatchEvent(secondQueenRightClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      // Count X markers with both queens
      const initialXMarkers = gameBoard.querySelectorAll('.marked').length;
      expect(initialXMarkers).toBeGreaterThan(0);

      // Remove first queen by right clicking again
      firstQueen?.dispatchEvent(firstQueenRightClick);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Increase wait time

      // Count X markers after removal
      const finalXMarkers = gameBoard.querySelectorAll('.marked').length;
      expect(finalXMarkers).toBeLessThan(initialXMarkers);

      // Verify X markers are still present in cells attacked by remaining queen
      const attackedCell = gameBoard.querySelector('[data-row="2"][data-col="3"]');
      expect(attackedCell?.textContent).toBe('X');
    });
  });
});
