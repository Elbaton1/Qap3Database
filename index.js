const express = require("express");
const app = express();
const { Pool } = require("pg");
const PORT = 3000;

app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "taskmanager",
  password: "5348",
  port: 5432,
});

// create tasks table if it doesn't exist
pool.query(
  `CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    description TEXT,
    status TEXT
  );`,
  (err, res) => {
    if (err) {
      console.error("Error creating the damn table:", err);
    } else {
      console.log("Tasks table is ready les get it");
    }
  }
);

// GET /tasks - Get all tasks
app.get("/tasks", (req, res) => {
  pool.query("SELECT * FROM tasks ORDER BY id ASC", (err, result) => {
    if (err) {
      res.status(500).json({ error: "Database error man" });
    } else {
      res.json(result.rows);
    }
  });
});

// POST /tasks - Add a new task
app.post("/tasks", (request, response) => {
  const { description, status } = request.body;
  if (!description || !status) {
    return response
      .status(400)
      .json({ error: "Description and status are required dude" });
  }
  pool.query(
    "INSERT INTO tasks (description, status) VALUES ($1, $2) RETURNING *",
    [description, status],
    (err, result) => {
      if (err) {
        response.status(500).json({ error: "Database error bro cmon" });
      } else {
        response.status(201).json(result.rows[0]);
      }
    }
  );
});

// PUT /tasks/:id - Update a task's status
app.put("/tasks/:id", (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  const { status } = request.body;
  if (!status) {
    return response.status(400).json({ error: "Status is required" });
  }
  pool.query(
    "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
    [status, taskId],
    (err, result) => {
      if (err) {
        response
          .status(500)
          .json({ error: "Database error 'facepalm' do better mike" });
      } else if (result.rows.length === 0) {
        response.status(404).json({ error: "Task aint there" });
      } else {
        response.json({ message: "Task updated successfully u da man" });
      }
    }
  );
});

// DELETE /tasks/:id - Delete a task
app.delete("/tasks/:id", (request, response) => {
  const taskId = parseInt(request.params.id, 10);
  pool.query(
    "DELETE FROM tasks WHERE id = $1 RETURNING *",
    [taskId],
    (err, result) => {
      if (err) {
        response
          .status(500)
          .json({ error: "Database error 'facepalm' do better mike" });
      } else if (result.rows.length === 0) {
        response.status(404).json({ error: "Task aint there" });
      } else {
        response.json({ message: "Task deleted successfully mf" });
      }
    }
  );
});

app.use((req, res) => {
  res.status(404).send("Not Found bro");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
