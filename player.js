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
        else if(s === 'reveal') {
            clearInterval(timerInterval);
            enableButtons(false);
            
            let isCorrect = myChoice === currentGameData.correct;
            
            if(isCorrect) {
                myStats.correct++;
                let rTime = Date.now() - questionStartTime;
                if(rTime < myStats.fastTime) myStats.fastTime = rTime;
            }
            localStorage.setItem('player_stats', JSON.stringify(myStats));

            if(isCorrect) {
                document.body.classList.add('bg-success-glow');
                sfxWin.play();
                if("vibrate" in navigator) navigator.vibrate([100, 50, 100, 50, 200]);
                UI.feedback.innerHTML = "¡CORRECTO! 🔥";
                UI.feedback.className = "p-3 text-center fw-bold fs-3 bg-success text-white glow-box mt-3 rounded";
            } else {
                document.body.classList.add('bg-danger-glow');
                sfxLose.play();
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
            // El juego NO ha terminado, solo miran la pantalla
            clearInterval(timerInterval);
            document.querySelector('.player-options').classList.add('d-none'); // Oculta botones
            document.getElementById('timer-bar-container').classList.add('d-none');
            UI.timerText.classList.add('d-none');
            UI.qText.classList.add('d-none');
            
            UI.feedback.classList.remove('d-none');
            UI.feedback.innerHTML = "👀 MIRA LA PANTALLA GIGANTE 👀";
            UI.feedback.className = "p-4 mt-5 text-center fw-bold fs-3 bg-warning text-dark glow-box rounded";
        }
        else if(s === 'endgame') {
            // AHORA SÍ terminó el juego. Mostrar Souvenir QR.
            UI.main.classList.add('d-none');
            UI.souvenir.classList.remove('d-none');
            
            setInterval(() => {
                document.body.style.backgroundColor = document.body.style.backgroundColor === 'white' ? '#ec0000' : 'white';
                document.body.style.backgroundImage = 'none';
            }, 500);

            document.getElementById('sov-name').textContent = myName;
            document.getElementById('sov-correct').textContent = myStats.correct;
            document.getElementById('sov-time').textContent = myStats.fastTime === 9999 ? "N/A" : (myStats.fastTime/1000).toFixed(2) + "s";
            
            document.getElementById("qrcode").innerHTML = "";
            new QRCode(document.getElementById("qrcode"), { text: `SantanderTrivia:${myName}`, width: 120, height: 120 });
        }
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
    document.querySelector('.player-options').classList.remove('d-none'); // Vuelve a mostrar los botones
    UI.grid.style.transform = `rotateY(0deg) rotateX(0deg)`;
    UI.btns.forEach(b => {
        b.className = 'opt-btn w-100 h-100'; 
        b.style.opacity = '1';
        b.disabled = true;
        b.innerHTML = `<span class="opt-letter">${b.dataset.opt}</span><span class="opt-text" id="p-opt-${b.dataset.opt}"></span>`;
    });
}
