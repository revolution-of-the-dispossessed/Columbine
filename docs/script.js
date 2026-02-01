/* ============================================
   MYSTERY ADVENTURE — GAME ENGINE (90s ver.)
   ============================================
   
   HOW TO USE:
   -----------
   1. Define rooms in the ROOMS object below.
   2. Each room has:
        - hint:  the scrolling marquee text
        - zones: an array of clickable hotspots
   3. Each zone has:
        - id, label, x, y, w, h  (position & size as % of viewport)
        - action: "popup" | "navigate"
        - For "popup"   → popupTitle, popupBody, popupImage (optional), popupButtons (optional)
        - For "navigate" → target (the room key to go to)
   
   ADDING A NEW ROOM:
   ------------------
   Add a key to ROOMS, add a <div class="room" id="yourkey"> in HTML
   with a background-image style, and define its zones here.
   ============================================ */

// ─── GAME STATE ───────────────────────────────────────────────

const GameState = {
  currentRoom: 'entrance',
  inventory:   [],
  flags:       {}
};

// ─── ROOM DEFINITIONS ─────────────────────────────────────────

const ROOMS = {

  entrance: {
    hint: '★ Something feels wrong about this old manor. Look around carefully. ★',
    zones: [
      {
        id:    'door-to-hallway',
        label: 'Hallway',
        x: 42, y: 55, w: 16, h: 30,
        action: 'navigate',
        target: 'hallway'
      },
      {
        id:    'coat-rack',
        label: 'Coat Rack',
        x: 8,  y: 35, w: 12, h: 40,
        action: 'popup',
        popupTitle: 'Coat Rack',
        popupBody:  'A row of dusty coats hangs here. One of them looks newer than the others — and heavier.',
        popupImage: null
      },
      {
        id:    'grandfather-clock',
        label: 'Clock',
        x: 78, y: 30, w: 10, h: 50,
        action: 'popup',
        popupTitle: 'Grandfather Clock',
        popupBody:  'The clock stopped at 3:17. The pendulum hangs perfectly still, as if frozen mid-swing.'
      }
    ]
  },

  hallway: {
    hint: '★ A long hallway stretches before you. Portraits line the walls. ★',
    zones: [
      {
        id:    'back-to-entrance',
        label: 'Back',
        x: 2,  y: 70, w: 12, h: 20,
        action: 'navigate',
        target: 'entrance'
      },
      {
        id:    'portrait-left',
        label: 'Portrait',
        x: 15, y: 20, w: 18, h: 45,
        action: 'popup',
        popupTitle: 'Portrait of a Woman',
        popupBody:  'Her eyes seem to follow you. A small plaque beneath reads: "Eleanor, 1923 – 1941."'
      },
      {
        id:    'door-to-library',
        label: 'Library',
        x: 70, y: 50, w: 20, h: 40,
        action: 'navigate',
        target: 'library'
      }
    ]
  },

  library: {
    hint: '★ Dust motes float in a sliver of moonlight. One book looks out of place. ★',
    zones: [
      {
        id:    'back-to-hallway',
        label: 'Back',
        x: 2,  y: 70, w: 12, h: 20,
        action: 'navigate',
        target: 'hallway'
      },
      {
        id:    'odd-book',
        label: 'Strange Book',
        x: 55, y: 25, w: 10, h: 35,
        action: 'popup',
        popupTitle: 'A Strange Book',
        popupBody:  'The spine is unmarked. You pull it out — the pages are filled with hand-drawn maps and a single phrase repeated: "The door is not where you think."',
        popupImage: null
      },
      {
        id:    'fireplace',
        label: 'Fireplace',
        x: 30, y: 45, w: 25, h: 40,
        action: 'popup',
        popupTitle: 'Cold Fireplace',
        popupBody:  'Ashes. But mixed in with them — a scrap of burnt paper. You can just make out the word: "KEY".',
        popupButtons: [
          { label: 'Take the scrap', action: 'takeBurntPaper' }
        ]
      }
    ]
  }
};

// ─── DOM REFERENCES ───────────────────────────────────────────

const hintMarquee   = document.getElementById('hint-marquee');
const gameViewport  = document.getElementById('game-viewport');
const popupOverlay  = document.getElementById('popup-overlay');
const popup         = document.getElementById('popup');
const popupClose    = document.getElementById('popup-close');
const popupTitle    = document.getElementById('popup-title');
const popupBody     = document.getElementById('popup-body');
const popupImage    = document.getElementById('popup-image');
const popupButtons  = document.getElementById('popup-buttons');
const loadingScreen = document.getElementById('loading-screen');
const loadingBar    = document.getElementById('loading-bar-track');

