// ======================================================== //
// --- SCRIPT.JS ACTUALIZADO CON GIF DE VICTORIA Y AUDIO --- //
// ======================================================== //
document.addEventListener('DOMContentLoaded', () => {
  // --- 1. SELECTORES DE ELEMENTOS DEL DOM ---
  const pantallaLogo = document.getElementById('pantalla-logo');
  const pantallaInicio = document.getElementById('pantalla-inicio');
  const botonJugar = document.getElementById('boton-jugar');
  const sonidoInicio = document.getElementById('sonido-inicio');
  const juegoPrincipal = document.getElementById('juego-principal');
  const tablero = document.getElementById('tablero');
  const tiempoDisplay = document.getElementById('tiempo');
  const intentosDisplay = document.getElementById('intentos');
  const mensajeDisplay = document.getElementById('mensaje');
  const botonReiniciar = document.getElementById('reiniciar');
  // --- Selectores para la pantalla de victoria ---
  const pantallaVictoria = document.getElementById('pantalla-victoria');
  const elementoCelebracion = document.getElementById('video-celebracion');
  // --- Selectores para controles de audio ---
  const botonVolumen = document.getElementById('boton-volumen');
  const controlVolumenVertical = document.getElementById('control-volumen-vertical');
  const controlVolumen = document.getElementById('control-volumen');

  // --- SONIDOS DEL JUEGO ---
  const audiovoltear = new Audio('audio/voltear.mp3');
  const audioVictoria = new Audio('audio/Victoria.mp3');
  const audioError = new Audio('audio/Error.mp3');
  // --- Música de fondo (instancia de Audio) ---
  let musicaFondo = new Audio(); // Se configurará la src en iniciarPartida
  musicaFondo.loop = true;
  function playSound(audio) {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => console.log("Error al reproducir sonido:", error));
    }
  }

  // --- DATOS Y VARIABLES DE ESTADO DEL JUEGO ---
  const imagenes = ["foto1.jpg", "foto2.jpg", "foto3.jpg", "foto4.jpg", "foto5.jpg", "foto6.jpg"];
  const audiosPorImagen = {
    "foto1.jpg": "audio/bebeperro.mp3",
    "foto2.jpg": "audio/bebepanda.mp3",
    "foto3.jpg": "audio/bebeleon.mp3",
    "foto4.jpg": "audio/bebeelefante.mp3",
    "foto5.jpg": "audio/bebegato.mp3",
    "foto6.jpg": "audio/bebemono.mp3"
  };
  // Array con los nombres de los GIF de celebración (¡Actualizado a .gif!)
  const gifsCelebracion = [
    "celebracion-foto1.gif", "celebracion-foto2.gif", "celebracion-foto3.gif",
    "celebracion-foto4.gif", "celebracion-foto5.gif", "celebracion-foto6.gif"
  ];
  let juego;
  let primeraCarta = null;
  let segundaCarta = null;
  let bloqueoTablero = false;
  let intentos = 0;
  let tiempo = 0;
  let temporizador;
  // --- Estado del audio ---
  let musicaMuteada = false; // Aunque ya no se usa con el slider, lo dejamos por si se necesita

  // --- 2. LÓGICA PRINCIPAL Y FLUJO DE LA APLICACIÓN ---

  // Función para mostrar la pantalla de inicio después del logo
