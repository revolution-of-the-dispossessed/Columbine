// script.js

// Use const/let properly; initialize once
let playerName = localStorage.getItem('playerName') || '';

// Cache DOM elements for better performance (small but good habit)
const nameModal = document.getElementById('name-modal');
const playerInput = document.getElementById('player-name');
const submitBtn = document.getElementById('submit-name');
const messageEl = document.getElementById('message');

// Show modal on load only if no name saved
window.addEventListener('load', () => {
  if (!playerName) {
    if (nameModal) nameModal.style.display = 'flex';
  } else {
    // Optional greet — but only if message element exists
    if (messageEl) {
      showMessage(`Welcome back, ${playerName}!`);
    }
  }
});

// Submit name (use form submit event instead of button click — better UX, Enter key works)
const nameForm = document.getElementById('name-form'); // Add <form id="name-form"> in HTML if not there yet
if (nameForm) {
  nameForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload
    const input = playerInput.value.trim();
    if (input) {
      playerName = input;
      localStorage.setItem('playerName', playerName);
      if (nameModal) nameModal.style.display = 'none';
      showMessage(`Welcome, ${playerName}. The campus is eerily quiet. You can't quite shake the feeling like something is off...`);
    } else {
      alert("You require identification."); // Or replace with nicer in-page error
    }
  });
} else {
  // Fallback if no form: keep old button listener
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const input = playerInput.value.trim();
      if (input) {
        playerName = input;
        localStorage.setItem('playerName', playerName);
        if (nameModal) nameModal.style.display = 'none';
        showMessage(`Welcome, ${playerName}. The campus is eerily quiet. You can't quite shake the feeling like something is off...`);
      } else {
        alert("The dentist requires a name.");
      }
    });
  }
}

// Message display function — add safety check
function showMessage(text) {
  if (!messageEl) return; // Prevent errors if element missing
  messageEl.textContent = text;
  messageEl.classList.add('show');
  setTimeout(() => {
    messageEl.classList.remove('show');
  }, 5000); // 5 seconds — consider making configurable later
}

// Door navigation
function goToNextRoom() {
  if (!playerName) {
    showMessage("The door won't budge... maybe it's locked from the inside?");
    return;
  }

  showMessage("It looks like there are people inside, but they aren't moving.);

  // Decide navigation style:
  // Option A: Multi-page game (recommended for simplicity right now)
  // window.location.href = 'hall.html';  // Uncomment when hall.html exists

  // Option B: Single-page app style (hide current scene, show next)
  // const currentScene = document.getElementById('scene-index');
  // if (currentScene) currentScene.classList.add('hidden');
  // const nextScene = document.getElementById('scene-hall'); // Add in HTML
  // if (nextScene) nextScene.classList.remove('hidden');
}
