import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlx7HxHyPNuXxueFyPjeKn84EpFbgke1Y",
  authDomain: "buzzer-67109.firebaseapp.com",
  databaseURL: "https://buzzer-67109-default-rtdb.firebaseio.com",
  projectId: "buzzer-67109"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const sfxClick = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
const sfxWin = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); 
const sfxLose = new Audio('https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'); 
const sfxHeartbeat = new Audio('https://assets.mixkit.co/active_storage/sfx/120/120-preview.mp3'); 

let myName = "";
try { myName = localStorage.getItem('santander_player') || ""; } catch(e) {}

let myStats = { points: 0, fastTime: 9999, correct: 0 };
try { 
    const savedStats = localStorage.getItem('player_stats');
    if (savedStats) myStats = JSON.parse(savedStats);
} catch(e) {}

let timerInterval = null;
let myChoice = "";
let currentGameData = null;
let questionStartTime = 0;
let usedJoker = false;
try { usedJoker = localStorage.getItem('used_joker') === 'true'; } catch(e) {}

const UI = {
    modal: document.getElementById('login-modal'),
    main: document.getElementById('main-player-ui'),
    status: document.getElementById('status-message'),
    qText: document.getElementById('question-text'),
    timerContainer: document.getElementById('timer-bar-container'),
    timerFill: document.getElementById('timer-bar-fill'),
    timerText: document.getElementById('time-left-text'),
    btns: document.querySelectorAll('.opt-btn'),
    feedback: document.getElementById('feedback-bar'),
    grid: document.getElementById('options-grid'),
    souvenir: document.getElementById('souvenir-screen'),
    inputName: document.getElementById('player-name'),
    joinBtn: document.getElementById('join-btn')
};

if(myName) avanzarAlLobby();

UI.inputName.addEventListener("keypress", function(event) {
    if (event.key === "Enter") { event.preventDefault(); UI.joinBtn.click(); }
});

