import { db } from "./firebase.js";

import {
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { questions } from "./questions.js";

const gameRef = ref(db, "game");

const displayQuestion =
  document.getElementById("displayQuestion");

const displayStatus =
  document.getElementById("displayStatus");

const winnerPopup =
  document.getElementById("winnerPopup");

const popupWinner =
  document.getElementById("popupWinner");

onValue(gameRef, (snapshot) => {

  const game = snapshot.val();

  if (!game) return;

  const currentQuestion =
    typeof game.currentQuestion === "number"
      ? game.currentQuestion
      : 0;

  const q = questions[currentQuestion];

  if (q) {
    displayQuestion.innerText = q.question;
  }

  if (game.buzzerEnabled) {

    displayStatus.innerText =
      "🟢 ¡Buzzers ACTIVOS!";

  } else {

    displayStatus.innerText =
      "🔴 Esperando habilitación";

  }

  if (game.winner) {

    popupWinner.innerText = game.winner;

    winnerPopup.classList.remove("hidden");

  } else {

    winnerPopup.classList.add("hidden");

  }

});