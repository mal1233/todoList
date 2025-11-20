import express from 'express'; // const express = require('express'); // Import Express framework
import fs from 'fs'; // const fs = require('fs'); // File system module for reading/writing files
import { PrismaClient } from "@prisma/client"

import cors from 'cors'; // Import CORS middleware const cors = require('cors');

const DB_FILE = "./db.json"; // Path to the JSON file acting as a database
const app = express(); // Create an Express application
const port = 3000; // Define the port number

const prisma = new PrismaClient();

function readTasks() { // Function to read tasks from the JSON file
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
}
function writeTasks(tasks) { // Function to write tasks to the JSON file
    fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request bodies

app.get("/", (req, res) => {
    res.send("✅ Server connected and running");
});

app.get("/api/tasks", async (req, res) => { // GET endpoint to retrieve all tasks
    const tasks = await prisma.task.findMany();
    res.json(tasks);
});

app.post("/tasks", (req, res) => { // POST endpoint to create a new task
    try {
        const tasks = readTasks();

        const newTask = {
            id: Date.now(),
            title: req.body.title,
            completed: false,
            list: req.body.list || "General"
        };

        tasks.tasks.push(newTask);
        writeTasks(tasks);

        res.status(201).json(newTask);
    } catch (error) {
        console.error("POST /tasks error:", error);
        res.status(500).json({ error: "Something went wrong on the server." });
    }
});

app.put("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    let tasks = readTasks();
    const taskIndex = tasks.tasks.findIndex(t => t.id === parseInt(id));

    if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    tasks.tasks[taskIndex].completed = completed;
    writeTasks(tasks);

    res.json(tasks.tasks[taskIndex]);
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