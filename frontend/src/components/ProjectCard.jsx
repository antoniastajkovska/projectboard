function ProjectCard({ project, onView, onEdit, onDelete }) {
    const totalTasks = project.taskCount || 0;
    const completedTasks = project.completedTaskCount || 0;
    const progress = project.progressPercentage ?? (totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100));
    const deadline = project.deadline ? new Date(`${project.deadline}T00:00:00`) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = Boolean(deadline && deadline < today && progress < 100);
    const daysRemaining = deadline ? Math.ceil((deadline - today) / 86400000) : null;

    return (
        <article className={`project-card ${isOverdue ? "overdue" : ""}`}>
            <div className="card-head">
                <div>
                    <h3>{project.title}</h3>
                    <p>{project.description || "No description provided."}</p>
                </div>
                <span className={`status-pill ${String(project.status || "").toLowerCase() || "muted"}`}>
                    {project.status}
                </span>
            </div>

            <div className="meta-row">
                <span>Deadline: {project.deadline || "Not set"}</span>
                <span>{completedTasks}/{totalTasks} tasks</span>
            </div>

            <div className="progress-wrap">
                <div className="progress-label">
                    <span>{progress}% complete</span>
                    <span>{isOverdue ? "Overdue" : daysRemaining === 0 ? "Due today" : daysRemaining < 0 ? "Overdue" : daysRemaining != null ? `Due in ${daysRemaining} days` : "No deadline"}</span>
                </div>
                <div className="progress-bar" aria-hidden="true">
                    <span style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="row-actions">
                {isOverdue ? <span className="status-pill overdue">Overdue</span> : null}
                <button className="button button-secondary" type="button" onClick={onView}>
                    View
                </button>
                <button className="button button-secondary" type="button" onClick={onEdit}>
                    Edit
                </button>
                <button className="button button-danger" type="button" onClick={onDelete}>
                    Delete
                </button>
            </div>
        </article>
    );
}

export default ProjectCard;
