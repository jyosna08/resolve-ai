package com.resolveai.auth.repository;
import com.resolveai.auth.entity.User;
import com.resolveai.auth.enums.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findFirstByRoleAndDepartmentOrderByActiveTicketCountAscIdAsc(Role role, Department department);
    @Modifying @Query("update User u set u.activeTicketCount = u.activeTicketCount + 1 where u.id = :id") int increment(@Param("id") Long id);
    @Modifying @Query("update User u set u.activeTicketCount = u.activeTicketCount - 1 where u.id = :id and u.activeTicketCount > 0") int decrement(@Param("id") Long id);
}
