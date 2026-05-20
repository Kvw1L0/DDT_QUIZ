import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlx7HxHyPNuXxueFyPjeKn84EpFbgke1Y",
  authDomain: "buzzer-67109.firebaseapp.com",
  databaseURL: "https://buzzer-67109-default-rtdb.firebaseio.com",
  projectId: "buzzer-67109"
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
    await set(ref(db, 'answers'), null);
    await set(ref(db, 'game'), {
        status: 'active',
        question: qInput.value.trim(),
        options: { A: optA.value, B: optB.value, C: optC.value, D: optD.value },
        correct: correctOpt
    });
    winnerBox.classList.add('d-none');
};

document.getElementById('btn-reveal').onclick = async () => {
    await set(ref(db, 'game/status'), 'reveal');
    const snapGame = await get(ref(db, 'game'));
    const snapAns = await get(ref(db, 'answers'));
    const snapScores = await get(ref(db, 'scores'));
    
    const correctAns = snapGame.val().correct;
    let currentScores = snapScores.exists() ? snapScores.val() : {};
    let fastestPlayer = "¡NADIE ACERTÓ!";
    let fastestTime = Infinity;

    if(snapAns.exists()){
        const answers = snapAns.val();
        for (const [playerName, data] of Object.entries(answers)) {
            if(data.val === correctAns) {
                let speedBonus = Math.max(0, 10000 - data.time);
                let pointsEarned = Math.floor(500 + (speedBonus / 10000) * 500);
                currentScores[playerName] = (currentScores[playerName] || 0) + pointsEarned;
                if(data.time < fastestTime) { fastestTime = data.time; fastestPlayer = playerName; }
            }
        }
        await set(ref(db, 'scores'), currentScores); 
    }
    await set(ref(db, 'game/winner'), fastestPlayer);
    winnerName.textContent = fastestPlayer;
    winnerBox.classList.remove('d-none');
};

document.getElementById('btn-ranking').onclick = async () => { await set(ref(db, 'game/status'), 'ranking'); };

document.getElementById('btn-lobby').onclick = async () => {
    await set(ref(db, 'game/status'), 'lobby');
    qInput.value = ""; optA.value = ""; optB.value = ""; optC.value = ""; optD.value = "";
    winnerBox.classList.add('d-none');
};

document.getElementById('btn-reset-scores').onclick = async () => {
    if(confirm("¿Seguro que quieres borrar todos los puntajes históricos?")) {
        await set(ref(db, 'scores'), null);
        alert("Puntajes borrados.");
    }
};
