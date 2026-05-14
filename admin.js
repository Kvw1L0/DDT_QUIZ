import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlx7HxHyPNuXxueFyPjeKn84EpFbgke1Y",
  authDomain: "buzzer-67109.firebaseapp.com",
  databaseURL: "https://buzzer-67109-default-rtdb.firebaseio.com",
  projectId: "buzzer-67109",
  storageBucket: "buzzer-67109.firebasestorage.app",
  messagingSenderId: "925012683826",
  appId: "1:925012683826:web:f200286df975b4969a602b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const questionInput = document.getElementById('question-input');
const currentStatus = document.getElementById('current-status');
const winnerDisplay = document.getElementById('winner-display');
let localWinner = "";

onValue(ref(db, 'game'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        currentStatus.textContent = data.status.toUpperCase();
        if (data.status === 'blocked') {
            localWinner = data.winner;
            winnerDisplay.textContent = `¡${data.winner} PRESIONÓ PRIMERO!`;
            winnerDisplay.className = 'winner-alert active';
        } else {
            winnerDisplay.className = 'hidden';
            if (data.status === 'lobby') questionInput.value = "";
        }
    }
});

async function updateGameState(status) {
    const text = questionInput.value.trim();
    await set(ref(db, 'game'), {
        status: status,
        question: text,
        winner: (status === 'lobby' || status === 'reading') ? "" : localWinner
    });
}

document.getElementById('send-question-btn').onclick = () => updateGameState('reading');
document.getElementById('enable-btn').onclick = () => updateGameState('active');
document.getElementById('reset-btn').onclick = () => updateGameState('lobby');

updateGameState('lobby');
