import { db } from "./firebase.js";

import {
  ref,
  onValue,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { questions } from "./questions.js";

document.addEventListener("DOMContentLoaded", () => {

  let playerName = "";

  const gameRef = ref(db, "game");

  const loginScreen =
    document.getElementById("loginScreen");

  const gameScreen =
    document.getElementById("gameScreen");

  const joinBtn =
    document.getElementById("joinBtn");

  const buzzBtn =
    document.getElementById("buzzBtn");

  const questionText =
    document.getElementById("questionText");

  const statusText =
    document.getElementById("statusText");

  const nameInput =
    document.getElementById("nameInput");

  // JOIN

  joinBtn.addEventListener("click", () => {

    playerName =
      nameInput.value.trim();

    if (!playerName) {

      alert("Ingresa tu nombre");

      return;
    }

    loginScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");

  });

  // BUZZ

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

  // REALTIME

  onValue(gameRef, (snapshot) => {

    const game = snapshot.val();

    if (!game) return;

    const currentQuestion =
      game.currentQuestion || 0;

    const q =
      questions[currentQuestion];

    if (q) {

      questionText.innerText =
        q.question;

    }

    // STATUS

    if (
      !game.buzzerEnabled &&
      !game.winner
    ) {

      buzzBtn.disabled = true;

      statusText.innerText =
        "⏳ Esperando habilitación";

    }

    if (
      game.buzzerEnabled
    ) {

      buzzBtn.disabled = false;

      statusText.innerText =
        "🚨 ¡RESPONDE!";

    }

    if (
      game.winner
    ) {

      buzzBtn.disabled = true;

      if (
        game.winner === playerName
      ) {

        statusText.innerText =
          "🔥 ¡Fuiste el primero!";

      } else {

        statusText.innerText =
          `⚡ ${game.winner} respondió primero`;

      }

    }

  });

});
