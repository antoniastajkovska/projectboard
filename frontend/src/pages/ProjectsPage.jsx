import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";
import DashboardLayout from "../components/DashboardLayout";
import ProjectCard from "../components/ProjectCard";
import api from "../services/api";
import { showToast } from "../services/toast";
import { buildFieldErrors, getGeneralErrorMessage } from "../services/validation";

const emptyProject = {
    title: "",
    description: "",
    deadline: "",
    status: "PLANNED"
};

const statusOptions = ["ALL", "PLANNED", "IN_PROGRESS", "COMPLETED"];

function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState(emptyProject);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("deadline-asc");
    const [projectToDelete, setProjectToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/projects");
            setProjects(response || []);
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Unable to load projects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const saveProject = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        setFieldErrors({});

        try {
            if (editingId) {
                await api.put(`/projects/${editingId}`, form);
                showToast("Project updated successfully", "success");
            } else {
                await api.post("/projects", form);
                showToast("Project created successfully", "success");
            }

            setForm(emptyProject);
            setEditingId(null);
            await fetchProjects();
        } catch (requestError) {
            const message = requestError?.response?.data?.message || "Unable to save project.";
            const parsedFieldErrors = buildFieldErrors(message, ["title", "deadline", "status"]);
            setFieldErrors(parsedFieldErrors);
            setError(getGeneralErrorMessage(message, parsedFieldErrors) || "Unable to save project.");
            showToast("Project save failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const editProject = (project) => {
        setEditingId(project.id);
        setFieldErrors({});
        setError("");
        setForm({
            title: project.title,
            description: project.description || "",
            deadline: project.deadline || "",
            status: project.status || "PLANNED"
        });
    };

    const requestDeleteProject = (project) => {
        setProjectToDelete(project);
    };

    const confirmDeleteProject = async () => {
        if (!projectToDelete) {
            return;
        }

        setError("");

        try {
            await api.delete(`/projects/${projectToDelete.id}`);
            showToast("Project deleted", "success");
            setProjectToDelete(null);
            await fetchProjects();
        } catch (requestError) {
            setError(requestError?.response?.data?.message || "Unable to delete project.");
            showToast("Project delete failed", "error");
        }
    };

    const clearForm = () => {
        setEditingId(null);
        setFieldErrors({});
        setForm(emptyProject);
    };

    const visibleProjects = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        const filtered = projects.filter((project) => {
            const matchesSearch =
                !normalizedSearch ||
                project.title?.toLowerCase().includes(normalizedSearch) ||
                project.description?.toLowerCase().includes(normalizedSearch);
            const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        const sorted = [...filtered];
        sorted.sort((left, right) => {
            const leftTitle = String(left.title || "").toLowerCase();
            const rightTitle = String(right.title || "").toLowerCase();
            const leftDeadline = String(left.deadline || "");
            const rightDeadline = String(right.deadline || "");

            switch (sortBy) {
                case "deadline-desc":
                    return rightDeadline.localeCompare(leftDeadline);
                case "title-asc":
                    return leftTitle.localeCompare(rightTitle);
                case "deadline-asc":
                default:
                    return leftDeadline.localeCompare(rightDeadline);
            }
        });

        return sorted;
    }, [projects, search, statusFilter, sortBy]);

    return (
        <DashboardLayout title="Projects" subtitle="Create, edit, and organize every project and task.">
            <section className="dashboard-grid">
                <article className="panel">
                    <AlertMessage variant="error">{error}</AlertMessage>

                    <div className="panel-header">
                        <div>
                            <div className="eyebrow">Project Studio</div>
                            <h2>{editingId ? "Edit project" : "Create a project"}</h2>
                        </div>
                        {editingId ? (
                            <button className="button button-secondary" type="button" onClick={clearForm}>
                                Cancel edit
                            </button>
                        ) : null}
                    </div>

                    <form className="stack-form" onSubmit={saveProject}>
                        <div className="field-grid">
                            <label>
                                Title
                                <input
                                    type="text"
                                    value={form.title}
                                    required
                                    className={fieldErrors.title ? "input-error" : ""}
                                    onChange={(event) => setForm({ ...form, title: event.target.value })}
                                    placeholder="Project title"
                                />
                                {fieldErrors.title ? <span className="field-error-text">{fieldErrors.title}</span> : null}
                            </label>
                            <label>
                                Deadline
                                <input
                                    type="date"
                                    value={form.deadline}
                                    required
                                    className={fieldErrors.deadline ? "input-error" : ""}
                                    onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                                />
                                {fieldErrors.deadline ? <span className="field-error-text">{fieldErrors.deadline}</span> : null}
                            </label>
                        </div>

                        <label>
                            Description
                            <textarea
                                rows="4"
                                value={form.description}
                                onChange={(event) => setForm({ ...form, description: event.target.value })}
                                placeholder="What is this project about?"
                            />
                        </label>

                        <label>
                            Status
                            <select
                                value={form.status}
                                className={fieldErrors.status ? "input-error" : ""}
                                onChange={(event) => setForm({ ...form, status: event.target.value })}
                            >
                                <option value="PLANNED">PLANNED</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                            {fieldErrors.status ? <span className="field-error-text">{fieldErrors.status}</span> : null}
                        </label>

                        <button className="button button-primary" type="submit" disabled={saving}>
                            {saving ? "Saving..." : editingId ? "Update project" : "Create project"}
                        </button>
                    </form>
                </article>

                <article className="panel">
                    <div className="panel-header">
                        <div>
                            <div className="eyebrow">Workspace</div>
                            <h2>All projects</h2>
                        </div>
                    </div>

                    <div className="filter-bar">
                        <label>
                            Search
                            <input
                                type="search"
                                placeholder="Search by title or description"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </label>
                        <label>
                            Status
                            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                {statusOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Sort by
                            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                                <option value="deadline-asc">Deadline, nearest first</option>
                                <option value="deadline-desc">Deadline, latest first</option>
                                <option value="title-asc">Title, A to Z</option>
                            </select>
                        </label>
                    </div>

                    {loading ? (
                        <div className="empty-state">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <div className="empty-state">
                            No projects yet. Create one on the left to get started.
                        </div>
                    ) : visibleProjects.length === 0 ? (
                        <div className="empty-state">
                            No projects match your search or filter settings.
                        </div>
                    ) : (
                        <div className="project-grid">
                            {visibleProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onView={() => navigate(`/projects/${project.id}`)}
                                    onEdit={() => editProject(project)}
                                    onDelete={() => requestDeleteProject(project)}
                                />
                            ))}
                        </div>
                    )}
                </article>
            </section>

            <ConfirmModal
                open={Boolean(projectToDelete)}
                title="Delete project?"
                message={
                    projectToDelete
                        ? `Are you sure you want to delete "${projectToDelete.title}"? This will also remove its tasks.`
                        : ""
                }
                confirmLabel="Delete project"
                onCancel={() => setProjectToDelete(null)}
                onConfirm={confirmDeleteProject}
            />
        </DashboardLayout>
    );
}

export default ProjectsPage;