// ─── MARQUEE HELPER ───────────────────────────────────────────
// Resets the marquee animation so the new text scrolls from the right.

function setHint(text) {
  hintMarquee.textContent = text;
  // Force animation restart by toggling
  hintMarquee.style.animation = 'none';
  void hintMarquee.offsetWidth; // reflow
  hintMarquee.style.animation = '';
}

// ─── LOADING BAR HELPER ───────────────────────────────────────
// Rebuilds the loading blocks so the staggered fill animation re-runs.

function resetLoadingBar() {
  loadingBar.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const block = document.createElement('div');
    block.className = 'loading-block';
    loadingBar.appendChild(block);
  }
}

// ─── ROOM NAVIGATION ──────────────────────────────────────────

function goToRoom(roomKey) {
  const roomData = ROOMS[roomKey];
  if (!roomData) {
    console.warn(`Room "${roomKey}" is not defined.`);
    return;
  }

  // Show loading screen with fresh bar animation
  resetLoadingBar();
  loadingScreen.classList.remove('hidden');

  setTimeout(() => {
    // Deactivate all rooms
    document.querySelectorAll('.room').forEach(r => r.classList.remove('active'));

    // Activate target room
    const roomEl = document.getElementById(roomKey);
    if (roomEl) roomEl.classList.add('active');

    // Update marquee hint
    setHint(roomData.hint);

    // Build zones
    renderZones(roomKey, roomData.zones);

    // Update state
    GameState.currentRoom = roomKey;

    // Hide loading after a beat
    setTimeout(() => loadingScreen.classList.add('hidden'), 450);
  }, 400);
}

// ─── ZONE RENDERING ───────────────────────────────────────────

function renderZones(roomKey, zones) {
  const roomEl = document.getElementById(roomKey);
  if (!roomEl) return;

  // Clear old zones
  roomEl.querySelectorAll('.click-zone').forEach(z => z.remove());

  zones.forEach(zone => {
    const el = document.createElement('div');
    el.className = 'click-zone';
    el.id = zone.id;

    el.style.left   = zone.x + '%';
    el.style.top    = zone.y + '%';
    el.style.width  = zone.w + '%';
    el.style.height = zone.h + '%';

    // Label
    const label = document.createElement('span');
    label.className = 'zone-label';
    label.textContent = zone.label;
    el.appendChild(label);

    // Click
    el.addEventListener('click', () => handleZoneClick(zone));

    roomEl.appendChild(el);
  });
}

// ─── CLICK HANDLING ───────────────────────────────────────────

function handleZoneClick(zone) {
  if (zone.action === 'navigate') {
    closePopup();
    goToRoom(zone.target);
  } else if (zone.action === 'popup') {
    openPopup(zone);
  }
}

// ─── POPUP SYSTEM ─────────────────────────────────────────────

function openPopup(zone) {
  popupTitle.textContent = zone.popupTitle || 'Examine';
  popupBody.innerHTML    = zone.popupBody  || '';

  // Image
  if (zone.popupImage) {
    popupImage.src           = zone.popupImage;
    popupImage.style.display = 'block';
  } else {
    popupImage.style.display = 'none';
  }

  // Buttons — clear old, add new
  popupButtons.innerHTML = '';
  if (zone.popupButtons) {
    zone.popupButtons.forEach(btn => {
      const btnEl = document.createElement('button');
      btnEl.className   = 'popup-btn';
      btnEl.textContent = btn.label;
      btnEl.addEventListener('click', () => handlePopupAction(btn.action, zone));
      popupButtons.appendChild(btnEl);
    });
  }

  popupOverlay.classList.add('visible');
}

function closePopup() {
  popupOverlay.classList.remove('visible');
}

// ─── POPUP ACTION HANDLERS ────────────────────────────────────

function handlePopupAction(actionName, zone) {
  switch (actionName) {

    case 'takeBurntPaper':
      GameState.inventory.push('burntPaper');
      GameState.flags.hasBurntPaper = true;
      popupBody.innerHTML = 'You carefully tuck the scrap into your pocket.';
      popupButtons.innerHTML = ''; // remove button after use
      console.log('Inventory:', GameState.inventory);
      break;

    // ── Add more cases as puzzles grow ──
    // case 'useKey':
    //   ...
    //   break;

    default:
      console.warn(`No handler for popup action: "${actionName}"`);
  }
}

// ─── EVENT LISTENERS ──────────────────────────────────────────

popupClose.addEventListener('click', closePopup);

popupOverlay.addEventListener('click', (e) => {
  if (e.target === popupOverlay) closePopup();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePopup();
});

// ─── INIT ─────────────────────────────────────────────────────

(function init() {
  goToRoom(GameState.currentRoom);
})();
