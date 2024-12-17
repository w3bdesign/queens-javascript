import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Board } from '../board';

describe('Board', () => {
  let gameBoard: HTMLElement;

  beforeEach(() => {
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

  it('places a queen on right click', async () => {
    const cell = gameBoard.querySelector('[data-row="0"][data-col="0"]');
    const rightClick = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      button: 2
    });
    rightClick.preventDefault = () => {};
    
    cell?.dispatchEvent(rightClick);
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(cell?.querySelector('.queen')).toBeTruthy();
  });
});
