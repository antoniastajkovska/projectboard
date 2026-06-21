package com.projectboard.dto;

public record AuthResponse(
        String token,
        Long userId,
        String username
) {
}
