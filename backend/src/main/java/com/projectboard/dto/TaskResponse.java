package com.projectboard.dto;

public record TaskResponse(
        Long id,
        String title,
        String description,
        boolean completed,
        Long projectId
) {
}
