import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

const qArea = document.getElementById('question-area');
const wArea = document.getElementById('waiting-area');
const qDisplay = document.getElementById('display-question-text');
const winnerArea = document.getElementById('winner-area');
const wName = document.getElementById('winner-name');
const tvFrame = document.getElementById('tv-frame');
const timerContainer = document.getElementById('timer-container');

onValue(ref(db, 'game'), (snap) => {
    const data = snap.val();
    if(!data) return;

    if(data.status === 'lobby') {
        wArea.classList.remove('hidden');
        qArea.classList.add('hidden');
        winnerArea.classList.add('hidden');
        tvFrame.classList.remove('heartbeat-border');
        timerContainer.classList.add('hidden');
    } 
    else if(data.status === 'reading') {
        wArea.classList.add('hidden');
        qArea.classList.remove('hidden');
        winnerArea.classList.add('hidden');
        qDisplay.textContent = data.question;
        tvFrame.classList.remove('heartbeat-border');
        timerContainer.classList.add('hidden');
    } 
    else if(data.status === 'active') {
        wArea.classList.add('hidden');
        qArea.classList.remove('hidden');
        winnerArea.classList.add('hidden');
        tvFrame.classList.add('heartbeat-border'); // Activa latido
        timerContainer.classList.remove('hidden'); // Activa barra de tiempo
    } 
    else if(data.status === 'blocked') {
        tvFrame.classList.remove('heartbeat-border');
        timerContainer.classList.add('hidden');
        wName.textContent = data.winner;
        winnerArea.classList.remove('hidden');
        
        // Disparar Confeti Santander
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ec0000', '#ffffff', '#ffd700']
        });
    }
});
