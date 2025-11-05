import { useEffect, useState } from 'react';
import './App.css';

// Main Application Component
function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedList, setSelectedList] = useState('Work');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Fetch tasks from the backend API on component mount
  useEffect(() => {
    fetch('http://localhost:3000/tasks')
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error('Failed to fetch tasks:', err));
  }, []);

  // Filter tasks based on the selected list
  const filteredTasks = tasks.filter(
    task => task.list.trim().toLowerCase() === selectedList.trim().toLowerCase()
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

        {/* Vertical Task List */}
        <ul className="vertical-task-list">
          {filteredTasks.map((task) => (
            <li key={task.id} className={`task-row ${task.completed ? 'completed' : ''}`}>
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={task.completed} readOnly />
                <span className="checkbox-style"></span>
              </label>
              <span className="task-label">{task.title}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default App;
