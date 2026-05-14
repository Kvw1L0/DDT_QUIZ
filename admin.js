import { db } from "./firebase.js";

import {
  ref,
  onValue,
  get,
  set,
  update
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { questions } from "./questions.js";

const gameRef = ref(db, "game");

const adminQuestion =
  document.getElementById("adminQuestion");

const winnerBox =
  document.getElementById("winnerBox");

const gameStatus =
  document.getElementById("gameStatus");

const nextBtn =
  document.getElementById("nextBtn");

const enableBtn =
  document.getElementById("enableBtn");

const disableBtn =
  document.getElementById("disableBtn");

const resetBtn =
  document.getElementById("resetBtn");

onValue(gameRef, (snapshot) => {

  const game = snapshot.val();

  if (!game) return;

  const currentQuestion =
    typeof game.currentQuestion === "number"
      ? game.currentQuestion
      : 0;

  const q = questions[currentQuestion];

  if (q) {
    adminQuestion.innerText = q.question;
  }

  winnerBox.innerText =
    game.winner
      ? `🎉 ${game.winner}`
      : "Esperando respuestas...";

  if (game.buzzerEnabled) {

    gameStatus.innerText =
      "🟢 Buzzers ACTIVOS";

  } else {

    gameStatus.innerText =
      "🔴 Buzzers BLOQUEADOS";

  }

});

nextBtn.addEventListener("click", async () => {

  const snapshot = await get(gameRef);

  const game = snapshot.val();

  let nextQuestion =
    (game.currentQuestion || 0) + 1;

  if (nextQuestion >= questions.length) {
    nextQuestion = 0;
  }

  set(gameRef, {
    currentQuestion: nextQuestion,
    winner: "",
    buzzerEnabled: false
  });

});

enableBtn.addEventListener("click", () => {

  update(gameRef, {
    buzzerEnabled: true,
    winner: ""
  });

});

disableBtn.addEventListener("click", () => {

  update(gameRef, {
    buzzerEnabled: false
  });

});

resetBtn.addEventListener("click", async () => {

  const snapshot = await get(gameRef);

  const game = snapshot.val();

  update(gameRef, {
    winner: "",
    buzzerEnabled: false,
    currentQuestion: game.currentQuestion || 0
  });

});