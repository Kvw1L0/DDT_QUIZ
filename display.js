import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDlx7HxHyPNuXxueFyPjeKn84EpFbgke1Y",
  authDomain: "buzzer-67109.firebaseapp.com",
  databaseURL: "https://buzzer-67109-default-rtdb.firebaseio.com",
  projectId: "buzzer-67109",
  storageBucket: "buzzer-67109.firebasestorage.app",
  messagingSenderId: "925012683826",
  appId: "1:925012683826:web:f200286df975b4969a602b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elementos del DOM
const questionArea = document.getElementById('question-area');
const displayQuestionText = document.getElementById('display-question-text');
const waitingArea = document.getElementById('waiting-area');
const winnerPopup = document.getElementById('winner-popup');
const winnerName = document.getElementById('winner-name');

// Escuchar cambios en la base de datos en tiempo real
const gameRef = ref(db, 'game');
onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Lógica para mostrar pregunta o pantalla de espera
    if (data.status === 'lobby') {
        waitingArea.classList.remove('hidden');
        questionArea.classList.add('hidden');
        closePopup(); // Asegurar que el popup esté cerrado en lobby
    } 
    else if (data.status === 'reading' || data.status === 'active') {
        waitingArea.classList.add('hidden');
        questionArea.classList.remove('hidden');
        displayQuestionText.textContent = data.question;
        closePopup(); // Asegurar que el popup esté cerrado al leer nueva pregunta
    }
    // LÓGICA DEL POP-UP CUANDO ALGUIEN PRESIONA (blocked)
    else if (data.status === 'blocked') {
        if (data.winner) {
            showWinnerPopup(data.winner);
        }
    }
});

function showWinnerPopup(name) {
    winnerName.textContent = name;
    winnerPopup.classList.remove('hidden');
    // Sonido opcional aquí si quisieras
}

function closePopup() {
    winnerPopup.classList.add('hidden');
}
