// public/js/chatBot.js

const chat = document.getElementById("chat");
const inputArea = document.querySelector(".input-area");

const preguntas = [
  { texto: `Bienvenido y gracias por comunicarse con la Clínica Magaña!!! 
Soy el asistente virtual. Nuestro horario de atención es de 9:00 hs a 20:00 hs. 
¿Qué especialidad necesitás? Escribí el número:
1. Oftalmología 👁️
2. Pediatría 👶
3. Odontología 🦷`, tipo: "number" },

  { texto: "Por favor, escribí tu nombre:", tipo: "text" },
  { texto: "Ahora tu apellido:", tipo: "text" },
  { texto: "Ingresá tu DNI:", tipo: "number" },
  { texto: "Fecha de nacimiento:", tipo: "date" },
  { texto: "Ingresá tu correo electrónico:", tipo: "email" },
  { texto: "¿Cuál es tu obra social?", tipo: "text" },
  { texto: "Decime tu número de celular:", tipo: "tel" },
  { texto: "Día solicitado para el turno (1-31):", tipo: "number" },
  { texto: "Mes solicitado para el turno (1-12):", tipo: "number" },
  { texto: "¿Qué turno preferís? Escribí:\nmañana\ntarde", tipo: "text" },

  // Nuevo paso: dos inputs tipo time para rango horario
  { texto: "Seleccioná el rango horario:", tipo: "time-doble" }
];

let pasoActual = 0;
let respuestas = {};

function mostrarMensajeBot(mensaje) {
  const div = document.createElement("div");
  div.classList.add("bot-msg");
  div.textContent = mensaje;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function mostrarMensajeUsuario(mensaje) {
  const div = document.createElement("div");
  div.classList.add("user-msg");
  div.textContent = mensaje;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function mostrarPregunta() {
  const pregunta = preguntas[pasoActual];
  mostrarMensajeBot(pregunta.texto);

  inputArea.innerHTML = "";

  if (pregunta.tipo === "time-doble") {
    const inputInicio = document.createElement("input");
    inputInicio.type = "time";
    inputInicio.id = "horaInicio";

    const inputFin = document.createElement("input");
    inputFin.type = "time";
    inputFin.id = "horaFin";

    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Enviar";

    inputArea.appendChild(inputInicio);
    inputArea.appendChild(inputFin);
    inputArea.appendChild(sendBtn);

    sendBtn.addEventListener("click", () => {
      const inicio = inputInicio.value;
      const fin = inputFin.value;

      if (!inicio || !fin) {
        mostrarMensajeBot("Por favor seleccioná ambas horas.");
        return;
      }

      mostrarMensajeUsuario(`${inicio} a ${fin}`);
      respuestas.rangoHorario = `${inicio} a ${fin}`;
      pasoActual++;
      mostrarResumen();
      enviarTurnoAlBackend(); // <-- Envío automático al backend
    });

  } else {
    const input = document.createElement("input");
    input.type = pregunta.tipo;
    input.id = "userInput";
    input.autofocus = true;

    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Enviar";

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);

    sendBtn.addEventListener("click", procesarRespuesta);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") procesarRespuesta();
    });
  }
}

function procesarRespuesta() {
  const input = document.getElementById("userInput");
  let valor = input.value.trim();
  if (!valor) return;

  mostrarMensajeUsuario(valor);

  switch (pasoActual) {
    case 0: 
      if (valor === "1") respuestas.especialidad = "Oftalmología";
      else if (valor === "2") respuestas.especialidad = "Pediatría";
      else if (valor === "3") respuestas.especialidad = "Odontología";
      else {
        mostrarMensajeBot("Por favor, escribí un número válido (1, 2 o 3).");
        return;
      }
      break;
    case 1: respuestas.nombre = valor; break;
    case 2: respuestas.apellido = valor; break;
    case 3: respuestas.dni = valor; break;
    case 4: respuestas.fechaNacimiento = valor; break;
    case 5: respuestas.email = valor; break;
    case 6: respuestas.obraSocial = valor; break;
    case 7: respuestas.celular = valor; break;
    case 8: respuestas.diaTurno = valor; break;
    case 9: respuestas.mesTurno = valor; break;
    case 10: respuestas.preferencia = valor.toLowerCase(); break;
  }

  pasoActual++;

  if (pasoActual < preguntas.length) {
    mostrarPregunta();
  }
}

function mostrarResumen() {
  const anioActual = new Date().getFullYear();

  const turno = {
    dni: respuestas.dni,
    apellidoNombre: `${respuestas.apellido} ${respuestas.nombre}`,
    fechaNacimiento: respuestas.fechaNacimiento,
    obraSocial: respuestas.obraSocial,
    numeroCelular: respuestas.celular,
    mail: respuestas.email,
    especialidad: respuestas.especialidad,
    fechaSolicitadaPaciente: `${respuestas.diaTurno}/${respuestas.mesTurno}/${anioActual}`,
    preferenciaHorariaPaciente: respuestas.preferencia,
    rangoHorarioPacientes: respuestas.rangoHorario,
    registroRas: new Date().toISOString(),
    estadoRegistro: "pendiente"
  };

  mostrarMensajeBot("✅ Datos ingresados:");
  mostrarMensajeBot(`Especialidad: ${turno.especialidad}`);
  mostrarMensajeBot(`Nombre: ${respuestas.nombre}`);
  mostrarMensajeBot(`Apellido: ${respuestas.apellido}`);
  mostrarMensajeBot(`DNI: ${turno.dni}`);
  mostrarMensajeBot(`Fecha de nacimiento: ${turno.fechaNacimiento}`);
  mostrarMensajeBot(`Email: ${turno.mail}`);
  mostrarMensajeBot(`Obra social: ${turno.obraSocial}`);
  mostrarMensajeBot(`Celular: ${turno.numeroCelular}`);
  mostrarMensajeBot(`Fecha solicitada: ${turno.fechaSolicitadaPaciente}`);
  mostrarMensajeBot(`Preferencia: ${turno.preferenciaHorariaPaciente}`);
  mostrarMensajeBot(`Rango horario: ${turno.rangoHorarioPacientes}`);
  mostrarMensajeBot("📌 Estos datos se enviarán automáticamente al backend.");

  window.turnoActual = turno; 
}

// Función para enviar al backend
function enviarTurnoAlBackend() {
  if (!window.turnoActual) return;

  fetch("/api/guardar-turno", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(window.turnoActual)
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

// Inicializar chat
mostrarPregunta();
