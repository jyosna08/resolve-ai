package com.resolveai.notification.repository;
import com.resolveai.notification.entity.SlaAlert;
import com.resolveai.notification.enums.AlertType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SlaAlertRepository extends JpaRepository<SlaAlert,Long> {
 List<SlaAlert> findByAcknowledgedFalseOrderByCreatedAtDesc();
 Optional<SlaAlert> findByTicketIdAndAlertType(Long ticketId,AlertType alertType);
 boolean existsByTicketIdAndAlertType(Long ticketId,AlertType alertType);
 List<SlaAlert> findByAlertTypeAndAcknowledgedFalseAndSlaDeadlineBefore(AlertType alertType,LocalDateTime now);
}
