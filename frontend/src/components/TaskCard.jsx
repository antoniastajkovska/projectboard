function TaskCard({ task, overdue = false, onEdit, onComplete, onToggle, onDelete }) {
    return (
        <article className={`task-card ${task.completed ? "task-complete" : ""} ${overdue ? "overdue" : ""}`}>
            <div>
                <div className="row-actions" style={{ marginBottom: "0.5rem" }}>
                    <h3>{task.title}</h3>
                    {overdue && !task.completed ? <span className="status-pill overdue">Overdue</span> : null}
                </div>
                <p>{task.description || "No description provided."}</p>
            </div>
            <div className="row-actions">
                <span className={`status-pill ${task.completed ? "success" : "muted"}`}>
                    {task.completed ? "Completed" : "Open"}
                </span>
                <button className="button button-secondary" type="button" onClick={onEdit}>
                    Edit
                </button>
                <button className="button button-success" type="button" onClick={onComplete} disabled={task.completed}>
                    Mark done
                </button>
                <button className="button button-secondary" type="button" onClick={onToggle}>
                    Toggle
                </button>
                <button className="button button-danger" type="button" onClick={onDelete}>
                    Delete
                </button>
            </div>
        </article>
    );
}

export default TaskCard;
