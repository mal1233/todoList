const express = require('express'); // Import Express framework
const app = express(); // Create an Express application
const port = 3000; // Define the port number
const fs = require('fs'); // File system module for reading/writing files
const DB_FILE = './db.json'; // Path to the JSON file acting as a database
const { Pool } = require('pg'); // PostgreSQL client


function readTasks() { // Function to read tasks from the JSON file
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
}
function writeTasks(tasks) { // Function to write tasks to the JSON file
    fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}


app.use(express.json()); // Middleware to parse JSON request bodies

app.get("/", (req, res) => {
    res.send("✅ Server connected and running");
});

app.get("/api/tasks", (req, res) => { // GET endpoint to retrieve all tasks
    const tasks = readTasks();
    res.json(tasks);
});

app.post("/tasks", (req, res) => { // POST endpoint to create a new task
    try {
        const tasks = readTasks();

        const newTask = {
            id: Date.now(),
            title: req.body.title,
            completed: false,
        };

        tasks.push(newTask);
        writeTasks(tasks);

        res.status(201).json(newTask);
    } catch (error) {
        console.error("POST /tasks error:", error);
        res.status(500).json({ error: "Something went wrong on the server." });
    }
});

app.put("/tasks/:id", (req, res) => { // PUT endpoint to update a task by ID
    const tasks = readTasks();
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    task.title = req.body.title ?? task.title;
    task.completed = req.body.completed ?? task.completed;

    writeTasks(tasks);
    res.json(task);
});


app.delete("/tasks/:id", (req, res) => { // DELETE endpoint to delete a task by ID
    let tasks = readTasks();
    const taskId = parseInt(req.params.id);
    const initialLength = tasks.length;

    tasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === initialLength) {
        return res.status(404).json({ message: "Task not found" });
    }

    writeTasks(tasks);
    res.json({ message: "Task deleted" });
});


app.listen(port, () => { // Start the server
    console.log(`Server is running on http://localhost:${port}`);
})