UI.joinBtn.addEventListener('click', () => {
    const raw = UI.inputName.value.trim();
    const safeName = raw.replace(/[.#$\[\]]/g, '').trim(); 
    if(!safeName) { alert("Por favor, ingresa tu nombre para jugar."); return; }
    myName = safeName; 
    try { localStorage.setItem('santander_player', myName); } catch(e) {}
    avanzarAlLobby();
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().catch(()=>{});
    }
});

function avanzarAlLobby() {
    UI.modal.classList.add('d-none'); 
    UI.main.classList.remove('d-none'); 
    UI.main.classList.add('d-flex'); 
    UI.status.textContent = "CONECTANDO AL SERVIDOR...";
    UI.status.classList.remove('d-none');
    initSensors();
    start(); 
}

function start() {
    onValue(ref(db, 'game'), (snap) => {
        currentGameData = snap.val();
        if(!currentGameData) {
            resetUI();
            UI.status.textContent = "ESPERANDO A QUE EL ANIMADOR INICIE...";
            UI.status.classList.remove('d-none');
            return;
        }

        const s = currentGameData.status;
        
        if(s === 'lobby') {
            resetUI();
            UI.status.textContent = "ESPERANDO PREGUNTA...";
            UI.status.classList.remove('d-none');
        } 
        else if(s === 'active') {
            if(UI.qText.classList.contains('d-none')) {
                resetUI();
                UI.status.classList.add('d-none');
                UI.qText.textContent = currentGameData.question;
                UI.qText.classList.remove('d-none');
                ['A','B','C','D'].forEach(opt => {
                    const optSpan = document.getElementById(`p-opt-${opt}`);
                    if(optSpan) optSpan.textContent = currentGameData.options[opt];
                });
                UI.timerContainer.classList.remove('d-none');
                UI.timerText.classList.remove('d-none');
                enableButtons(true);
                startTimer(10);
            }
        }
        else if(s === 'reveal') {
            clearInterval(timerInterval);
            enableButtons(false);
            let isCorrect = myChoice === currentGameData.correct;
            
            if(isCorrect) {
                myStats.correct++;
                let rTime = Date.now() - questionStartTime;
                if(rTime < myStats.fastTime) myStats.fastTime = rTime;
            }
            try { localStorage.setItem('player_stats', JSON.stringify(myStats)); } catch(e){}

            if(isCorrect) {
                document.body.classList.add('bg-success-glow');
                sfxWin.play().catch(()=>{});
                if("vibrate" in navigator) navigator.vibrate([100, 50, 100, 50, 200]);
                UI.feedback.innerHTML = "¡CORRECTO! 🔥";
                UI.feedback.className = "p-3 text-center fw-bold fs-3 bg-success text-white glow-box mt-3 rounded";
            } else {
                document.body.classList.add('bg-danger-glow');
                sfxLose.play().catch(()=>{});
                if("vibrate" in navigator) navigator.vibrate(500); 
                UI.feedback.innerHTML = myChoice ? "INCORRECTO ❌" : "TIEMPO AGOTADO ⌛";
                UI.feedback.className = "p-3 text-center fw-bold fs-3 bg-danger text-white mt-3 rounded";
            }

            UI.btns.forEach(b => {
                if(b.dataset.opt === currentGameData.correct) b.classList.add('correct-ans');
                else if(b.dataset.opt === myChoice) b.classList.add('wrong-ans');
                else b.style.opacity = '0.2';
            });
            UI.feedback.classList.remove('d-none');
        }
        else if(s === 'ranking') {
            clearInterval(timerInterval);
            document.querySelector('.player-options').classList.add('d-none');
            UI.timerContainer.classList.add('d-none');
            UI.timerText.classList.add('d-none');
            UI.qText.classList.add('d-none');
            UI.feedback.classList.remove('d-none');
            UI.feedback.innerHTML = "👀 MIRA LA PANTALLA GIGANTE 👀";
            UI.feedback.className = "p-4 mt-5 text-center fw-bold fs-3 bg-warning text-dark glow-box rounded";
        }
        else if(s === 'endgame') {
            UI.main.classList.add('d-none');
            UI.souvenir.classList.remove('d-none');
            document.body.classList.add('estadio-iluminado');
            document.getElementById('sov-name').textContent = myName;
            document.getElementById('sov-correct').textContent = myStats.correct;
            document.getElementById('sov-time').textContent = myStats.fastTime === 9999 ? "N/A" : (myStats.fastTime/1000).toFixed(2) + "s";
            
            document.getElementById("qrcode").innerHTML = "";
            if(typeof QRCode !== 'undefined') {
                new QRCode(document.getElementById("qrcode"), { text: `SantanderTrivia:${myName}`, width: 120, height: 120 });
            }
        }
    });
}

function startTimer(seconds) {
    questionStartTime = Date.now();
    let left = seconds * 1000;
    timerInterval = setInterval(() => {
        left -= 50;
        UI.timerFill.style.width = `${(Math.max(0, left) / 10000) * 100}%`;
        UI.timerText.textContent = (Math.max(0, left) / 1000).toFixed(1) + "s";
        
        if(left > 0 && left <= 3000 && left % 1000 === 0) {
            sfxHeartbeat.play().catch(()=>{});
            if("vibrate" in navigator) navigator.vibrate(100);
            document.body.classList.add('pulse-danger');
            setTimeout(() => document.body.classList.remove('pulse-danger'), 200);
        }
        if(left <= 0) { clearInterval(timerInterval); enableButtons(false); }
    }, 50);
}

UI.btns.forEach(btn => {
    btn.onclick = async () => {
        if(currentGameData?.status !== 'active') return;
        myChoice = btn.dataset.opt;
        UI.btns.forEach(b => { b.classList.remove('selected-ans'); b.innerHTML = b.innerHTML.replace('<div class="spinner"></div>', ''); });
        btn.classList.add('selected-ans');
        btn.innerHTML += '<div class="spinner"></div>';
        sfxClick.play().catch(()=>{});
        if("vibrate" in navigator) navigator.vibrate(30);
        try { await set(ref(db, `answers/${myName}`), { val: myChoice, time: Date.now() - questionStartTime }); } catch(e){}
    };
});

function initSensors() {
    if(!UI.grid) return;
    window.addEventListener('deviceorientation', (e) => {
        if(currentGameData?.status !== 'active') return;
        let tiltX = Math.min(Math.max(e.gamma, -20), 20) || 0; 
        let tiltY = Math.min(Math.max(e.beta - 45, -20), 20) || 0;
        UI.grid.style.transform = `rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
    });

    let lastX=0, lastY=0, lastZ=0;
    window.addEventListener('devicemotion', (e) => {
        if(currentGameData?.status !== 'active' || usedJoker) return;
        let acc = e.accelerationIncludingGravity;
        if(!acc) return;
        let delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
        if(delta > 40) { 
            usedJoker = true;
            try{ localStorage.setItem('used_joker', 'true'); }catch(e){}
            if("vibrate" in navigator) navigator.vibrate([300, 100, 300]);
            let opts = ['A','B','C','D'].filter(o => o !== currentGameData.correct);
            let toHide = opts.sort(() => 0.5 - Math.random()).slice(0, 2);
            toHide.forEach(opt => {
                let btn = document.querySelector(`[data-opt="${opt}"]`);
                if(btn) { btn.style.opacity = '0'; btn.disabled = true; }
            });
            UI.feedback.innerHTML = "¡COMODÍN 50/50 ACTIVADO!";
            UI.feedback.classList.remove('d-none');
            UI.feedback.className = "p-2 mt-3 text-center fw-bold fs-5 bg-warning text-dark rounded";
        }
        lastX = acc.x; lastY = acc.y; lastZ = acc.z;
    });
}

function resetUI() {
    clearInterval(timerInterval);
    myChoice = "";
    document.body.classList.remove('estadio-iluminado');
    document.body.className = "player-body text-white bg-custom";
    UI.qText.classList.add('d-none');
    UI.timerContainer.classList.add('d-none');
    UI.timerText.classList.add('d-none');
    UI.feedback.classList.add('d-none');
    document.querySelector('.player-options').classList.remove('d-none');
    UI.souvenir.classList.add('d-none');
    if(UI.grid) UI.grid.style.transform = `rotateY(0deg) rotateX(0deg)`;
    UI.btns.forEach(b => {
        b.className = 'opt-btn w-100 h-100'; 
        b.style.opacity = '1';
        b.disabled = true;
        b.innerHTML = `<span class="opt-letter">${b.dataset.opt}</span><span class="opt-text" id="p-opt-${b.dataset.opt}"></span>`;
    });
}
function enableButtons(bool) { UI.btns.forEach(b => b.disabled = !bool); }
