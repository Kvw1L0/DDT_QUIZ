import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// (Tu configuración de Firebase aquí)
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Escuchar la cantidad de jugadores que enviaron respuesta
const answersRef = ref(db, 'answers');
onValue(answersRef, (snapshot) => {
    if (snapshot.exists()) {
        const answersData = snapshot.val();
        // Contar cuántos nodos (jugadores) hay en 'answers'
        const totalJugadores = Object.keys(answersData).length;
        document.getElementById('dash-jugadores').innerText = totalJugadores;
    } else {
        document.getElementById('dash-jugadores').innerText = "0";
    }
});
