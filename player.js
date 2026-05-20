import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlx7HxHyPNuXxueFyPjeKn84EpFbgke1Y",
  authDomain: "buzzer-67109.firebaseapp.com",
  databaseURL: "https://buzzer-67109-default-rtdb.firebaseio.com",
  projectId: "buzzer-67109",
  storageBucket: "buzzer-67109.firebasestorage.app"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// SFX - Efectos de Sonido
const sfxClick = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
const sfxWin = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); // Coin/Victoria
const sfxLose = new Audio('https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'); // Buzzer/Derrota
const sfxHeartbeat = new Audio('https://assets.mixkit.co/active_storage/sfx/120/120-preview.mp3'); // Latido

let myName = localStorage.getItem('santander_player') || "";
let timerInterval = null;
let myChoice = "";
let currentGameData = null;
let questionStartTime = 0;
let usedJoker = localStorage.getItem('used_joker') === 'true';
let myStats = JSON.parse(localStorage.getItem('player_stats')) || { points: 0, fastTime: 9999, correct: 0 };

const UI = {
    modal: document.getElementById('login-modal'),
    main: document.getElementById('main-player-ui'),
    status: document.getElementById('status-message'),
    qText: document.getElementById('question-text'),
    timerFill: document.getElementById('timer-bar-fill'),
    timerText: document.getElementById('time-left-text'),
    btns: document.querySelectorAll('.opt-btn'),
    feedback: document.getElementById('feedback-bar'),
    grid: document.getElementById('options-grid'),
    souvenir: document.getElementById('souvenir-screen')
};

// AUTO-LOGIN (Si recarga la página)
if(myName) {
    UI.modal.classList.add('d-none');
    UI.main.classList.remove('d-none');
    UI.main.classList.add('d-flex');
    initSensors();
    start();
}

