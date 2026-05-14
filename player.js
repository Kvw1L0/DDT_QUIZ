import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const playerNameInput = document.getElementById('player-name');
const joinBtn = document.getElementById('join-btn');
const playerDisplay = document.getElementById('player-display');
const statusMessage = document.getElementById('status-message');
const questionText = document.getElementById('question-text');
const buzzerBtn = document.getElementById('buzzer-btn');
const resultMessage = document.getElementById('result-message');

let myName = "";

joinBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name) {
        myName = name;
        playerDisplay.textContent = `Jugador: ${myName}`;
        loginScreen.classList.remove('active');
        loginScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        gameScreen.classList.add('active');
        listenToGame();
    }
});

function listenToGame() {
    const gameRef = ref(db, 'game');
    onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Actualizar UI según el estado
        if (data.status === 'lobby') {
            statusMessage.textContent = "Esperando al administrador...";
            statusMessage.classList.remove('hidden');
            questionText.classList.add('hidden');
            resultMessage.classList.add('hidden');
            setBuzzerState('disabled', 'ESPERA');
        } 
        else if (data.status === 'reading') {
            statusMessage.classList.add('hidden');
            questionText.textContent = data.question;
            questionText.classList.remove('hidden');
            resultMessage.classList.add('hidden');
            setBuzzerState('disabled', 'ESPERA');
        } 
        else if (data.status === 'active') {
            setBuzzerState('active', '¡PRESIONA!');
            if ("vibrate" in navigator) navigator.vibrate(200);
        } 
        else if (data.status === 'blocked') {
            if (data.winner === myName) {
                setBuzzerState('winner', '¡FUISTE PRIMERO!');
                resultMessage.textContent = "¡Es tu turno de responder!";
                if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
            } else {
                setBuzzerState('loser', 'BLOQUEADO');
                resultMessage.textContent = `Ganó el turno: ${data.winner}`;
            }
            resultMessage.classList.remove('hidden');
        }
    });
}

function setBuzzerState(state, text) {
    buzzerBtn.className = `buzzer ${state}`;
    buzzerBtn.disabled = state !== 'active';
    buzzerBtn.querySelector('span').textContent = text;
}

buzzerBtn.addEventListener('click', async () => {
    const gameRef = ref(db, 'game');
    const snapshot = await get(gameRef);
    const currentState = snapshot.val();

    // Validamos que el juego siga activo antes de registrar el clic
    if (currentState && currentState.status === 'active') {
        await set(gameRef, {
            ...currentState,
            status: 'blocked',
            winner: myName
        });
    }
});
