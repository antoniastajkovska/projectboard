package com.projectboard.controller;

import com.projectboard.dto.ApiResponse;
import com.projectboard.dto.ProjectDetailResponse;
import com.projectboard.dto.ProjectRequest;
import com.projectboard.dto.ProjectSummaryResponse;
import com.projectboard.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ApiResponse<List<ProjectSummaryResponse>> getAllProjects() {
        return ApiResponse.success("Projects loaded", projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectDetailResponse> getProject(@PathVariable Long id) {
        return ApiResponse.success("Project loaded", projectService.getProject(id));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> createProject(@Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created", projectService.createProject(request)));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProjectDetailResponse> updateProject(@PathVariable Long id,
                                                            @Valid @RequestBody ProjectRequest request) {
        return ApiResponse.success("Project updated", projectService.updateProject(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ApiResponse.success("Project deleted");
    }
}
