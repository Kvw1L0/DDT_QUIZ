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

const UI = {
    wait: document.getElementById('waiting-area'),
    trivia: document.getElementById('trivia-area'),
    q: document.getElementById('tv-question'),
    clock: document.getElementById('tv-clock'),
    opts: {
        A: document.getElementById('tv-opt-A'),
        B: document.getElementById('tv-opt-B'),
        C: document.getElementById('tv-opt-C'),
        D: document.getElementById('tv-opt-D')
    },
    winner: document.getElementById('winner-banner'),
    winnerName: document.getElementById('winner-name-tv')
};

let displayTimerInterval;

onValue(ref(db, 'game'), (snap) => {
    const data = snap.val();
    if(!data) return;

    if(data.status === 'lobby') {
        UI.wait.classList.remove('d-none');
        UI.trivia.classList.add('d-none');
        UI.winner.classList.add('d-none');
        clearInterval(displayTimerInterval);
        resetOptions();
    } 
    else if(data.status === 'active') {
        resetOptions();
        UI.wait.classList.add('d-none');
        UI.trivia.classList.remove('d-none');
        UI.winner.classList.add('d-none');
        
        UI.q.textContent = data.question;
        UI.opts.A.querySelector('.text').textContent = data.options.A;
        UI.opts.B.querySelector('.text').textContent = data.options.B;
        UI.opts.C.querySelector('.text').textContent = data.options.C;
        UI.opts.D.querySelector('.text').textContent = data.options.D;
        
        UI.clock.classList.remove('d-none');
        startTvClock(data.endTime);
    } 
    else if(data.status === 'reveal') {
        clearInterval(displayTimerInterval);
        UI.clock.textContent = "0";
        
        // Destacar la correcta y apagar las demás
        Object.keys(UI.opts).forEach(key => {
            if(key === data.correct) {
                UI.opts[key].classList.add('correct-tv');
            } else {
                UI.opts[key].style.opacity = '0.3';
            }
        });

        // Mostrar al ganador
        UI.winnerName.textContent = data.winner;
        UI.winner.classList.remove('d-none');
        
        if(data.winner !== "¡NADIE ACERTÓ!") {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#ec0000', '#ffffff', '#ffd700'] });
        }
    }
});

function startTvClock(endTime) {
    clearInterval(displayTimerInterval);
    displayTimerInterval = setInterval(() => {
        const left = Math.ceil((endTime - Date.now()) / 1000);
        if(left <= 0) {
            UI.clock.textContent = "0";
            UI.clock.classList.add('text-danger', 'pulse');
            clearInterval(displayTimerInterval);
        } else {
            UI.clock.classList.remove('text-danger', 'pulse');
            UI.clock.textContent = left;
        }
    }, 100);
}

function resetOptions() {
    Object.values(UI.opts).forEach(el => {
        el.className = 'tv-opt-box';
        el.style.opacity = '1';
    });
}
