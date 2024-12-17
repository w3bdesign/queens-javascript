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
    private currentStep: number = 0;

    private readonly colorRegions: number[][] = [
        [1, 1, 2, 2, 2],
        [1, 1, 2, 3, 2],
        [1, 2, 2, 3, 3],
        [2, 2, 3, 3, 3],
        [2, 2, 3, 3, 3]
    ];

    private readonly tutorialSteps: TutorialStep[] = [
        {
            board: [
                [{ queen: true }, {}, {}, {}, {}],
                [{}, {}, {}, {}, {}],
                [{}, {}, {}, {}, {}],
                [{}, {}, {}, {}, {}],
                [{}, {}, {}, {}, {}]
            ],
            text: `Each row can only have one ${Tutorial.QUEEN}. You can use X to show where ${Tutorial.QUEEN} cannot go.`,
            buttonText: "Show me"
        },
        {
            board: [
                [{ queen: true }, { x: true }, { x: true }, { x: true }, { x: true }],
                [{}, {}, {}, {}, {}],
                [{}, {}, {}, {}, {}],
                [{}, {}, {}, {}, {}],
                [{}, {}, {}, {}, {}]
            ],
            text: `Each column can also only have one ${Tutorial.QUEEN}. Tap to place X and we'll place the other X's for you for now.`,
            buttonText: "Show me"
        },
        {
            board: [
                [{ queen: true }, { x: true }, { x: true }, { x: true }, { x: true }],
                [{ x: true }, {}, {}, {}, {}],
                [{ x: true }, {}, {}, {}, {}],
                [{ x: true }, {}, {}, {}, {}],
                [{ x: true }, {}, {}, {}, {}]
            ],
            text: `${Tutorial.QUEEN} cannot touch each other, not even diagonally. You can use X to mark all cells surrounding ${Tutorial.QUEEN}.`,
            buttonText: "Show me"
        },
        {
            board: [
                [{ queen: true }, { x: true }, { x: true }, { x: true }, { x: true }],
                [{ x: true }, { x: true }, { queen: true }, { x: true }, { x: true }],
                [{ x: true }, { x: true }, { x: true }, { x: true }, { queen: true }],
                [{ x: true }, { queen: true }, { x: true }, { x: true }, { x: true }],
                [{ x: true }, { x: true }, { queen: true }, { x: true }, { x: true }]
            ],
            text: `Here's everything we just learned:<ol>
                <li>Your goal is to have exactly one ${Tutorial.QUEEN} in each row, column, and color region.</li>
                <li>Tap once to place X and tap twice for ${Tutorial.QUEEN}. Use X to mark where ${Tutorial.QUEEN} cannot be placed.</li>
                <li>Two ${Tutorial.QUEEN} cannot touch each other, not even diagonally.</li>
                </ol>`,
            buttonText: "See completed grid"
        },
        {
            board: [
                [{ queen: true }, { x: true }, { x: true }, { x: true }, { x: true }],
                [{ x: true }, { x: true }, { queen: true }, { x: true }, { x: true }],
                [{ x: true }, { x: true }, { x: true }, { x: true }, { queen: true }],
                [{ x: true }, { queen: true }, { x: true }, { x: true }, { x: true }],
                [{ x: true }, { x: true }, { queen: true }, { x: true }, { x: true }]
            ],
            text: "Game on! You're ready to play!",
            buttonText: "Play game"
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

        // Remove any existing event listeners
        button.replaceWith(button.cloneNode(true));
        
        // Get the fresh button reference
        const newButton = document.querySelector('#close-tutorial');
        if (!newButton) return;

        // Add new event listener
        newButton.addEventListener('click', (e: Event) => {
            e.preventDefault(); // Prevent any default button behavior

            if (this.currentStep < this.tutorialSteps.length - 1) {
                // Move to next step
                this.currentStep++;
                this.initializeTutorialBoard();
            } else {
                // On final step, close the tutorial
                const modal = document.querySelector('#tutorial-modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
                this.hide();
                this.currentStep = 0; // Reset for next time
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
