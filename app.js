import { db } from "./firebase.js";

import {
  ref,
  onValue,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { questions } from "./questions.js";

let playerName = "";

const gameRef = ref(db, "game");

const loginScreen = document.getElementById("loginScreen");
const gameScreen = document.getElementById("gameScreen");

const questionText = document.getElementById("questionText");
const statusText = document.getElementById("statusText");
const buzzBtn = document.getElementById("buzzBtn");

window.joinGame = () => {

  const input = document.getElementById("nameInput");

  playerName = input.value.trim();

  if (!playerName) {
    alert("Ingresa tu nombre");
    return;
  }

  loginScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
};

buzzBtn.addEventListener("click", () => {

  runTransaction(gameRef, (game) => {

    if (
      game &&
      game.buzzerEnabled &&
      !game.winner
    ) {

      game.buzzerEnabled = false;
      game.winner = playerName;

      return game;
    }

    return;

  });

});

onValue(gameRef, (snapshot) => {

  const game = snapshot.val();

  if (!game) return;

  const currentQuestion =
    typeof game.currentQuestion === "number"
      ? game.currentQuestion
      : 0;

  const q = questions[currentQuestion];

  if (q) {
    questionText.innerText = q.question;
  }

  if (!game.buzzerEnabled && !game.winner) {

    buzzBtn.disabled = true;

    statusText.innerText =
      "⏳ Esperando que el animador habilite respuestas";

  }

  if (game.buzzerEnabled) {

    buzzBtn.disabled = false;

    statusText.innerText =
      "🚨 ¡PRESIONA PARA RESPONDER!";

  }

  if (game.winner) {

    buzzBtn.disabled = true;

    if (game.winner === playerName) {

      statusText.innerText =
        "🔥 ¡Fuiste el primero!";

    } else {

      statusText.innerText =
        `⚡ ${game.winner} respondió primero`;

    }

  }

});