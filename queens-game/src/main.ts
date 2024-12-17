import './style.css';
import { Board } from './board';
import { Tutorial } from './tutorial';

document.addEventListener('DOMContentLoaded', (): void => {
  try {
    // Initialize game components
    new Board(); // We don't need to store the instance since we're not using it directly
    const tutorial = new Tutorial();

    // Get DOM elements with type assertions and null checks
    const tutorialBtn = document.getElementById('tutorial-btn');
    const closeTutorialBtn = document.getElementById('close-tutorial');
    const tutorialModal = document.getElementById('tutorial-modal');

    if (!tutorialBtn || !closeTutorialBtn || !tutorialModal) {
      throw new Error('Required DOM elements not found');
    }

    // Setup event listeners
    tutorialBtn.addEventListener('click', (): void => {
      tutorialModal.classList.remove('hidden');
      tutorial.show();
    });

    closeTutorialBtn.addEventListener('click', (): void => {
      tutorialModal.classList.add('hidden');
      tutorial.hide();
    });
  } catch (error) {
    // Type assertion for error object
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to initialize game:', errorMessage);
  }
});
