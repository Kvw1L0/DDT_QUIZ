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

// Elementos del DOM
const questionInput = document.getElementById('question-input');
const sendQuestionBtn = document.getElementById('send-question-btn');
const enableBtn = document.getElementById('enable-btn');
const resetBtn = document.getElementById('reset-btn');
const currentStatus = document.getElementById('current-status');
const winnerDisplay = document.getElementById('winner-display');

let localWinner = "";

// Escuchar cambios en vivo
const gameRef = ref(db, 'game');
onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        currentStatus.textContent = data.status;
        if (data.status === 'blocked') {
            localWinner = data.winner;
            winnerDisplay.textContent = `¡${data.winner} PRESIONÓ PRIMERO!`;
            winnerDisplay.className = 'winner-alert active';
        } else {
            winnerDisplay.className = 'hidden';
            if (data.status === 'lobby') {
                questionInput.value = "";
            }
        }
    }
});

async function updateGameState(status) {
    const text = questionInput.value.trim();
    await set(gameRef, {
        status: status,
        question: text,
        winner: (status === 'lobby' || status === 'reading') ? "" : localWinner
    });
}

sendQuestionBtn.addEventListener('click', () => updateGameState('reading'));
enableBtn.addEventListener('click', () => updateGameState('active'));
resetBtn.addEventListener('click', () => updateGameState('lobby'));

// Inicializar la base de datos al cargar el admin si está vacía
updateGameState('lobby');
