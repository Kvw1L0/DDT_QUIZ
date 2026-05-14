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

// Assets
const audioClick = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');

// DOM
const loginScreen = document.getElementById('login-screen');
const playerBtn = document.getElementById('buzzer-btn');
const label = document.getElementById('buzzer-label');
const qText = document.getElementById('question-text');
const statusMsg = document.getElementById('status-message');

let myName = "";

document.getElementById('join-btn').onclick = () => {
    const n = document.getElementById('player-name').value.trim();
    if(n) { myName = n; loginScreen.classList.remove('active'); loginScreen.classList.add('hidden'); start(); }
};

function start() {
    onValue(ref(db, 'game'), (snap) => {
        const data = snap.val();
        if(!data) return;

        if(data.status === 'lobby') {
            qText.classList.add('hidden');
            statusMsg.classList.remove('hidden');
            updateBtn('disabled', 'ESPERA');
        } else if(data.status === 'reading') {
            qText.textContent = data.question;
            qText.classList.remove('hidden');
            statusMsg.classList.add('hidden');
            updateBtn('disabled', 'ATENTOS');
        } else if(data.status === 'active') {
            updateBtn('active', '¡YA!');
        } else if(data.status === 'blocked') {
            const isMe = data.winner === myName;
            updateBtn(isMe ? 'winner' : 'loser', isMe ? '¡TUYO!' : '---');
        }
    });
}

function updateBtn(state, text) {
    playerBtn.className = `buzzer-massive ${state}`;
    playerBtn.disabled = state !== 'active';
    label.textContent = text;
}

playerBtn.onclick = async () => {
    const snap = await get(ref(db, 'game'));
    if(snap.val().status === 'active') {
        // Feedback
        if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
        audioClick.play();
        
        await set(ref(db, 'game'), { ...snap.val(), status: 'blocked', winner: myName });
    }
};
