package com.projectboard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskRequest {
    @NotBlank
    private String title;

    private String description;

    private Boolean completed;
}
