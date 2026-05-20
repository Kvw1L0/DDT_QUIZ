<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ranking TV</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body class="tv-display-body bg-custom">
    <div class="bg-overlay container-fluid h-100 d-flex flex-column p-5">
        <div class="text-center mb-5">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/1200px-Banco_Santander_Logotipo.svg.png" class="tv-logo mb-3" alt="Santander">
            <h1 id="ranking-title" class="display-3 fw-black text-warning tracking-wider text-uppercase">TABLA DE POSICIONES</h1>
        </div>
        <div class="flex-grow-1 overflow-hidden w-100">
            <div id="ranking-list" class="ranking-container"></div>
        </div>
    </div>
    <script type="module" src="ranking.js"></script>
</body>
</html>
