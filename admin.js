import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

const qInput = document.getElementById('question-input');
const optA = document.getElementById('opt-A');
const optB = document.getElementById('opt-B');
const optC = document.getElementById('opt-C');
const optD = document.getElementById('opt-D');
const statusBadge = document.getElementById('current-status');
const winnerBox = document.getElementById('admin-winner-box');
const winnerName = document.getElementById('admin-winner-name');

onValue(ref(db, 'game/status'), (snap) => {
    if(snap.val()) statusBadge.textContent = snap.val().toUpperCase();
});

document.getElementById('btn-launch').onclick = async () => {
    const correctOpt = document.querySelector('input[name="correctOpt"]:checked').value;
    
    // Limpiamos las respuestas de la ronda anterior
    await set(ref(db, 'answers'), null);
    
    await set(ref(db, 'game'), {
        status: 'active',
        question: qInput.value.trim(),
        options: { A: optA.value, B: optB.value, C: optC.value, D: optD.value },
        correct: correctOpt,
        endTime: Date.now() + 10500 // 10 segundos + margen de red
    });
    
    winnerBox.classList.add('d-none');
};

document.getElementById('btn-reveal').onclick = async () => {
    await set(ref(db, 'game/status'), 'reveal');
    
    // Calcular ganador
    const snapGame = await get(ref(db, 'game'));
    const snapAns = await get(ref(db, 'answers'));
    const correctAns = snapGame.val().correct;
    
    let fastestPlayer = "¡NADIE ACERTÓ!";
    let fastestTime = Infinity;

    if(snapAns.exists()){
        const answers = snapAns.val();
        for (const [playerName, data] of Object.entries(answers)) {
            if(data.val === correctAns && data.time < fastestTime) {
                fastestTime = data.time;
                fastestPlayer = playerName;
            }
        }
    }
    
    await set(ref(db, 'game/winner'), fastestPlayer);
    winnerName.textContent = fastestPlayer;
    winnerBox.classList.remove('d-none');
};

document.getElementById('btn-lobby').onclick = async () => {
    await set(ref(db, 'game/status'), 'lobby');
    qInput.value = ""; optA.value = ""; optB.value = ""; optC.value = ""; optD.value = "";
    winnerBox.classList.add('d-none');
};
