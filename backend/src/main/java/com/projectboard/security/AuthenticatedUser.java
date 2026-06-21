package com.projectboard.security;

public record AuthenticatedUser(
        Long id,
        String email,
        String username
) {
}
