const frasesExito = [
  "¡Bien hecho! Un paso más.",
  "¡Seguís avanzando, genia!",
  "¡Objetivo cumplido! 💪",
  "¡Tarea completada como una campeona!",
  "¡Estás más cerca de tu mejor versión!",
];

const frasesAliento = [
  "No pasa nada, mañana será mejor 💛",
  "No te castigues, descansá y volvé con todo.",
  "Las pausas también son parte del progreso.",
  "Tu esfuerzo vale, incluso en días difíciles.",
  "Hoy tal vez no, pero mañana sí 💫",
];

// Objeto para guardar el estado de la aplicación
let appData = {
  alimentacion: { pendientes: [], completadas: [] },
  ejercicio: { pendientes: [], completadas: [] },
  bienestar: { pendientes: [], completadas: [] },
};

// Referencias a los contenedores
const sections = {
  alimentacion: {
    input: document.getElementById("inputAlimentacion"),
    pendingList: document.getElementById("listaAlimentacion"),
    completedList: document.getElementById("completadasAlimentacion"),
  },
  ejercicio: {
    input: document.getElementById("inputEjercicio"),
    pendingList: document.getElementById("listaEjercicio"),
    completedList: document.getElementById("completadasEjercicio"),
  },
  bienestar: {
    input: document.getElementById("inputBienestar"),
    pendingList: document.getElementById("listaBienestar"),
    completedList: document.getElementById("completadasBienestar"),
  },
};

// Tareas sugeridas para inicializar la aplicación
const suggestedTasks = {
  alimentacion: [
    "Beber 2L de agua",
    "Desayuno nutritivo",
    "Colación saludable",
    "Almuerzo equilibrado",
    "Cena ligera",
    "Incluir frutas y verduras",
  ],
  ejercicio: [
    "Caminar 30 minutos",
    "Estirar por 10 minutos",
    "Hacer una rutina de fuerza",
    "Practicar yoga o pilates",
    "Realizar ejercicios de respiración",
  ],
  bienestar: [
    "Meditar 10 minutos",
    "Leer 10 páginas de un libro",
    "Dormir 8 horas",
    "Reflexionar sobre el día",
    "Agradecer por lo vivido",
    "Registrar un logro personal",
  ],
};

// --- FUNCIONES DE PERSISTENCIA ---

// Guarda el objeto appData en localStorage
const updateLocalStorage = () => {
  localStorage.setItem("healthRoutine", JSON.stringify(appData));
};

// Función para mostrar mensajes temporales
const showMessage = (message) => {
  const messageDiv = document.getElementById("mensaje");
  messageDiv.textContent = message;
  messageDiv.classList.add("visible");
  setTimeout(() => {
    messageDiv.classList.remove("visible");
  }, 2500);
};

// Carga los datos de localStorage al iniciar la página
const loadTasks = () => {
  const storedData = localStorage.getItem("healthRoutine");
  if (storedData) {
    appData = JSON.parse(storedData);
  } else {
    startNewDay(false);
    return;
  }
  const today = new Date().toLocaleDateString("es-ES");
  if (localStorage.getItem("lastSavedDate") !== today) {
    startNewDay(true);
  }

  renderTasks();
};

// Iniciar un día nuevo
const startNewDay = (archivePrevious) => {
  if (archivePrevious) {
    const history = JSON.parse(localStorage.getItem("healthHistory") || "[]");
    history.push({
      date: localStorage.getItem("lastSavedDate"),
      data: appData,
    });
    localStorage.setItem("healthHistory", JSON.stringify(history));
    showMessage(`💾 ¡Registro del día anterior guardado!`);
  }
  appData = {
    alimentacion: { pendientes: suggestedTasks.alimentacion, completadas: [] },
    ejercicio: { pendientes: suggestedTasks.ejercicio, completadas: [] },
    bienestar: { pendientes: suggestedTasks.bienestar, completadas: [] },
  };
  localStorage.setItem("lastSavedDate", new Date().toLocaleDateString("es-ES"));
  updateLocalStorage();
  renderTasks();
};

// --- FUNCIONES DE MANIPULACIÓN DEL DOM Y LÓGICA ---
const renderTasks = () => {
  // Limpiar listas actuales
  sections.alimentacion.pendingList.innerHTML = "";
  sections.alimentacion.completedList.innerHTML = "";
  sections.ejercicio.pendingList.innerHTML = "";
  sections.ejercicio.completedList.innerHTML = "";
  sections.bienestar.pendingList.innerHTML = "";
  sections.bienestar.completedList.innerHTML = "";

  for (const category in appData) {
    appData[category].pendientes.forEach((taskText) => {
      const card = createTaskCard(category, taskText, false);
      sections[category].pendingList.appendChild(card);
    });
    appData[category].completadas.forEach((taskText) => {
      const card = createTaskCard(category, taskText, true);
      sections[category].completedList.appendChild(card);
    });
  }
};

const createTaskCard = (category, taskText, isCompleted) => {
  const card = document.createElement("div");
  card.classList.add("card");
  if (isCompleted) {
    card.classList.add("completada");
  }
  card.textContent = taskText;

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.textContent = "❌";

  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteTask(category, taskText, isCompleted);
  });
  deleteButton.addEventListener("touchend", (e) => {
    e.stopPropagation();
    deleteTask(category, taskText, isCompleted);
  });

  card.appendChild(deleteButton);

  if (!isCompleted) {
    card.addEventListener("click", () => {
      toggleTaskCompletion(category, taskText);
    });
    card.addEventListener("touchend", () => {
      toggleTaskCompletion(category, taskText);
    });
  }

  return card;
};

