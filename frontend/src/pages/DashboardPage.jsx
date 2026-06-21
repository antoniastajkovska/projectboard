import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import AlertMessage from "../components/AlertMessage";
import api from "../services/api";
import { getUsername } from "../services/session";

function DashboardStat({ label, value, hint }) {
    return (
        <article className="stat-card stat-card--accent">
            <span className="stat-label">{label}</span>
            <strong className="stat-value">{value}</strong>
            {hint ? <span className="stat-hint">{hint}</span> : null}
        </article>
    );
}

function DashboardPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await api.get("/projects");
                setProjects(response || []);
            } catch (requestError) {
                setError(requestError?.response?.data?.message || "Unable to load dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const overview = useMemo(() => {
        const totalProjects = projects.length;
        const completedProjects = projects.filter((project) => project.status === "COMPLETED").length;
        const inProgressProjects = projects.filter((project) => project.status === "IN_PROGRESS").length;
        const totalTasks = projects.reduce((sum, project) => sum + (project.taskCount || 0), 0);
        const completedTasks = projects.reduce((sum, project) => sum + (project.completedTaskCount || 0), 0);
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const overdueTasks = projects.reduce((sum, project) => {
            if (!project.deadline) {
                return sum;
            }

            const deadline = new Date(`${project.deadline}T00:00:00`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const incompleteTasks = Math.max((project.taskCount || 0) - (project.completedTaskCount || 0), 0);
            return deadline < today ? sum + incompleteTasks : sum;
        }, 0);

        const upcomingProjects = [...projects]
            .filter((project) => project.deadline)
            .sort((left, right) => String(left.deadline).localeCompare(String(right.deadline)))
            .slice(0, 4);

        return {
            totalProjects,
            completedProjects,
            inProgressProjects,
            totalTasks,
            completedTasks,
            completionPercentage,
            overdueTasks,
            upcomingProjects
        };
    }, [projects]);

    return (
        <DashboardLayout
            title={`Hello ${getUsername()}`}
            subtitle="Dashboard | Manage projects and tasks."
            actions={
                <Link className="button button-primary" to="/projects">
                    Create project
                </Link>
            }
        >
            <section className="dashboard-overview">
                <AlertMessage variant="error">{error}</AlertMessage>

                <div className="stats-grid">
                    <DashboardStat
                        label="Projects"
                        value={loading ? "..." : overview.totalProjects}
                        hint="All of your active workspaces"
                    />
                    <DashboardStat
                        label="In progress"
                        value={loading ? "..." : overview.inProgressProjects}
                        hint="Projects currently moving forward"
                    />
                    <DashboardStat
                        label="Completed"
                        value={loading ? "..." : overview.completedProjects}
                        hint="Finished project boards"
                    />
                    <DashboardStat
                        label="Tasks"
                        value={loading ? "..." : overview.totalTasks}
                        hint="Open and completed task total"
                    />
                    <DashboardStat
                        label="Done"
                        value={loading ? "..." : overview.completedTasks}
                        hint={`${overview.completionPercentage}% completion`}
                    />
                    <DashboardStat
                        label="Overdue"
                        value={loading ? "..." : overview.overdueTasks}
                        hint={overview.overdueTasks > 0 ? "Needs attention" : "No overdue tasks"}
                    />
                </div>

                <div className="dashboard-split">
                    <article className="panel">
                        <div className="panel-header">
                            <div>
                                <div className="eyebrow">Focus</div>
                                <h2>Upcoming deadlines</h2>
                            </div>
                            <button className="button button-secondary" type="button" onClick={() => navigate("/projects")}>
                                Manage projects
                            </button>
                        </div>

                        {loading ? (
                            <div className="empty-state">Loading dashboard...</div>
                        ) : overview.upcomingProjects.length === 0 ? (
                            <div className="empty-state">
                                No projects yet. Create your first project to see it here.
                            </div>
                        ) : (
                            <div className="overview-list">
                                {overview.upcomingProjects.map((project) => {
                                    const totalTasks = project.taskCount || 0;
                                    const completedTasks = project.completedTaskCount || 0;
                                    const progress = project.progressPercentage ?? (totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100));
                                    const deadline = new Date(`${project.deadline}T00:00:00`);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const daysRemaining = Math.ceil((deadline - today) / 86400000);
                                    const overdue = deadline < today && progress < 100;

                                    return (
                                        <article key={project.id} className={`overview-item ${overdue ? "overdue" : ""}`}>
                                            <div className="overview-item-main">
                                                <div>
                                                    <h3>{project.title}</h3>
                                                    <p>{project.description || "No description provided."}</p>
                                                </div>
                                                <span className={`status-pill ${String(project.status || "").toLowerCase() || "muted"}`}>
                                                    {project.status}
                                                </span>
                                            </div>

                                            <div className="progress-wrap">
                                                <div className="progress-label">
                                                    <span>{completedTasks}/{totalTasks} tasks</span>
                                                    <span>
                                                        {overdue
                                                            ? `Overdue by ${Math.abs(daysRemaining)} days`
                                                            : daysRemaining === 0
                                                                ? "Due today"
                                                                : `Due in ${daysRemaining} days`}
                                                    </span>
                                                </div>
                                                <div className="progress-bar" aria-hidden="true">
                                                    <span style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>

                                            <div className="row-actions">
                                                {overdue ? <span className="status-pill overdue">Warning</span> : null}
                                                <button
                                                    className="button button-secondary"
                                                    type="button"
                                                    onClick={() => navigate(`/projects/${project.id}`)}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </article>

                    <article className="panel">
                        <div className="panel-header">
                            <div>
                                <div className="eyebrow">Jump in</div>
                                <h2>Quick actions</h2>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <Link className="quick-action" to="/projects">
                                <strong>Create or edit projects</strong>
                                <span>Open the full workspace and manage every project card.</span>
                            </Link>
                            <Link className="quick-action" to="/projects">
                                <strong>Review deadlines</strong>
                                <span>Check project status, progress, and task counts in one place.</span>
                            </Link>
                            <Link className="quick-action" to="/projects">
                                <strong>Track tasks</strong>
                                <span>Open a project to add, complete, or remove tasks.</span>
                            </Link>
                        </div>
                    </article>
                </div>
            </section>
        </DashboardLayout>
    );
}

export default DashboardPage;
