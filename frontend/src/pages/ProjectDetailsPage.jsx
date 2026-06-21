import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";
import DashboardLayout from "../components/DashboardLayout";
import TaskCard from "../components/TaskCard";
import api from "../services/api";
import { showToast } from "../services/toast";
import { buildFieldErrors, getGeneralErrorMessage } from "../services/validation";

const emptyProject = {
    title: "",
    description: "",
    deadline: "",
    status: "PLANNED"
};

const emptyTask = {
    title: "",
    description: "",
    completed: false
};

function ProjectDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [projectForm, setProjectForm] = useState(emptyProject);
    const [taskForm, setTaskForm] = useState(emptyTask);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [savingProject, setSavingProject] = useState(false);
    const [savingTask, setSavingTask] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [projectFieldErrors, setProjectFieldErrors] = useState({});
    const [taskFieldErrors, setTaskFieldErrors] = useState({});
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchProject = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [projectResponse, tasksResponse] = await Promise.all([
                api.get(`/projects/${id}`),
                api.get(`/projects/${id}/tasks`)
            ]);

            setProject({
                ...projectResponse,
                tasks: tasksResponse || []
            });
            setProjectForm({
                title: projectResponse.title || "",
                description: projectResponse.description || "",
                deadline: projectResponse.deadline || "",
                status: projectResponse.status || "PLANNED"
            });
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Unable to load project details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const projectMetrics = useMemo(() => {
        if (!project) {
            return {
                completedTasks: 0,
                overdueTasks: 0,
                progress: 0,
                daysRemaining: null,
                overdueProject: false
            };
        }

        const tasks = project.tasks || [];
        const completedTasks = tasks.filter((task) => task.completed).length;
        const progress = project.progressPercentage ?? (tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = project.deadline ? new Date(`${project.deadline}T00:00:00`) : null;
        const overdueProject = Boolean(deadline && deadline < today && progress < 100);
        const overdueTasks = overdueProject ? tasks.filter((task) => !task.completed).length : 0;
        const daysRemaining = deadline ? Math.ceil((deadline - today) / 86400000) : null;

        return {
            completedTasks,
            overdueTasks,
            progress,
            daysRemaining,
            overdueProject
        };
    }, [project]);

    const saveProject = async (event) => {
        event.preventDefault();
        setSavingProject(true);
        setError("");
        setProjectFieldErrors({});

        try {
            await api.put(`/projects/${id}`, projectForm);
            showToast("Project updated successfully", "success");
            await fetchProject();
        } catch (requestError) {
            const message = requestError?.response?.data?.message || "Unable to save project.";
            const parsedFieldErrors = buildFieldErrors(message, ["title", "deadline", "status"]);
            setProjectFieldErrors(parsedFieldErrors);
            setError(getGeneralErrorMessage(message, parsedFieldErrors) || "Unable to save project.");
            showToast("Project save failed", "error");
        } finally {
            setSavingProject(false);
        }
    };

    const submitTask = async (event) => {
        event.preventDefault();
        setSavingTask(true);
        setError("");
        setTaskFieldErrors({});

        try {
            if (editingTaskId) {
                await api.put(`/tasks/${editingTaskId}`, taskForm);
                showToast("Task updated successfully", "success");
            } else {
                await api.post(`/projects/${id}/tasks`, taskForm);
                showToast("Task added successfully", "success");
            }

            setTaskForm(emptyTask);
            setEditingTaskId(null);
            setTaskFieldErrors({});
            await fetchProject();
        } catch (requestError) {
            const message = requestError?.response?.data?.message || "Unable to save task.";
            const parsedFieldErrors = buildFieldErrors(message, ["title"]);
            setTaskFieldErrors(parsedFieldErrors);
            setError(getGeneralErrorMessage(message, parsedFieldErrors) || "Unable to save task.");
            showToast("Task save failed", "error");
        } finally {
            setSavingTask(false);
        }
    };

    const editTask = (task) => {
        setEditingTaskId(task.id);
        setTaskFieldErrors({});
        setTaskForm({
            title: task.title,
            description: task.description || "",
            completed: task.completed
        });
    };

    const clearTaskForm = () => {
        setEditingTaskId(null);
        setTaskFieldErrors({});
        setTaskForm(emptyTask);
    };

    const toggleTask = async (task) => {
        setError("");

        try {
            await api.put(`/tasks/${task.id}`, {
                title: task.title,
                description: task.description,
                completed: !task.completed
            });
            showToast(task.completed ? "Task reopened" : "Task updated", "success");
            await fetchProject();
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Unable to update task.");
            showToast("Task update failed", "error");
        }
    };

    const completeTask = async (taskId) => {
        setError("");

        try {
            await api.patch(`/tasks/${taskId}/complete`);
            showToast("Task completed", "success");
            await fetchProject();
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Unable to update task.");
            showToast("Task completion failed", "error");
        }
    };

    const requestDelete = (type, entity) => {
        setDeleteTarget({ type, entity });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) {
            return;
        }

        setError("");

        try {
            if (deleteTarget.type === "task") {
                await api.delete(`/tasks/${deleteTarget.entity.id}`);
                showToast("Task deleted", "success");
                if (editingTaskId === deleteTarget.entity.id) {
                    clearTaskForm();
                }
            } else {
                await api.delete(`/projects/${id}`);
                showToast("Project deleted", "success");
                navigate("/projects");
                return;
            }

            setDeleteTarget(null);
            await fetchProject();
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Unable to delete item.");
            showToast("Delete failed", "error");
        }
    };

    if ((loading || error) && !project) {
        return (
            <main className="app-shell">
                <div className="loading-panel">{loading ? "Loading project..." : error}</div>
            </main>
        );
    }

    const tasks = project.tasks || [];

    return (
        <DashboardLayout
            title={project.title}
            subtitle="Project details, deadlines, and task tracking in one place."
            actions={
                <Link className="button button-secondary" to="/projects">
                    Back to projects
                </Link>
            }
        >
            <section className="dashboard-grid">
                <article className={`panel ${projectMetrics.overdueProject ? "overdue" : ""}`}>
                    <AlertMessage variant="error">{error}</AlertMessage>

                    <div className="panel-header">
                        <div>
                            <div className="eyebrow">Project Info</div>
                            <h2>Review and update the project</h2>
                        </div>
                        <button className="button button-danger" type="button" onClick={() => requestDelete("project", project)}>
                            Delete project
                        </button>
                    </div>

                    <form className="stack-form" onSubmit={saveProject}>
                        <div className="field-grid">
                            <label>
                                Title
                                <input
                                    type="text"
                                    value={projectForm.title}
                                    required
                                    className={projectFieldErrors.title ? "input-error" : ""}
                                    onChange={(event) =>
                                        setProjectForm({ ...projectForm, title: event.target.value })
                                    }
                                />
                                {projectFieldErrors.title ? (
                                    <span className="field-error-text">{projectFieldErrors.title}</span>
                                ) : null}
                            </label>
                            <label>
                                Deadline
                                <input
                                    type="date"
                                    value={projectForm.deadline}
                                    required
                                    className={projectFieldErrors.deadline ? "input-error" : ""}
                                    onChange={(event) =>
                                        setProjectForm({
                                            ...projectForm,
                                            deadline: event.target.value
                                        })
                                    }
                                />
                                {projectFieldErrors.deadline ? (
                                    <span className="field-error-text">{projectFieldErrors.deadline}</span>
                                ) : null}
                            </label>
                        </div>

                        <label>
                            Description
                            <textarea
                                rows="4"
                                value={projectForm.description}
                                onChange={(event) =>
                                    setProjectForm({ ...projectForm, description: event.target.value })
                                }
                            />
                        </label>

                        <label>
                            Status
                            <select
                                value={projectForm.status}
                                className={projectFieldErrors.status ? "input-error" : ""}
                                onChange={(event) =>
                                    setProjectForm({ ...projectForm, status: event.target.value })
                                }
                            >
                                <option value="PLANNED">PLANNED</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                            {projectFieldErrors.status ? (
                                <span className="field-error-text">{projectFieldErrors.status}</span>
                            ) : null}
                        </label>

                        <div className="progress-wrap">
                            <div className="progress-label">
                                <span>{projectMetrics.completedTasks}/{tasks.length} tasks</span>
                                <span>
                                    {projectMetrics.overdueProject
                                        ? `Overdue by ${Math.abs(projectMetrics.daysRemaining)} days`
                                        : projectMetrics.daysRemaining === 0
                                            ? "Due today"
                                            : projectMetrics.daysRemaining == null
                                                ? "No deadline"
                                                : `Due in ${projectMetrics.daysRemaining} days`}
                                </span>
                            </div>
                            <div className="progress-bar" aria-hidden="true">
                                <span style={{ width: `${projectMetrics.progress}%` }} />
                            </div>
                        </div>

                        <div className="meta-row">
                            <span>{projectMetrics.progress}% complete</span>
                            <span className={projectMetrics.overdueProject ? "overdue-text" : ""}>
                                {projectMetrics.overdueTasks} overdue tasks
                            </span>
                        </div>

                        <button className="button button-primary" type="submit" disabled={savingProject}>
                            {savingProject ? "Saving..." : "Save project"}
                        </button>
                    </form>
                </article>

                <article className="panel">
                    <div className="panel-header">
                        <div>
                            <div className="eyebrow">Tasks</div>
                            <h2>{tasks.length} tasks</h2>
                        </div>
                    </div>

                    <form className="stack-form" onSubmit={submitTask}>
                        <div className="field-grid">
                            <label>
                                Task title
                                <input
                                    type="text"
                                    placeholder="Design the slides"
                                    value={taskForm.title}
                                    required
                                    className={taskFieldErrors.title ? "input-error" : ""}
                                    onChange={(event) =>
                                        setTaskForm({ ...taskForm, title: event.target.value })
                                    }
                                />
                                {taskFieldErrors.title ? (
                                    <span className="field-error-text">{taskFieldErrors.title}</span>
                                ) : null}
                            </label>
                            <label className="checkbox-row">
                                <span>Completed</span>
                                <input
                                    type="checkbox"
                                    checked={taskForm.completed}
                                    onChange={(event) =>
                                        setTaskForm({ ...taskForm, completed: event.target.checked })
                                    }
                                />
                            </label>
                        </div>

                        <label>
                            Description
                            <textarea
                                rows="3"
                                placeholder="Add supporting details, links, or notes"
                                value={taskForm.description}
                                onChange={(event) =>
                                    setTaskForm({ ...taskForm, description: event.target.value })
                                }
                            />
                        </label>

                        <div className="row-actions">
                            <button className="button button-primary" type="submit" disabled={savingTask}>
                                {savingTask
                                    ? "Saving..."
                                    : editingTaskId
                                        ? "Update task"
                                        : "Add task"}
                            </button>
                            {editingTaskId ? (
                                <button className="button button-secondary" type="button" onClick={clearTaskForm}>
                                    Cancel
                                </button>
                            ) : null}
                        </div>
                    </form>

                    <div className="task-list">
                        {tasks.length === 0 ? (
                            <div className="empty-state">No tasks yet. Add the first one above.</div>
                        ) : (
                            tasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    overdue={projectMetrics.overdueProject && !task.completed}
                                    onEdit={() => editTask(task)}
                                    onComplete={() => completeTask(task.id)}
                                    onToggle={() => toggleTask(task)}
                                    onDelete={() => requestDelete("task", task)}
                                />
                            ))
                        )}
                    </div>
                </article>
            </section>

            <ConfirmModal
                open={Boolean(deleteTarget)}
                title={deleteTarget?.type === "task" ? "Delete task?" : "Delete project?"}
                message={
                    deleteTarget
                        ? deleteTarget.type === "task"
                            ? `Are you sure you want to delete "${deleteTarget.entity.title}"?`
                            : `Are you sure you want to delete "${deleteTarget.entity.title}" and all of its tasks?`
                        : ""
                }
                confirmLabel={deleteTarget?.type === "task" ? "Delete task" : "Delete project"}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
            />
        </DashboardLayout>
    );
}

export default ProjectDetailsPage;
