const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./clinica.db');

app.use(express.json());
app.use(express.static('public'));

// Ruta para obtener los turnos
app.get('/api/turnos', (req, res) => {
  const sql = `SELECT
    dni,
    apellidoNombre,
    fechaNacimiento,
    obraSocial,
    numeroCelular,
    mail,
    especialidad,
    fechaSolicitadaPaciente,
    preferenciaHorariaPaciente,
    rangoHorarioPacientes,
    registroRas,
    estadoRegistro,
    motivoConsulta
    FROM turnos
    ORDER BY registroRas DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Ruta para guardar un turno desde el chat
app.post('/api/guardar-turno', (req, res) => {
  const t = req.body;
  const sql = `INSERT INTO turnos (
    dni,
    apellidoNombre,
    fechaNacimiento,
    obraSocial,
    numeroCelular,
    mail,
    especialidad,
    fechaSolicitadaPaciente,
    preferenciaHorariaPaciente,
    rangoHorarioPacientes,
    registroRas,
    estadoRegistro,
    motivoConsulta
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    t.dni,
    t.apellidoNombre,
    t.fechaNacimiento,
    t.obraSocial,
    t.numeroCelular,
    t.mail,
    t.especialidad,
    t.fechaSolicitadaPaciente,
    t.preferenciaHorariaPaciente,
    t.rangoHorarioPacientes,
    t.registroRas,
    t.estadoRegistro,
    t.motivoConsulta || '' // <-- nuevo campo, por si no viene vacío
  ];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// NUEVA RUTA: actualizar Registro Ras y Estado
app.post('/api/actualizar-turno', (req, res) => {
  const { dni, registroRas, estadoRegistro } = req.body;
  if (!dni || !registroRas || !estadoRegistro) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const sql = `UPDATE turnos
               SET registroRas = ?, estadoRegistro = ?
               WHERE dni = ?`;
  const params = [registroRas, estadoRegistro, dni];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, cambios: this.changes });
  });
});


// ============================
// API Consultas
// ============================

// Obtener todas las consultas
app.get('/api/consultas', (req, res) => {
  const sql = `SELECT id, paciente, motivo, fecha
               FROM consultas
               ORDER BY fecha DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Guardar nueva consulta
app.post('/api/consultas', (req, res) => {
  const { paciente, motivo } = req.body;
  if (!paciente || !motivo) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  const fecha = new Date().toISOString();
  const sql = `INSERT INTO consultas (paciente, motivo, fecha) VALUES (?, ?, ?)`;
  const params = [paciente, motivo, fecha];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ mensaje: err.message });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Borrar una consulta
app.post('/api/consultas/borrar', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, mensaje: 'Falta el ID' });
  }

  const sql = `DELETE FROM consultas WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, mensaje: err.message });
    }
    res.json({ success: true, cambios: this.changes });
  });
});








const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
