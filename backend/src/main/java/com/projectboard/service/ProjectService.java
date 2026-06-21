package com.projectboard.service;

import com.projectboard.dto.ProjectDetailResponse;
import com.projectboard.dto.ProjectRequest;
import com.projectboard.dto.ProjectSummaryResponse;
import com.projectboard.dto.TaskResponse;
import com.projectboard.entity.Project;
import com.projectboard.entity.ProjectStatus;
import com.projectboard.entity.Task;
import com.projectboard.entity.User;
import com.projectboard.repository.ProjectRepository;
import com.projectboard.repository.TaskRepository;
import com.projectboard.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public ProjectService(ProjectRepository projectRepository,
                          TaskRepository taskRepository,
                          UserRepository userRepository,
                          CurrentUserService currentUserService) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> getAllProjects() {
        Long userId = currentUserService.requireCurrentUserId();
        return projectRepository.findAllForUserOrderByDeadlineAsc(userId).stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse getProject(Long id) {
        Project project = findOwnedProject(id);
        return toDetailResponse(project);
    }

    public ProjectDetailResponse createProject(ProjectRequest request) {
        User user = requireUser();

        Project project = new Project();
        project.setTitle(request.getTitle().trim());
        project.setDescription(request.getDescription());
        project.setDeadline(request.getDeadline());
        project.setStatus(request.getStatus() == null ? ProjectStatus.PLANNED : request.getStatus());
        project.setUser(user);

        return toDetailResponse(projectRepository.save(project));
    }

    public ProjectDetailResponse updateProject(Long id, ProjectRequest request) {
        Project project = findOwnedProject(id);
        project.setTitle(request.getTitle().trim());
        project.setDescription(request.getDescription());
        project.setDeadline(request.getDeadline());
        project.setStatus(request.getStatus() == null ? ProjectStatus.PLANNED : request.getStatus());
        return toDetailResponse(projectRepository.save(project));
    }

    public void deleteProject(Long id) {
        projectRepository.delete(findOwnedProject(id));
    }

    @Transactional(readOnly = true)
    public Project findOwnedProject(Long id) {
        Long userId = currentUserService.requireCurrentUserId();
        return projectRepository.findOwnedProject(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    public ProjectSummaryResponse toSummaryResponse(Project project) {
        long taskCount = taskRepository.countByProjectId(project.getId());
        long completedTaskCount = taskRepository.countByProjectIdAndCompletedTrue(project.getId());
        return new ProjectSummaryResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getDeadline(),
                project.getStatus(),
                project.getUser().getId(),
                taskCount,
                completedTaskCount,
                calculateProgress(taskCount, completedTaskCount)
        );
    }

    public ProjectDetailResponse toDetailResponse(Project project) {
        List<TaskResponse> tasks = taskRepository.findAllForProjectOrderByIdAsc(project.getId()).stream()
                .map(this::toTaskResponse)
                .toList();
        long taskCount = tasks.size();
        long completedTaskCount = tasks.stream().filter(TaskResponse::completed).count();

        return new ProjectDetailResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getDeadline(),
                project.getStatus(),
                project.getUser().getId(),
                taskCount,
                completedTaskCount,
                calculateProgress(taskCount, completedTaskCount),
                tasks
        );
    }

    public Long getCurrentUserIdForOwnership() {
        return currentUserService.requireCurrentUserId();
    }

    public TaskResponse toTaskResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.isCompleted(),
                task.getProject().getId()
        );
    }

    private User requireUser() {
        Long userId = currentUserService.requireCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private int calculateProgress(long totalTasks, long completedTasks) {
        if (totalTasks <= 0) {
            return 0;
        }
        return (int) Math.round((completedTasks * 100.0) / totalTasks);
    }
}
