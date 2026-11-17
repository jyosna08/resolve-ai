package com.resolveai.ticket.repository;
import com.resolveai.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface TicketRepository extends JpaRepository<Ticket,Long>,JpaSpecificationExecutor<Ticket> { }
