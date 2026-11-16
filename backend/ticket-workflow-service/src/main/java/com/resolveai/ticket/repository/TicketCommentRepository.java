package com.resolveai.ticket.repository;
import com.resolveai.ticket.entity.TicketComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TicketCommentRepository extends JpaRepository<TicketComment,Long> { List<TicketComment> findAllByTicketIdOrderByCreatedAtAscIdAsc(Long ticketId); }
