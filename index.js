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
    estadoRegistro
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
    estadoRegistro
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
    t.estadoRegistro
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











const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
