#!/usr/bin/env node

// Color regions layout from the game
const COLOR_REGIONS = [
  [1, 1, 2, 2, 2],
  [1, 1, 2, 2, 2],
  [1, 2, 2, 3, 3],
  [2, 2, 3, 3, 3],
  [2, 2, 3, 3, 3],
];

const BOARD_SIZE = 5;

/**
 * Checks if a queen can be placed at the given position
 */
function isValidPosition(queens, row, col) {
  // Check each existing queen
  for (const queen of queens) {
    // Same row or column
    if (queen.row === row || queen.col === col) return false;

    // Diagonal check
    if (Math.abs(queen.row - row) === Math.abs(queen.col - col)) return false;

    // Same color region
    if (COLOR_REGIONS[queen.row][queen.col] === COLOR_REGIONS[row][col]) return false;
  }

  return true;
}

/**
 * Recursively tries to place queens to generate a valid puzzle
 */
function generatePuzzle(queens = [], row = 0) {
  // Base case: if we have one queen in each unique region
  const uniqueRegions = new Set(COLOR_REGIONS.flat());
  if (queens.length === uniqueRegions.size) {
    return queens;
  }

  // Try each position in the current row
  for (let col = 0; col < BOARD_SIZE; col++) {
    if (isValidPosition(queens, row, col)) {
      queens.push({ row, col });
      
      // Try next row
      const result = generatePuzzle(queens, row + 1);
      if (result) return result;
      
      // Backtrack if no solution found
      queens.pop();
    }
  }

  // If we've tried all positions in this row, try the next row
  if (row < BOARD_SIZE - 1) {
    return generatePuzzle(queens, row + 1);
  }

  return null;
}

/**
 * Validates a complete puzzle solution
 */
function validatePuzzle(queens) {
  // Check we have the correct number of queens
  const uniqueRegions = new Set(COLOR_REGIONS.flat());
  if (queens.length !== uniqueRegions.size) {
    return false;
  }

  // Check each queen against every other queen
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const q1 = queens[i];
      const q2 = queens[j];

      // Check same row/column
      if (q1.row === q2.row || q1.col === q2.col) {
        return false;
      }

      // Check diagonals
      if (Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col)) {
        return false;
      }

      // Check same region
      if (COLOR_REGIONS[q1.row][q1.col] === COLOR_REGIONS[q2.row][q2.col]) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Formats the puzzle solution for output
 */
function formatPuzzle(queens) {
  // Create empty board
  const board = Array(BOARD_SIZE).fill('.').map(() => Array(BOARD_SIZE).fill('.'));
  
  // Place queens
  queens.forEach(({row, col}) => {
    board[row][col] = 'Q';
  });

  // Format as string
  const boardStr = board.map(row => row.join(' ')).join('\n');
  
  return {
    queens,
    board: boardStr,
    regions: COLOR_REGIONS
  };
}

// Generate puzzles
const numPuzzles = 1; // Can be increased later for multiple puzzles
const puzzles = [];

for (let i = 0; i < numPuzzles; i++) {
  const puzzle = generatePuzzle();
  if (puzzle && validatePuzzle(puzzle)) {
    puzzles.push(formatPuzzle(puzzle));
  }
}

if (puzzles.length > 0) {
  console.log(JSON.stringify(puzzles, null, 2));
} else {
  console.error('Failed to generate valid puzzles');
}
