package com.projectboard.dto;

import com.projectboard.entity.ProjectStatus;

import java.time.LocalDate;
import java.util.List;

public record ProjectDetailResponse(
        Long id,
        String title,
        String description,
        LocalDate deadline,
        ProjectStatus status,
        Long userId,
        long taskCount,
        long completedTaskCount,
        int progressPercentage,
        List<TaskResponse> tasks
) {
}
