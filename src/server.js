const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  user: 'postgres',     
  host: 'localhost',
  database: 'todosdb',
  password: 'jk',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// Get all todos
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos');
    res.json(result.rows);
  } catch (err) {
    console.error("Error retrieving todos:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a new todo
app.post('/todo', async (req, res) => {
  const { text } = req.body;
  try {
    await pool.query('INSERT INTO todos (text) VALUES ($1)', [text]);
    res.status(201).json({ message: 'Todo added' });
  } catch (err) {
    console.error("Error adding todo:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a todo (text or completion status)
app.patch('/todo/:id', async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  try {
    await pool.query('UPDATE todos SET text = COALESCE($1, text), completed = COALESCE($2, completed) WHERE id = $3', [text, completed, id]);
    res.status(200).json({ message: 'Todo updated' });
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a specific todo
app.delete('/todo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    if (result.rowCount > 0) {
      res.status(200).json({ message: 'Todo deleted' });
    } else {
      res.status(404).json({ message: 'Todo not found' });
    }
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete all completed todos
app.delete('/todos/completed', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM todos WHERE completed = true');
    res.status(200).json({ message: 'Completed todos deleted', deletedCount: result.rowCount });
  } catch (err) {
    console.error("Error deleting completed todos:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete all todos
app.delete('/todos/all', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM todos');
    res.status(200).json({ message: 'All todos deleted', deletedCount: result.rowCount });
  } catch (err) {
    console.error("Error deleting all todos:", err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
