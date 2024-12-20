#!/usr/bin/env node

const BOARD_SIZE = 5;

// Different region layout patterns
const REGION_LAYOUTS = [
  // Original layout
  [
    [1, 1, 2, 2, 2],
    [1, 1, 2, 2, 2],
    [1, 2, 2, 3, 3],
    [2, 2, 3, 3, 3],
    [2, 2, 3, 3, 3],
  ],
  // L-shaped regions
  [
    [1, 1, 2, 2, 2],
    [1, 1, 2, 2, 2],
    [1, 3, 2, 2, 2],
    [3, 3, 3, 2, 2],
    [3, 3, 3, 3, 2],
  ],
  // Diagonal regions
  [
    [1, 1, 1, 2, 2],
    [1, 1, 2, 2, 2],
    [1, 2, 2, 2, 3],
    [2, 2, 2, 3, 3],
    [2, 2, 3, 3, 3],
  ],
];

/**
 * Rotates a region layout 90 degrees clockwise
 */
function rotateLayout(layout) {
  const size = layout.length;
  const rotated = Array(size).fill().map(() => Array(size).fill(0));
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      rotated[j][size - 1 - i] = layout[i][j];
    }
  }
  
  return rotated;
}

/**
 * Flips a region layout horizontally
 */
function flipLayout(layout) {
  return layout.map(row => [...row].reverse());
}

/**
 * Gets a random region layout with possible rotation/flip
 */
function getRandomLayout() {
  // Pick a random base layout
  const baseLayout = REGION_LAYOUTS[Math.floor(Math.random() * REGION_LAYOUTS.length)];
  let layout = baseLayout.map(row => [...row]);
  
  // Randomly rotate 0-3 times
  const rotations = Math.floor(Math.random() * 4);
  for (let i = 0; i < rotations; i++) {
    layout = rotateLayout(layout);
  }
  
  // 50% chance to flip
  if (Math.random() < 0.5) {
    layout = flipLayout(layout);
  }
  
  return layout;
}

/**
 * Checks if a queen can be placed at the given position
 */
function isValidPosition(queens, row, col, regions) {
  // Check each existing queen
  for (const queen of queens) {
    // Same row or column
    if (queen.row === row || queen.col === col) return false;

    // Diagonal check
    if (Math.abs(queen.row - row) === Math.abs(queen.col - col)) return false;

    // Same color region
    if (regions[queen.row][queen.col] === regions[row][col]) return false;
  }

  return true;
}

/**
 * Recursively tries to place queens to generate a valid puzzle
 */
function generatePuzzle(queens = [], row = 0, regions) {
  // Base case: if we have one queen in each unique region
  const uniqueRegions = new Set(regions.flat());
  if (queens.length === uniqueRegions.size) {
    return queens;
  }

  // Try each position in the current row
  for (let col = 0; col < BOARD_SIZE; col++) {
    if (isValidPosition(queens, row, col, regions)) {
      queens.push({ row, col });
      
      // Try next row
      const result = generatePuzzle(queens, row + 1, regions);
      if (result) return result;
      
      // Backtrack if no solution found
      queens.pop();
    }
  }

  // If we've tried all positions in this row, try the next row
  if (row < BOARD_SIZE - 1) {
    return generatePuzzle(queens, row + 1, regions);
  }

  return null;
}

/**
 * Validates a complete puzzle solution
 */
function validatePuzzle(queens, regions) {
  // Check we have the correct number of queens
  const uniqueRegions = new Set(regions.flat());
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
      if (regions[q1.row][q1.col] === regions[q2.row][q2.col]) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Formats the puzzle solution for output
 */
function formatPuzzle(queens, regions) {
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
    regions
  };
}

/**
 * Checks if a puzzle is unique compared to existing puzzles
 */
function isPuzzleUnique(newPuzzle, existingPuzzles) {
  return !existingPuzzles.some(existing => {
    const existingQueens = new Set(existing.queens.map(q => `${q.row},${q.col}`));
    const newQueens = new Set(newPuzzle.map(q => `${q.row},${q.col}`));
    
    // Check if they have the same queen positions
    if (existingQueens.size !== newQueens.size) return false;
    for (const pos of existingQueens) {
      if (!newQueens.has(pos)) return false;
    }
    return true;
  });
}

// Generate 10 unique puzzles with different layouts
const numPuzzles = 10;
const puzzles = [];
let attempts = 0;
const maxAttempts = 1000; // Prevent infinite loop

while (puzzles.length < numPuzzles && attempts < maxAttempts) {
  const regions = getRandomLayout();
  const puzzle = generatePuzzle([], 0, regions);
  if (puzzle && validatePuzzle(puzzle, regions) && isPuzzleUnique(puzzle, puzzles)) {
    puzzles.push(formatPuzzle(puzzle, regions));
  }
  attempts++;
}

// Add puzzle numbers to whatever puzzles we generated
const puzzlesWithNumbers = puzzles.map((puzzle, index) => ({
  ...puzzle,
  number: index + 1
}));

// Always output valid JSON, even if we didn't get all puzzles
console.log(JSON.stringify({
  count: puzzles.length,
  puzzles: puzzlesWithNumbers
}, null, 2));
