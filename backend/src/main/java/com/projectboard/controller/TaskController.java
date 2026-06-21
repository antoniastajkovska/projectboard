package com.projectboard.controller;

import com.projectboard.dto.ApiResponse;
import com.projectboard.dto.TaskRequest;
import com.projectboard.dto.TaskResponse;
import com.projectboard.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ApiResponse<List<TaskResponse>> getTasks(@PathVariable Long projectId) {
        return ApiResponse.success("Tasks loaded", taskService.getTasksForProject(projectId));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ApiResponse<TaskResponse> createTask(@PathVariable Long projectId,
                                                @Valid @RequestBody TaskRequest request) {
        return ApiResponse.success("Task created", taskService.createTask(projectId, request));
    }

    @PutMapping("/tasks/{id}")
    public ApiResponse<TaskResponse> updateTask(@PathVariable Long id,
                                                @Valid @RequestBody TaskRequest request) {
        return ApiResponse.success("Task updated", taskService.updateTask(id, request));
    }

    @PatchMapping("/tasks/{id}/complete")
    public ApiResponse<TaskResponse> markComplete(@PathVariable Long id) {
        return ApiResponse.success("Task completed", taskService.markComplete(id));
    }

    @DeleteMapping("/tasks/{id}")
    public ApiResponse<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ApiResponse.success("Task deleted");
    }
}
