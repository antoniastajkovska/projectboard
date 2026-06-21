package com.projectboard.repository;

import com.projectboard.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("select p from Project p join fetch p.user where p.user.id = :userId order by p.deadline asc")
    List<Project> findAllForUserOrderByDeadlineAsc(@Param("userId") Long userId);

    @Query("select p from Project p join fetch p.user where p.id = :id and p.user.id = :userId")
    Optional<Project> findOwnedProject(@Param("id") Long id, @Param("userId") Long userId);
}
