package com.projectboard.dto;

import com.projectboard.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDate deadline;

    private ProjectStatus status;
}
