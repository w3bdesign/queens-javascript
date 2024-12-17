import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Board } from '../board';

describe('Board', () => {
  let gameBoard: HTMLElement;

  beforeEach(() => {
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
    new Board();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('creates a 5x5 board', () => {
    const cells = gameBoard.querySelectorAll('.cell');
    expect(cells.length).toBe(25);
  });

  it('initializes with empty cells', () => {
    const cells = gameBoard.querySelectorAll('.cell');
    cells.forEach(cell => {
      expect(cell.textContent).toBe('');
    });
  });
});