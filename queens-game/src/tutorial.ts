export class Tutorial {
    private tutorialBoard: HTMLElement;
    private readonly QUEEN = '♛';
    private readonly BOARD_SIZE = 5;

    constructor() {
        const element = document.querySelector('.tutorial-board');
        if (!element) throw new Error('Tutorial board element not found');
        this.tutorialBoard = element as HTMLElement;
        this.createTutorialBoard();
    }

    private createTutorialBoard(): void {
        const exampleBoard = [
            [this.QUEEN, '', '', '', ''],
            ['', '', this.QUEEN, '', ''],
            ['', '', '', '', this.QUEEN],
            ['', this.QUEEN, '', '', ''],
            ['', '', '', this.QUEEN, '']
        ];

        this.tutorialBoard.innerHTML = '';

        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'tutorial-cell';
                
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