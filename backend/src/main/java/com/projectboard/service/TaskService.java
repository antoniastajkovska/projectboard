package com.projectboard.service;

import com.projectboard.dto.TaskRequest;
import com.projectboard.dto.TaskResponse;
import com.projectboard.entity.Project;
import com.projectboard.entity.Task;
import com.projectboard.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectService projectService;

    public TaskService(TaskRepository taskRepository, ProjectService projectService) {
        this.taskRepository = taskRepository;
        this.projectService = projectService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksForProject(Long projectId) {
        Project project = projectService.findOwnedProject(projectId);
        return taskRepository.findAllForProjectOrderByIdAsc(project.getId()).stream()
                .map(projectService::toTaskResponse)
                .toList();
    }

    public TaskResponse createTask(Long projectId, TaskRequest request) {
        Project project = projectService.findOwnedProject(projectId);

        Task task = new Task();
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setCompleted(Boolean.TRUE.equals(request.getCompleted()));
        task.setProject(project);

        return projectService.toTaskResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findOwnedTask(id);
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        if (request.getCompleted() != null) {
            task.setCompleted(request.getCompleted());
        }
        return projectService.toTaskResponse(taskRepository.save(task));
    }

    public TaskResponse markComplete(Long id) {
        Task task = findOwnedTask(id);
        task.setCompleted(true);
        return projectService.toTaskResponse(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        taskRepository.delete(findOwnedTask(id));
    }

    private Task findOwnedTask(Long id) {
        Long userId = projectService.getCurrentUserIdForOwnership();
        return taskRepository.findOwnedTask(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }
}
