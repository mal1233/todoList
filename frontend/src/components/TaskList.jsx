export default function TaskList({ tasks, onToggle }) {
    return (
        <ul className="vertical-task-list">
            {tasks.map(task => (
                <li key={task.id} className={`task-row ${task.completed ? 'completed' : ''}`}>
                    <label className="checkbox-wrapper">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggle(task.id, !task.completed)}
                        />
                        <span className="checkbox-style"></span>
                    </label>
                    <span className="task-label">{task.title}</span>
                </li>
            ))}
        </ul>
    );
}