function mostrarPantallaInicio() {
    pantallaInicio.style.opacity = '1';
    pantallaLogo.classList.add('fade-out');
    setTimeout(() => {
      pantallaLogo.classList.add('hidden');
      pantallaInicio.classList.remove('hidden');
    }, 1600);
  }

  // --- Inicialización modificada ---
  //pantallaInicio.classList.add('hidden');
  juegoPrincipal.classList.add('hidden');
  pantallaVictoria.classList.add('hidden');

  // Mostrar el logo al cargar
  pantallaLogo.classList.remove('hidden');
  setTimeout(() => {
    mostrarPantallaInicio();
  }, 4000);

  botonJugar.addEventListener('click', iniciarPartida);
  botonReiniciar.addEventListener('click', iniciarPartida);

  function iniciarPartida() {
    playSound(sonidoInicio);

    // --- LÓGICA PARA MÚSICA DE FONDO ---
    musicaFondo.src = "audio/musica de fondo.mp3"; // Establecer la fuente
    musicaFondo.volume = controlVolumen.value; // Aplicar volumen inicial desde el slider
    // musicaFondo.muted = musicaMuteada; // Aplicar estado mute si fuera necesario
    musicaFondo.play().catch(error => {
      console.log("Error al reproducir la música de fondo:", error);
      // Opcional: Mostrar mensaje al usuario
    });
    // --- FIN LÓGICA MÚSICA ---

    // Oculta las pantallas modales y muestra el tablero del juego
    pantallaInicio.classList.add('hidden');
    pantallaVictoria.classList.add('hidden');
    juegoPrincipal.classList.remove('hidden');

    elementoCelebracion.src = '';
    resetearEstadoJuego();
    generarTablero();
  }

  function resetearEstadoJuego() {
    primeraCarta = null;
    segundaCarta = null;
    bloqueoTablero = false;
    intentos = 0;
    tiempo = 0;

    mensajeDisplay.textContent = "";
    mensajeDisplay.classList.remove("mostrar");

    intentosDisplay.textContent = intentos;
    tiempoDisplay.textContent = tiempo;

    clearInterval(temporizador);
    temporizador = setInterval(() => {
      tiempo++;
      tiempoDisplay.textContent = tiempo;
    }, 1000);
  }

  function generarTablero() {
    tablero.innerHTML = "";
    juego = [...imagenes, ...imagenes];
    juego.sort(() => Math.random() - 0.5);
    juego.forEach(imagen => {
      const carta = document.createElement("div");
      carta.classList.add("carta");
      carta.dataset.imagen = imagen;
      carta.innerHTML = `
        <div class="carta-flip">
          <div class="frente"></div>
          <div class="atras" style="background-image: url('images/${imagen}')"></div>
        </div>
      `;
      carta.addEventListener("click", () => manejarClickCarta(carta));
      tablero.appendChild(carta);
    });
  }

  function manejarClickCarta(carta) {
    if (bloqueoTablero || carta === primeraCarta || carta.classList.contains("emparejada")) {
      return;
    }

    playSound(audioVoltear);
    carta.classList.add("abierta");

    if (!primeraCarta) {
      primeraCarta = carta;
    } else {
      segundaCarta = carta;
      intentos++;
      intentosDisplay.textContent = intentos;
      bloqueoTablero = true;
      verificarCoincidencia();
    }
  }

  function verificarCoincidencia() {
    const esCoincidencia = primeraCarta.dataset.imagen === segundaCarta.dataset.imagen;
    esCoincidencia ? manejarCoincidencia() : manejarNoCoincidencia();
  }

  function manejarCoincidencia() {
    primeraCarta.classList.add("emparejada");
    segundaCarta.classList.add("emparejada");

    const audioEmparejamiento = new Audio(audiosPorImagen[primeraCarta.dataset.imagen]);
    playSound(audioEmparejamiento);

    resetearTurno();
    verificarVictoria();
  }

  function manejarNoCoincidencia() {
    playSound(audioError);
    setTimeout(() => {
      primeraCarta.classList.remove("abierta");
      segundaCarta.classList.remove("abierta");
      resetearTurno();
    }, 1000);
  }

  function resetearTurno() {
    [primeraCarta, segundaCarta, bloqueoTablero] = [null, null, false];
  }

  // --- FUNCIÓN DE VICTORIA MODIFICADA ---
  function verificarVictoria() {
    if (document.querySelectorAll(".emparejada").length === juego.length) {
      clearInterval(temporizador);
      playSound(audioVictoria);

      setTimeout(() => {
        mostrarGifAleatorio();
      }, 800);
    }
  }

  function mostrarGifAleatorio() {
    const indiceAleatorio = Math.floor(Math.random() * gifsCelebracion.length);
    const gifSeleccionado = gifsCelebracion[indiceAleatorio];
    elementoCelebracion.src = `gifs/${gifSeleccionado}`;
    pantallaVictoria.classList.remove('hidden');

    const duracionMostrandoGif = 5000;

    setTimeout(() => {
      pantallaVictoria.classList.add('hidden');
      mostrarMensajeFinal();
      elementoCelebracion.src = '';
    }, duracionMostrandoGif);
  }

  function mostrarMensajeFinal() {
    mensajeDisplay.textContent = `🎉 ¡Felicidades! Kamila. Has completado el juego en ${tiempo} segundos con ${intentos} intentos.`;
    mensajeDisplay.classList.add("mostrar");
  }

  // --- 3. EVENT LISTENERS PARA CONTROLES DE AUDIO (al final) ---
  // Asegurarse de que los elementos existen antes de añadir listeners
  if (botonVolumen && controlVolumenVertical && controlVolumen) {
    botonVolumen.addEventListener('click', (e) => {
      // Evitar que el clic en el botón se propague y dispare el listener del document
      e.stopPropagation();
      controlVolumenVertical.classList.toggle('hidden');
    });

    controlVolumen.addEventListener('input', () => {
      musicaFondo.volume = controlVolumen.value;
      // Opcional: Si se baja a 0, podrías cambiar el icono del botón a 🔇
      // if (controlVolumen.value == 0) {
      //   botonVolumen.textContent = '🔇';
      // } else {
      //   botonVolumen.textContent = '🔊';
      // }
    });

    // --- EVENT LISTENER PARA OCULTAR EL CONTROL AL HACER CLIC FUERA ---
    document.addEventListener('click', (event) => {
      // Verificar que el clic no fue dentro del control deslizante ni en el botón
      if (!controlVolumenVertical.contains(event.target) && event.target !== botonVolumen) {
         // Verificar también que el control no está ya oculto para evitar operaciones innecesarias
         if(!controlVolumenVertical.classList.contains('hidden')) {
             controlVolumenVertical.classList.add('hidden');
         }
      }
    });
  } else {
      console.warn("Algunos elementos de control de audio no se encontraron en el DOM.");
  }



}); // --- Fin del addEventListener 'DOMContentLoaded' ---

