import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../board';

describe('Board', () => {
  let board: Board;
  let gameBoard: HTMLElement;

  beforeEach(() => {
    // Create game board element
    gameBoard = document.createElement('div');
    gameBoard.id = 'game-board';
    document.body.appendChild(gameBoard);

    // Initialize board
    board = new Board();
  });

  it('initializes with empty board state', () => {
    const cells = gameBoard.querySelectorAll('.cell');
    expect(cells.length).toBe(25); // 5x5 board
    cells.forEach(cell => {
      expect(cell.textContent).toBe('');
    });
  });
});