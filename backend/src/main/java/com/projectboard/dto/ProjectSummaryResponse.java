package com.projectboard.dto;

import com.projectboard.entity.ProjectStatus;

import java.time.LocalDate;

public record ProjectSummaryResponse(
        Long id,
        String title,
        String description,
        LocalDate deadline,
        ProjectStatus status,
        Long userId,
        long taskCount,
        long completedTaskCount,
        int progressPercentage
) {
}
