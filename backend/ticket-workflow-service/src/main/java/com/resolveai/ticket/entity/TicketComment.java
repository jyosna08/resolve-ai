package com.resolveai.ticket.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="ticket_comments")
public class TicketComment {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="ticket_id",nullable=false,foreignKey=@ForeignKey(name="fk_ticket_comments_ticket")) private Ticket ticket;
 @Column(name="author_id",nullable=false) private Long authorId;
 @Column(name="author_name",nullable=false,length=100) private String authorName;
 @Column(nullable=false,columnDefinition="TEXT") private String message;
 @Column(name="is_ai_verified") private boolean aiVerified;
 @Column(name="created_at",updatable=false) private LocalDateTime createdAt;
 @PrePersist void onCreate(){if(createdAt==null)createdAt=LocalDateTime.now();}
 public Long getId(){return id;} public void setId(Long v){id=v;}
 public Ticket getTicket(){return ticket;} public void setTicket(Ticket v){ticket=v;}
 public Long getAuthorId(){return authorId;} public void setAuthorId(Long v){authorId=v;}
 public String getAuthorName(){return authorName;} public void setAuthorName(String v){authorName=v;}
 public String getMessage(){return message;} public void setMessage(String v){message=v;}
 public boolean isAiVerified(){return aiVerified;} public void setAiVerified(boolean v){aiVerified=v;}
 public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}
