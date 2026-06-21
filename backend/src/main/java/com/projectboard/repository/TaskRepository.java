package com.projectboard.repository;

import com.projectboard.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    @Query("select t from Task t join fetch t.project where t.project.id = :projectId order by t.id asc")
    List<Task> findAllForProjectOrderByIdAsc(@Param("projectId") Long projectId);

    @Query("select t from Task t join fetch t.project p join fetch p.user where t.id = :id and p.user.id = :userId")
    Optional<Task> findOwnedTask(@Param("id") Long id, @Param("userId") Long userId);

    long countByProjectId(Long projectId);

    long countByProjectIdAndCompletedTrue(Long projectId);
}
