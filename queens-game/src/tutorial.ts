interface TutorialState {
    queen?: boolean;
    x?: boolean;
}

interface TutorialStep {
    board: TutorialState[][];
    text: string;
    buttonText: string;
}

export class Tutorial {
    private static readonly BOARD_SIZE = 5;
    private static readonly QUEEN = '♛';
    private static readonly X = 'X';
    private tutorialBoard: HTMLElement;
    private currentStep = 0;

    // Define color regions for the board
    private readonly colorRegions: number[][] = [
        [1, 1, 2, 2, 2],
        [1, 1, 2, 2, 2],
        [1, 2, 2, 3, 3],
        [2, 2, 3, 3, 3],
        [2, 2, 3, 3, 3]
    ];

    private readonly tutorialSteps: TutorialStep[] = [
        {
            board: Array(5).fill(null).map((_) =>
                Array(5).fill(null).map(() => ({}))
            ),
            text: `
              <div class="controls-section">
                <div class="controls-title">Mouse Controls</div>
                <ul class="controls-list">
                  <li>Right-click to place/remove ${Tutorial.QUEEN}s</li>
                  <li>Left-click to mark/unmark squares with ${Tutorial.X}</li>
                </ul>
              </div>

              <div class="controls-section">
                <div class="controls-title">Mobile Controls</div>
                <ul class="controls-list">
                  <li>Tap to mark/unmark squares with ${Tutorial.X}</li>
                  <li>Long-press to place/remove ${Tutorial.QUEEN}s</li>
                </ul>
              </div>

              <div class="mode-section">
                <div class="controls-title">Auto-X Mode</div>
                <div>${Tutorial.X}s are automatically placed on squares attacked by queens</div>
              </div>

              <div class="lets-begin">Let's begin!</div>
            `,
            buttonText: "Got it"
        },
        {
            board: Array(5).fill(null).map((_, row) =>
                Array(5).fill(null).map((_, col) =>
                    row === 0 && col === 0 ? { queen: true } : {}
                )
            ),
            text: `Right-click to place a ${Tutorial.QUEEN} in the top-left blue region.`,
            buttonText: "Show me"
        },
        {
            board: Array(5).fill(null).map((_, row) => 
                Array(5).fill(null).map((_, col) => 
                    row === 0 && col === 0 ? { queen: true } :
                    row === 0 || col === 0 ? { x: true } : {}
                )
            ),
            text: `Each column can only have one ${Tutorial.QUEEN}. Left-click to mark attacked squares with ${Tutorial.X}.`,
            buttonText: "Show me"
        },
        {
            board: Array(5).fill(null).map((_, row) => 
                Array(5).fill(null).map((_, col) => 
                    row === 0 && col === 0 ? { queen: true } :
                    row === 0 || col === 0 || 
                    (row === 1 && col === 1) ? { x: true } : {}
                )
            ),
            text: `${Tutorial.QUEEN}s cannot touch diagonally either. Left-click to mark these squares with ${Tutorial.X}. Right-click to place queens.`,
            buttonText: "Show me"
        },
        {
            board: Array(5).fill(null).map((_, row) => 
                Array(5).fill(null).map((_, col) => {
                    if (row === 0 && col === 0) return { queen: true };
                    if (row === 0 || col === 0 || 
                        (row === 1 && col === 1)) return { x: true };
                    return {};
                })
            ),
            text: `Each color region (blue, green, pink) must have exactly one ${Tutorial.QUEEN}. Right-click to place queens in the remaining regions.`,
            buttonText: "Show me"
        },
        {
            board: Array(5).fill(null).map((_, row) => 
                Array(5).fill(null).map((_, col) => {
                    if (row === 0 && col === 0) return { queen: true }; // Blue region
                    if (row === 2 && col === 4) return { queen: true }; // Green region
                    if (row === 0 || col === 0 || col === 4 ||
                        (row === 1 && col === 1) ||
                        (row === 1 && col === 3) ||
                        (row === 3 && col === 3)) return { x: true };
                    return {};
                })
            ),
            text: `After placing each queen with right-click, use left-click to mark all attacked squares with ${Tutorial.X}. This helps find safe squares for the next queen.`,
            buttonText: "Show me"
        },
        {
            board: Array(5).fill(null).map((_, row) => 
                Array(5).fill(null).map((_, col) => {
                    // Place exactly one queen in each color region
                    if (row === 0 && col === 0) return { queen: true }; // Blue (region 1)
                    if (row === 1 && col === 2) return { queen: true }; // Green (region 2)
                    if (row === 2 && col === 4) return { queen: true }; // Pink (region 3)
                    // Mark all attacked squares with X
                    return { x: true };
                })
            ),
            text: `Here's a complete solution with exactly one ${Tutorial.QUEEN} in each color region. No queens are attacking each other - they don't share rows, columns, or diagonals.`,
            buttonText: "Got it!"
        }
    ];

    constructor() {
        const element = document.querySelector('.tutorial-board');
        if (!element) throw new Error('Tutorial board element not found');
        this.tutorialBoard = element as HTMLElement;
        this.initializeTutorialBoard();
        this.setupTutorialControls();
    }

    private initializeTutorialBoard(): void {
        this.tutorialBoard.innerHTML = '';
        const currentBoard = this.tutorialSteps[this.currentStep].board;

        for (let row = 0; row < Tutorial.BOARD_SIZE; row++) {
            for (let col = 0; col < Tutorial.BOARD_SIZE; col++) {
                const cell = this.createTutorialCell(row, col, currentBoard[row][col]);
                this.tutorialBoard.appendChild(cell);
            }
        }

        // Update tutorial text
        const tutorialText = document.querySelector('.tutorial-text');
        if (tutorialText) {
            tutorialText.innerHTML = this.tutorialSteps[this.currentStep].text;
        }

        // Update button text
        const button = document.querySelector('#close-tutorial');
        if (button) {
            button.textContent = this.tutorialSteps[this.currentStep].buttonText;
        }
    }

    private createTutorialCell(row: number, col: number, state: TutorialState): HTMLElement {
        const cell = document.createElement('div');
        cell.className = `tutorial-cell region-${this.colorRegions[row][col]}`;
        
        if (state.queen) {
            cell.textContent = Tutorial.QUEEN;
            cell.classList.add('valid');
        } else if (state.x) {
            const xMark = document.createElement('span');
            xMark.className = 'x-mark';
            xMark.textContent = Tutorial.X;
            cell.appendChild(xMark);
        }
        
        return cell;
    }

    private setupTutorialControls(): void {
        const button = document.querySelector('#close-tutorial');
        if (!button) return;

        // Create a new button to ensure no duplicate event listeners
        const newButton = button.cloneNode(true) as HTMLElement;
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }

        // Add event listener to the new button
        newButton.addEventListener('click', (e: Event) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.currentStep < this.tutorialSteps.length - 1) {
                this.currentStep++;
                this.initializeTutorialBoard();
            } else {
                const modal = document.querySelector('#tutorial-modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
                this.hide();
                this.currentStep = 0;
            }
        });
    }

    public show(): void {
        this.currentStep = 0;
        this.initializeTutorialBoard();
        this.tutorialBoard.style.display = 'grid';
    }

    public hide(): void {
        this.tutorialBoard.style.display = 'none';
    }
}
