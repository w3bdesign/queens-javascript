import { describe, it, expect } from 'vitest';
import { Board } from '../board';

describe('Board', () => {
  it('creates a 5x5 board', () => {
    // Create game board element
    const gameBoard = document.createElement('div');
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

    // Check board size
    const cells = gameBoard.querySelectorAll('.cell');
    expect(cells.length).toBe(25);
  });
});
