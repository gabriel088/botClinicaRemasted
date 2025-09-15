const chat = document.getElementById("chat");
const inputArea = document.querySelector(".input-area");

const preguntas = [
  {
    texto: `Bienvenido y gracias por comunicarse con la Clínica ....!!! 
Soy el asistente virtual. Nuestro horario de atención es de 9:00 hs a 20:00 hs. 
¿Qué especialidad necesitás? Escribí el número: 
1. Oftalmología 👁️ 
2. Pediatría 👶 
3. Odontología 🦷`,
    tipo: "number"
  },
  { texto: "Por favor, escribí tu nombre:", tipo: "text" },
  { texto: "Ahora tu apellido:", tipo: "text" },
  { texto: "Ingresá tu DNI:", tipo: "number" },
  { texto: "Fecha de nacimiento:", tipo: "date" },
  { texto: "Ingresá tu correo electrónico:", tipo: "email" },
  { texto: "¿Cuál es tu obra social?", tipo: "text" },
  { texto: "Decime tu número de celular:", tipo: "tel" },
  { texto: "Seleccioná la fecha del turno:", tipo: "fecha-turno" },
  { texto: "¿Qué turno preferís? Escribí:\nmañana\ntarde", tipo: "text" },
  { texto: "Seleccioná el rango horario:", tipo: "time-doble" },
  { texto: "Motivo de consulta:", tipo: "motivo" } // <-- aparece solo en Oftalmología
];

let pasoActual = 0;
let respuestas = {};
let especialidadElegida = null;

// Calcular próximos 3 días hábiles (evitando sábados y domingos)
function calcularProximosTresDiasHabiles() {
  const diasHabiles = [];
  let fecha = new Date();
  while (diasHabiles.length < 3) {
    const dia = fecha.getDay();
    if (dia !== 0 && dia !== 6) {
      diasHabiles.push(new Date(fecha));
    }
    fecha.setDate(fecha.getDate() + 1);
  }
  return diasHabiles;
}

// Mostrar mensajes del bot
function mostrarMensajeBot(mensaje) {
  const div = document.createElement("div");
  div.classList.add("bot-msg");
  div.textContent = mensaje;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Mostrar input dinámico
function mostrarInput(pregunta) {
  inputArea.innerHTML = "";

  // --- Comportamiento especial para Pediatría: mostrar próximos 3 días hábiles ---
  if (pregunta.tipo === "fecha-turno" && especialidadElegida === "2") {
    mostrarMensajeBot("Seleccioná la fecha del turno (solo días hábiles):");
    const dias = calcularProximosTresDiasHabiles();

    dias.forEach(d => {
      const btn = document.createElement("button");
      const diaStr = d.toLocaleDateString("es-AR");
      btn.textContent = diaStr;
      btn.onclick = () => guardarRespuesta(diaStr);
      inputArea.appendChild(btn);
    });
    return;
  }

  // --- Motivo de consulta: SOLO en Oftalmología (1) ---
  if (pregunta.tipo === "motivo" && especialidadElegida === "1") {
    mostrarMensajeBot("Seleccioná el motivo de consulta:");
    const btn1 = document.createElement("button");
    btn1.textContent = "Control general";
    btn1.onclick = () => {
        inputArea.innerHTML = ""; // ocultar botones después de elegir
        guardarRespuesta("Control general");
    };

    const btn2 = document.createElement("button");
    btn2.textContent = "Estudio";
    btn2.onclick = () => {
        inputArea.innerHTML = ""; // ocultar botones después de elegir
        guardarRespuesta("Estudio");
    };

    inputArea.appendChild(btn1);
    inputArea.appendChild(btn2);
    return;
  }

  // --- 🚀 time-doble: pedir dos horarios ---
  if (pregunta.tipo === "time-doble") {
    mostrarMensajeBot("Seleccioná dos horarios:");

    const input1 = document.createElement("input");
    input1.type = "time";
    input1.placeholder = "Horario 1";

    const input2 = document.createElement("input");
    input2.type = "time";
    input2.placeholder = "Horario 2";

    const btn = document.createElement("button");
    btn.textContent = "Enviar";
    btn.addEventListener("click", () => {
      if (input1.value && input2.value) {
        guardarRespuesta(`${input1.value} - ${input2.value}`);
      }
    });

    inputArea.appendChild(input1);
    inputArea.appendChild(input2);
    inputArea.appendChild(btn);
    return;
  }

  // --- Código genérico ---
  const input = document.createElement("input");
  input.type = pregunta.tipo === "fecha-turno" ? "date" : pregunta.tipo;
  input.placeholder = pregunta.texto;

  const btn = document.createElement("button");
  btn.textContent = "Enviar";
  btn.addEventListener("click", () => {
    if (input.value) guardarRespuesta(input.value);
  });

  inputArea.appendChild(input);
  inputArea.appendChild(btn);
}

// Guardar respuestas
function guardarRespuesta(respuesta) {
  const div = document.createElement("div");
  div.classList.add("user-msg");
  div.textContent = respuesta;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  if (pasoActual === 0) {
    especialidadElegida = respuesta; // Guardamos qué especialidad eligió
  }

  respuestas[pasoActual] = respuesta;
  pasoActual++;
  siguientePregunta();
}

// Siguiente pregunta
function siguientePregunta() {
  if (pasoActual < preguntas.length) {
    const pregunta = preguntas[pasoActual];

    // ⚡ Si la pregunta es "motivo" y NO es Oftalmología, la salteamos
    if (pregunta.tipo === "motivo" && especialidadElegida !== "1") {
      pasoActual++;
      siguientePregunta();
      return;
    }

    mostrarMensajeBot(pregunta.texto);
    mostrarInput(pregunta);
  } else {
    mostrarMensajeBot("La secretaria se comunicará a la brevedad para confirmar el turno!!");
    enviarTurnoAlBackend(); // <-- enviamos al backend al terminar
  }
}

// Iniciar chat
siguientePregunta();

// --- Envío al backend con motivoConsulta ---
function enviarTurnoAlBackend() {
  const turno = {
    dni: respuestas[3],
    apellidoNombre: `${respuestas[2]} ${respuestas[1]}`,
    fechaNacimiento: respuestas[4],
    obraSocial: respuestas[6],
    numeroCelular: respuestas[7],
    mail: respuestas[5],
    especialidad: especialidadElegida,
    fechaSolicitadaPaciente: respuestas[8],
    preferenciaHorariaPaciente: respuestas[9],
    rangoHorarioPacientes: respuestas[10],
    registroRas: new Date().toISOString(),
    estadoRegistro: "pendiente",
    motivoConsulta: respuestas[11] || null // null si no corresponde
  };

  fetch("/api/guardar-turno", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(turno)
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      mostrarMensajeBot(`❌ Ocurrió un error al registrar el turno: ${data.error}`);
    } else {
      mostrarMensajeBot("✅ Turno registrado correctamente!");
    }
  })
  .catch(err => {
    mostrarMensajeBot(`❌ Ocurrió un error al registrar el turno: ${err}`);
  });
}
