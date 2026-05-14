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

let myName = "";
let safeName = "";
let timerInterval = null;
let hasAnswered = false;
let myChoice = "";
let currentGameData = null;
let questionStartTime = 0; // Para medir tiempo de reacción

const UI = {
    modal: document.getElementById('login-modal'),
    main: document.getElementById('main-player-ui'),
    status: document.getElementById('status-message'),
    qText: document.getElementById('question-text'),
    timerContainer: document.getElementById('timer-bar-container'),
    timerFill: document.getElementById('timer-bar-fill'),
    timerText: document.getElementById('time-left-text'),
    btns: document.querySelectorAll('.opt-btn'),
    feedback: document.getElementById('feedback-bar')
};

document.getElementById('join-btn').onclick = () => {
    const rawName = document.getElementById('player-name').value.trim();
    // Limpiamos el nombre de caracteres no válidos para Firebase
    safeName = rawName.replace(/[.#$\[\]]/g, '').trim(); 
    if(safeName) { 
        myName = safeName; 
        UI.modal.classList.add('d-none'); 
        UI.main.classList.remove('d-none'); 
        UI.main.classList.add('d-flex'); 
        start(); 
    }
};

function start() {
    onValue(ref(db, 'game'), (snap) => {
        currentGameData = snap.val();
        if(!currentGameData) return;

        const s = currentGameData.status;
        
        if(s === 'lobby') {
            resetUI();
            UI.status.textContent = "ESPERANDO PREGUNTA...";
            UI.status.classList.remove('d-none');
        } 
        else if(s === 'active') {
            // Verificamos si es una pregunta nueva verificando si el texto estaba oculto
            if(UI.qText.classList.contains('d-none')) {
                resetUI();
                UI.status.classList.add('d-none');
                
                UI.qText.textContent = currentGameData.question;
                UI.qText.classList.remove('d-none');
                
                document.getElementById('p-opt-A').textContent = currentGameData.options.A;
                document.getElementById('p-opt-B').textContent = currentGameData.options.B;
                document.getElementById('p-opt-C').textContent = currentGameData.options.C;
                document.getElementById('p-opt-D').textContent = currentGameData.options.D;
                
                UI.timerContainer.classList.remove('d-none');
                UI.timerText.classList.remove('d-none');
                
                enableButtons(true);
                startTimer(10); // 10 Segundos exactos locales
            }
        }
        else if(s === 'reveal') {
            clearInterval(timerInterval);
            enableButtons(false);
            
            // Pintar botones según resultados
            UI.btns.forEach(b => {
                if(b.dataset.opt === currentGameData.correct) {
                    b.classList.add('correct-ans');
                } else if(b.dataset.opt === myChoice) {
                    b.classList.add('wrong-ans');
                } else {
                    b.style.opacity = '0.4';
                }
            });

            UI.feedback.classList.remove('d-none');
            if(myChoice === currentGameData.correct) {
                UI.feedback.textContent = "¡RESPUESTA CORRECTA!";
                UI.feedback.className = "p-3 text-center fw-bold fs-4 bg-success text-white";
                if("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
            } else {
                UI.feedback.textContent = myChoice ? "RESPUESTA INCORRECTA" : "¡TIEMPO AGOTADO!";
                UI.feedback.className = "p-3 text-center fw-bold fs-4 bg-danger text-white";
            }
        }
    });
}

function startTimer(seconds) {
    questionStartTime = Date.now();
    clearInterval(timerInterval);
    let left = seconds * 1000;
    const step = 50;
    
    timerInterval = setInterval(() => {
        left -= step;
        const percent = (left / (seconds * 1000)) * 100;
        
        UI.timerFill.style.width = `${Math.max(0, percent)}%`;
        UI.timerText.textContent = (Math.max(0, left) / 1000).toFixed(1) + "s";
        
        if(left <= 0) {
            clearInterval(timerInterval);
            enableButtons(false);
            if(!hasAnswered) { UI.timerText.textContent = "¡TIEMPO!"; }
        }
    }, step);
}

UI.btns.forEach(btn => {
    btn.onclick = async () => {
        if(hasAnswered || currentGameData?.status !== 'active') return;
        
        hasAnswered = true;
        myChoice = btn.dataset.opt;
        enableButtons(false);
        btn.classList.add('selected-ans');
        
        if("vibrate" in navigator) navigator.vibrate(50);
        
        // Calculamos tiempo de reacción local
        const reactionTime = Date.now() - questionStartTime;
        
        try {
            await set(ref(db, `answers/${safeName}`), {
                val: myChoice,
                time: reactionTime // Enviamos la latencia
            });
        } catch (error) {
            console.error("Error al guardar respuesta:", error);
        }
    };
});

function resetUI() {
    clearInterval(timerInterval);
    hasAnswered = false;
    myChoice = "";
    UI.qText.classList.add('d-none');
    UI.timerContainer.classList.add('d-none');
    UI.timerText.classList.add('d-none');
    UI.feedback.classList.add('d-none');
    UI.btns.forEach(b => {
        b.className = 'opt-btn w-100 h-100'; // Limpia los colores
        b.style.opacity = '1';
        b.disabled = true;
        b.querySelector('.opt-text').textContent = "";
    });
}

function enableButtons(bool) {
    UI.btns.forEach(b => b.disabled = !bool);
}
