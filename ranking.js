import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlx7HxHyPNuXxueFyPjeKn84EpFbgke1Y",
  authDomain: "buzzer-67109.firebaseapp.com",
  databaseURL: "https://buzzer-67109-default-rtdb.firebaseio.com",
  projectId: "buzzer-67109"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const rankingList = document.getElementById('ranking-list');

onValue(ref(db, 'game/status'), (snap) => {
    if(snap.val() !== 'ranking') window.location.href = "display.html";
});

onValue(ref(db, 'scores'), (snap) => {
    rankingList.innerHTML = "";
    if(!snap.exists()) {
        rankingList.innerHTML = "<h2 class='text-center text-white mt-5'>Aún no hay puntajes</h2>";
        return;
    }
    const sortedScores = Object.entries(snap.val()).map(([name, score]) => ({ name, score })).sort((a, b) => b.score - a.score).slice(0, 7);
    sortedScores.forEach((player, index) => {
        const delay = index * 0.1;
        rankingList.innerHTML += `
            <div class="ranking-row" style="animation-delay: ${delay}s">
                <div class="rank-pos">#${index + 1}</div>
                <div class="rank-name">${player.name}</div>
                <div class="rank-score">${player.score} PTS</div>
            </div>`;
    });
});
