// script.js

let playerName = localStorage.getItem('playerName') || '';

// Show modal only if no name saved yet
window.addEventListener('load', () => {
  if (!playerName) {
    document.getElementById('name-modal').style.display = 'flex';
  } else {
    // Optional: greet returning player
    showMessage(`Welcome back, ${playerName}... the door awaits.`);
  }
});

// Submit name
document.getElementById('submit-name').addEventListener('click', () => {
  const input = document.getElementById('player-name').value.trim();
  if (input) {
    playerName = input;
    localStorage.setItem('playerName', playerName);
    document.getElementById('name-modal').style.display = 'none';
    showMessage(`Welcome, ${playerName}. The Institute has been expecting you since 4/20/1999...`);
  } else {
    alert("The dentist requires a name.");
  }
});

// Simple message function (used everywhere in game)
function showMessage(text) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.classList.add('show');
  setTimeout(() => msg.classList.remove('show'), 5000); // hide after 5s
}

// Door click → next room (replace with your navigation logic)
function goToNextRoom() {
  if (!playerName) {
    showMessage("The door won't budge... maybe you need to sign in first?");
    return;
  }
  // For multi-page: window.location = 'hall.html';
  // Or single-page: hide index scene, show next scene
  showMessage(`Alright ${playerName}, let's see what's inside...`);
  // Example: window.location.href = 'hall.html';
}
