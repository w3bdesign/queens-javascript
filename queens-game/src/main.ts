import './style.css';
import { Board } from './board';
import { Tutorial } from './tutorial';

window.addEventListener('load', (): void => {
    try {
        // Initialize game components
        new Board();
        const tutorial = new Tutorial();

        // Get DOM elements with type assertions and null checks
        const tutorialBtn = document.getElementById('tutorial-btn');
        const tutorialModal = document.getElementById('tutorial-modal');

        if (!tutorialBtn || !tutorialModal) {
            throw new Error('Required DOM elements not found');
        }

        // Setup tutorial button
        tutorialBtn.addEventListener('click', (): void => {
            tutorialModal.classList.remove('hidden');
            tutorial.show();
        });

    } catch (error) {
        // Type assertion for error object
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Failed to initialize game:', errorMessage);
    }
});