document.getElementById('join-btn').onclick = async () => {
    const raw = document.getElementById('player-name').value.trim();
    const safeName = raw.replace(/[.#$\[\]]/g, '').trim(); 
    if(safeName) { 
        myName = safeName; 
        localStorage.setItem('santander_player', myName);
        
        // Solicitar permisos iOS para Sensores
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try { await DeviceOrientationEvent.requestPermission(); } catch(e){}
        }
        
        UI.modal.classList.add('d-none'); 
        UI.main.classList.remove('d-none'); 
        UI.main.classList.add('d-flex'); 
        initSensors();
        start(); 
    }
};

function start() {
    onValue(ref(db, 'game'), (snap) => {
        currentGameData = snap.val();
        if(!currentGameData) return;
        const s = currentGameData.status;
        
        // ESTADO: LOBBY
        if(s === 'lobby') {
            resetUI();
            document.body.className = "player-body text-white bg-custom";
            UI.status.textContent = "ESPERANDO PREGUNTA...";
            UI.status.classList.remove('d-none');
        } 
        // ESTADO: JUGANDO
        else if(s === 'active') {
            if(UI.qText.classList.contains('d-none')) {
                resetUI();
                UI.status.classList.add('d-none');
                UI.qText.textContent = currentGameData.question;
                UI.qText.classList.remove('d-none');
                
                ['A','B','C','D'].forEach(opt => {
                    document.getElementById(`p-opt-${opt}`).textContent = currentGameData.options[opt];
                });
                
                document.getElementById('timer-bar-container').classList.remove('d-none');
                UI.timerText.classList.remove('d-none');
                
                enableButtons(true);
                startTimer(10);
            }
        }
        // ESTADO: REVELACIÓN
        else if(s === 'reveal') {
            clearInterval(timerInterval);
            enableButtons(false);
            
            let isCorrect = myChoice === currentGameData.correct;
            
            // Stats para la radiografía final
            if(isCorrect) {
                myStats.correct++;
                let rTime = Date.now() - questionStartTime;
                if(rTime < myStats.fastTime) myStats.fastTime = rTime;
            }
            localStorage.setItem('player_stats', JSON.stringify(myStats));

            // FEEDBACK SENSORIAL WOW
            if(isCorrect) {
                document.body.classList.add('bg-success-glow'); // Flash Verde
                sfxWin.play();
                if("vibrate" in navigator) navigator.vibrate([100, 50, 100, 50, 200]);
                UI.feedback.innerHTML = "¡CORRECTO! 🔥";
                UI.feedback.className = "p-3 text-center fw-bold fs-3 bg-success text-white glow-box";
            } else {
                document.body.classList.add('bg-danger-glow'); // Flash Rojo
                sfxLose.play();
                if("vibrate" in navigator) navigator.vibrate(500); // Vibración seca
                UI.feedback.innerHTML = myChoice ? "INCORRECTO ❌" : "TIEMPO AGOTADO ⌛";
                UI.feedback.className = "p-3 text-center fw-bold fs-3 bg-danger text-white";
            }

            // Pintar botones
            UI.btns.forEach(b => {
                if(b.dataset.opt === currentGameData.correct) b.classList.add('correct-ans');
                else if(b.dataset.opt === myChoice) b.classList.add('wrong-ans');
                else b.style.opacity = '0.2';
            });
            UI.feedback.classList.remove('d-none');
        }
        // ESTADO: GRAN FINAL Y SOUVENIR
        else if(s === 'ranking') {
            UI.main.classList.add('d-none');
            UI.souvenir.classList.remove('d-none');
            
            // ESTADIO ILUMINADO: Alternar luz pura en celulares
            setInterval(() => {
                document.body.style.backgroundColor = document.body.style.backgroundColor === 'white' ? '#ec0000' : 'white';
                document.body.style.backgroundImage = 'none';
            }, 500);

            // Generar Souvenir
            document.getElementById('sov-name').textContent = myName;
            document.getElementById('sov-correct').textContent = myStats.correct;
            document.getElementById('sov-time').textContent = myStats.fastTime === 9999 ? "N/A" : (myStats.fastTime/1000).toFixed(2) + "s";
            
            // Generar QR (Requiere librería en index.html)
            document.getElementById("qrcode").innerHTML = "";
            new QRCode(document.getElementById("qrcode"), { text: `SantanderTrivia:${myName}`, width: 100, height: 100 });
        }
    });
}

function startTimer(seconds) {
    questionStartTime = Date.now();
    let left = seconds * 1000;
    
    timerInterval = setInterval(() => {
        left -= 50;
        UI.timerFill.style.width = `${(left / 10000) * 100}%`;
        UI.timerText.textContent = (left / 1000).toFixed(1) + "s";
        
        // HEARTBEAT SYNC (Últimos 3 segundos)
        if(left > 0 && left <= 3000 && left % 1000 === 0) {
            sfxHeartbeat.play();
            if("vibrate" in navigator) navigator.vibrate(100);
            document.body.classList.add('pulse-danger');
            setTimeout(() => document.body.classList.remove('pulse-danger'), 200);
        }
        
        if(left <= 0) {
            clearInterval(timerInterval);
            enableButtons(false);
        }
    }, 50);
}

// MICRO-INTERACCIONES CLICK
UI.btns.forEach(btn => {
    btn.onclick = async () => {
        if(currentGameData?.status !== 'active') return;
        myChoice = btn.dataset.opt;
        
        // Loading Glow effect
        UI.btns.forEach(b => { b.classList.remove('selected-ans'); b.innerHTML = b.innerHTML.replace('<div class="spinner"></div>', ''); });
        btn.classList.add('selected-ans');
        btn.innerHTML += '<div class="spinner"></div>';
        
        sfxClick.play();
        if("vibrate" in navigator) navigator.vibrate(30);
        
        await set(ref(db, `answers/${myName}`), { val: myChoice, time: Date.now() - questionStartTime });
    };
});

// EFECTOS FÍSICOS (Giroscopio y Agitación)
function initSensors() {
    window.addEventListener('deviceorientation', (e) => {
        if(currentGameData?.status !== 'active') return;
        // Parallax 3D
        let tiltX = Math.min(Math.max(e.gamma, -20), 20); 
        let tiltY = Math.min(Math.max(e.beta - 45, -20), 20);
        UI.grid.style.transform = `rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
    });

    // 50/50 JOKER SHAKE
    let lastX=0, lastY=0, lastZ=0;
    window.addEventListener('devicemotion', (e) => {
        if(currentGameData?.status !== 'active' || usedJoker) return;
        let acc = e.accelerationIncludingGravity;
        if(!acc) return;
        let delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
        
        if(delta > 40) { // Umbral de agitación brusca
            usedJoker = true;
            localStorage.setItem('used_joker', 'true');
            if("vibrate" in navigator) navigator.vibrate([300, 100, 300]);
            
            // Ocultar 2 opciones incorrectas
            let opts = ['A','B','C','D'].filter(o => o !== currentGameData.correct);
            let toHide = opts.sort(() => 0.5 - Math.random()).slice(0, 2);
            toHide.forEach(opt => {
                document.querySelector(`[data-opt="${opt}"]`).style.opacity = '0';
                document.querySelector(`[data-opt="${opt}"]`).disabled = true;
            });
            UI.feedback.innerHTML = "¡COMODÍN 50/50 ACTIVADO!";
            UI.feedback.classList.remove('d-none');
            UI.feedback.className = "p-2 text-center fw-bold fs-5 bg-warning text-dark";
        }
        lastX = acc.x; lastY = acc.y; lastZ = acc.z;
    });
}

function resetUI() {
    clearInterval(timerInterval);
    myChoice = "";
    document.body.className = "player-body text-white bg-custom";
    UI.qText.classList.add('d-none');
    document.getElementById('timer-bar-container').classList.add('d-none');
    UI.timerText.classList.add('d-none');
    UI.feedback.classList.add('d-none');
    UI.grid.style.transform = `rotateY(0deg) rotateX(0deg)`;
    UI.btns.forEach(b => {
        b.className = 'opt-btn w-100 h-100'; 
        b.style.opacity = '1';
        b.disabled = true;
        b.innerHTML = `<span class="opt-letter">${b.dataset.opt}</span><span class="opt-text" id="p-opt-${b.dataset.opt}"></span>`;
    });
}
function enableButtons(bool) { UI.btns.forEach(b => b.disabled = !bool); }