const addTask = (category) => {
  const input = sections[category].input;
  const taskText = input.value.trim();

  if (taskText) {
    appData[category].pendientes.push(taskText);
    updateLocalStorage();
    renderTasks();
    input.value = "";
    showMessage(`✅ Tarea agregada a ${category}.`);
  }
};

const toggleTaskCompletion = (category, taskText) => {
  const pendingIndex = appData[category].pendientes.indexOf(taskText);
  if (pendingIndex !== -1) {
    appData[category].pendientes.splice(pendingIndex, 1);
    appData[category].completadas.push(taskText);
    updateLocalStorage();
    renderTasks();
    showMessage(`🎉 ¡Excelente! Tarea "${taskText}" completada.`);
  }
};

const deleteTask = (category, taskText, isCompleted) => {
  if (isCompleted) {
    const completedIndex = appData[category].completadas.indexOf(taskText);
    if (completedIndex !== -1) {
      appData[category].completadas.splice(completedIndex, 1);
    }
  } else {
    const pendingIndex = appData[category].pendientes.indexOf(taskText);
    if (pendingIndex !== -1) {
      appData[category].pendientes.splice(pendingIndex, 1);
    }
  }
  updateLocalStorage();
  renderTasks();
  showMessage(`🗑️ Tarea "${taskText}" eliminada.`);
};
// Agrega una referencia al nuevo botón y contenedor
const historyContainer = document.getElementById("historyContainer");

// Función para mostrar el historial
const showHistory = () => {
  const history = JSON.parse(localStorage.getItem("healthHistory") || "[]");
  historyContainer.innerHTML = "";
  if (history.length === 0) {
    historyContainer.innerHTML =
      "<p>Aún no hay registros guardados. ¡Empieza hoy!</p>";
    return;
  }

  history.forEach((day) => {
    const dayRecord = document.createElement("div");
    dayRecord.classList.add("day-record");
    dayRecord.innerHTML = `
        <h3>Registro del ${day.date}</h3>
        <div class="record-content">
            <p><strong><br>Alimentación:</strong> ${
              day.data.alimentacion.completadas.join(", ") || "Nada completado"
            }</p>
            <p><strong><br>Ejercicio:</strong> ${
              day.data.ejercicio.completadas.join(", ") || "Nada completado"
            }</p>
            <p><strong><br>Bienestar:</strong> ${
              day.data.bienestar.completadas.join(", ") || "Nada completado"
            }</p>
        </div>
    `;
    historyContainer.appendChild(dayRecord);
  });
};

const saveDay = () => {
  const today = new Date().toLocaleDateString("es-ES");
  if (localStorage.getItem("lastSavedDate") === today) {
    showMessage("Ya has guardado tu registro de hoy. ¡Vuelve mañana! 😊");
    return;
  }
  startNewDay(true);
  showMessage("💾 ¡Día guardado! Tus logros están seguros.");
};

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const fechaActual = document.getElementById("fechaActual");
  if(fechaActual) {
    fechaActual.textContent = `Hoy es: ${today.toLocaleDateString("es-ES", options)}`;
  }

  loadTasks();
  loadRandomVideos();
});

const saveDayBtn = document.querySelector(".cierre-dia button");
if (saveDayBtn) {
    saveDayBtn.addEventListener("click", saveDay);
}

const showHistoryBtn = document.getElementById("showHistoryBtn");
if (showHistoryBtn) {
    showHistoryBtn.addEventListener("click", showHistory);
}

// Función para borrar todos los registros
const resetApp = () => {
  if (
    !confirm(
      "¿Estás segura de que quieres borrar todos tus registros? Esta acción no se puede deshacer."
    )
  ) {
    return;
  }
  localStorage.removeItem("healthRoutine");
  localStorage.removeItem("healthHistory");
  localStorage.removeItem("lastSavedDate");
  startNewDay(false);
  showMessage(
    "🗑️ Todos los registros han sido borrados. ¡Puedes empezar de nuevo!"
  );
};

// --- Variables globales ---
const meditacionUrls = [
  "https://www.youtube.com/embed/9-IOMXpv7Ys",
  "https://www.youtube.com/embed/Avh5AKQSfOk",
  "https://www.youtube.com/embed/aBsnQjJ2_Nk",
];

const relajacionUrls = [
  "https://www.youtube.com/embed/unCya_-8ECs",
  "https://www.youtube.com/embed/inpok4MKVLM",
  "https://www.youtube.com/embed/lh4JdZTJe7k",
];

// Cargar videos aleatorios
const loadRandomVideos = () => {
  const randomMeditacionUrl =
    meditacionUrls[Math.floor(Math.random() * meditacionUrls.length)];
  const randomRelajacionUrl =
    relajacionUrls[Math.floor(Math.random() * relajacionUrls.length)];
  const meditacionVideo = document.getElementById("meditacionVideo");
  const relajacionVideo = document.getElementById("relajacionVideo");
  if (meditacionVideo) {
    meditacionVideo.src = randomMeditacionUrl;
  }
  if (relajacionVideo) {
    relajacionVideo.src = randomRelajacionUrl;
  }
};
// Conectar el botón de reset a la función
const resetButton = document.getElementById("resetButton");
if (resetButton) {
    resetButton.addEventListener("click", resetApp);
}