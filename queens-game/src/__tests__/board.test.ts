import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Board } from '../board';

describe('Board', () => {
  let board: Board;
  let gameBoard: HTMLElement;

  beforeEach(async () => {
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
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('initializes with empty board state', async () => {
    const cells = gameBoard.querySelectorAll('.cell');
    expect(cells.length).toBe(25); // 5x5 board
    cells.forEach(cell => {
      expect(cell.textContent).toBe('');
    });
  });

  describe('Queen placement', () => {
    it('allows placing a queen on right click', async () => {
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2  // Right click
      });
      const cell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      cell?.dispatchEvent(event);
      
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(cell?.querySelector('.queen')).toBeTruthy();
    });

    it('prevents placing a queen in the same row', async () => {
      // Place first queen
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2  // Right click
      });
      const firstCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      firstCell?.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Try to place second queen in same row
      const secondCell = gameBoard.querySelector('[data-row="0"][data-col="2"]');
      secondCell?.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const queens = gameBoard.querySelectorAll('.queen');
      expect(queens.length).toBe(1);
    });

    it('prevents placing a queen in the same color region', async () => {
      // Place first queen in blue region (top-left)
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        button: 2  // Right click
      });
      const firstCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      firstCell?.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Try to place second queen in same region
      const secondCell = gameBoard.querySelector('[data-row="1"][data-col="0"]');
      secondCell?.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const queens = gameBoard.querySelectorAll('.queen');
      expect(queens.length).toBe(1);
    });
  });

  describe('X marker placement', () => {
    it('automatically places X markers in auto-X mode', async () => {
      // Place a queen
      const rightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true
      });
      const queenCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      queenCell?.dispatchEvent(rightClick);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Check that X markers were automatically placed in attacked positions
      const xMarkers = gameBoard.querySelectorAll('.marked');
      expect(xMarkers.length).toBeGreaterThan(0);
      
      // Verify X in same row
      const sameRowCell = gameBoard.querySelector('[data-row="0"][data-col="1"]');
      expect(sameRowCell?.textContent).toBe('X');
    });

    it('allows manual X marker placement in attacked positions', async () => {
      // Place a queen
      const rightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true
      });
      const queenCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      queenCell?.dispatchEvent(rightClick);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Place X in attacked position (same row)
      const leftClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      const attackedCell = gameBoard.querySelector('[data-row="0"][data-col="1"]');
      attackedCell?.dispatchEvent(leftClick);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(attackedCell?.textContent).toBe('X');
    });

    it('prevents placing X markers in non-attacked positions', async () => {
      // Place a queen
      const rightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true
      });
      const queenCell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      queenCell?.dispatchEvent(rightClick);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Try to place X in non-attacked position
      const leftClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      });
      const safeCell = gameBoard.querySelector('[data-row="4"][data-col="4"]');
      safeCell?.dispatchEvent(leftClick);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(safeCell?.textContent).toBe('');
    });

    it('clears and recalculates X markers when removing a queen in auto-X mode', async () => {
      // Place first queen
      const rightClick = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true
      });
      const firstQueen = gameBoard.querySelector('[data-row="0"][data-col="0"]');
      firstQueen?.dispatchEvent(rightClick);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Place second queen
      const secondQueen = gameBoard.querySelector('[data-row="2"][data-col="2"]');
      secondQueen?.dispatchEvent(rightClick);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Count X markers with both queens
      const initialXMarkers = gameBoard.querySelectorAll('.marked').length;
      expect(initialXMarkers).toBeGreaterThan(0);
      
      // Remove first queen
      firstQueen?.dispatchEvent(rightClick);
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Count X markers after removal
      const finalXMarkers = gameBoard.querySelectorAll('.marked').length;
      expect(finalXMarkers).toBeLessThan(initialXMarkers);
      
      // Verify X markers are still present in cells attacked by remaining queen
      const attackedCell = gameBoard.querySelector('[data-row="2"][data-col="3"]');
      expect(attackedCell?.textContent).toBe('X');
    });
  });
});