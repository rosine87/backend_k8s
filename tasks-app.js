const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const mysql = require('mysql2/promise');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

// Pool MySQL
const pool = mysql.createPool({
  host: process.env.MYSQL_ADDRESS,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

app.get('/health/liveness', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health/readiness', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('READY');
  } catch (err) {
    console.error(err);
    res.status(503).send('NOT READY');
  }
});

// GET /tasks
app.get('/api/tasks', async (req, res) => {
  try {
   

    const [rows] = await pool.query(
      'SELECT id, title, text, created_at FROM tasks ORDER BY id DESC'
    );

    res.status(200).json({ message: 'Tasks loaded.', tasks: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message || 'Failed to load tasks.' });
  }
});

// POST /tasks
app.post('/api/tasks', async (req, res) => {
  try {

    const { title, text } = req.body;

    if (!title || !text) {
      return res.status(400).json({ message: 'title and text are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (title, text) VALUES (?, ?)',
      [title, text]
    );

    res.status(201).json({
      message: 'Task stored.',
      createdTask: { id: result.insertId, title, text },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Failed to store task' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
