import { useEffect, useState } from 'react';
import './App.css';
import TaskList from "./components/TaskList";

// Main Application Component
function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedList, setSelectedList] = useState('Work');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Fetch tasks from the backend API on component mount
  useEffect(() => {
    fetch('http://localhost:3000/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched tasks:", data);
        setTasks(data.tasks);
      })
      .catch((err) => console.error('Failed to fetch tasks:', err));
  }, []);

  // Filter tasks based on the selected list
  const filteredTasks = tasks.filter(
    task => task.list && task.list.trim().toLowerCase() === selectedList.trim().toLowerCase()
  );

  // Handle adding a new task
  async function handleAddTask() {
    if (newTaskTitle.trim() === '') return;
    const newTask = {
      title: newTaskTitle,
      completed: false,
      list: selectedList
    };
    try {
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const savedTask = await response.json();
      setTasks([...tasks, savedTask]);
      setNewTaskTitle('');
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  }

  // Handle toggling task completion
  async function handleToggleComplete(id, newStatus) {
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newStatus })
      });

      const updatedTask = await response.json();

      // Update state locally
      let newTaskList = [...tasks];
      const taskIndex = newTaskList.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        newTaskList[taskIndex] = updatedTask;
        setTasks(newTaskList);
      }
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  }

  // Render the application UI
  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">My Lists</h2>
        <ul className="list-menu">
          {['Work', 'School', 'Home'].map(list => (
            <li
              key={list}
              className={`list-item ${selectedList === list ? 'active' : ''}`}
              onClick={() => setSelectedList(list)}
            >
              {list === 'Work' ? '💼' : list === 'School' ? '📚' : '🏠'} {list}
            </li>
          ))}
          <li className="list-item"> New List</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-view">
        <p className="section-label">Today</p>
        <h1 className="title">{selectedList}</h1>

        {/* Add Task Input */}
        <div className="add-task">
          <input
            type="text"
            placeholder={`Add a task to ${selectedList}...`}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
            }}
          />
          <button onClick={handleAddTask}>Add</button>
        </div>
        <div>
          {/* Vertical Task List */}
          <TaskList
            tasks={[...filteredTasks].sort((a, b) => Number(a.completed) - Number(b.completed))}
            onToggle={handleToggleComplete}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
