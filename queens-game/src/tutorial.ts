export class Tutorial {
    private static readonly BOARD_SIZE = 5;
    private static readonly QUEEN = '♛';
    private tutorialBoard: HTMLElement;

    // Define color regions for the tutorial board
    private readonly colorRegions: number[][] = [
        [1, 1, 2, 2, 2],
        [1, 1, 2, 3, 2],
        [1, 2, 2, 3, 3],
        [2, 2, 3, 3, 3],
        [2, 2, 3, 3, 3]
    ];

    constructor() {
        const element = document.querySelector('.tutorial-board');
        if (!element) throw new Error('Tutorial board element not found');
        this.tutorialBoard = element as HTMLElement;
        this.initializeTutorialBoard();
    }

    private initializeTutorialBoard(): void {
        const exampleBoard = [
            [Tutorial.QUEEN, '', '', '', ''],
            ['', '', Tutorial.QUEEN, '', ''],
            ['', '', '', '', Tutorial.QUEEN],
            ['', Tutorial.QUEEN, '', '', ''],
            ['', '', '', Tutorial.QUEEN, '']
        ];

        this.tutorialBoard.innerHTML = '';

        for (let row = 0; row < Tutorial.BOARD_SIZE; row++) {
            for (let col = 0; col < Tutorial.BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = `tutorial-cell region-${this.colorRegions[row][col]}`;
                
                if (exampleBoard[row][col]) {
                    cell.textContent = exampleBoard[row][col];
                    cell.classList.add('valid');
                }

                this.tutorialBoard.appendChild(cell);
            }
        }
    }

    public show(): void {
        this.tutorialBoard.style.display = 'grid';
    }

    public hide(): void {
        this.tutorialBoard.style.display = 'none';
    }
}
