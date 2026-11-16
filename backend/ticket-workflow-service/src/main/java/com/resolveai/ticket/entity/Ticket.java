package com.resolveai.ticket.entity;
import com.resolveai.ticket.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="tickets",indexes={@Index(name="idx_tickets_status",columnList="status"),@Index(name="idx_tickets_priority",columnList="priority")})
public class Ticket {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=200) private String title;
 @Column(nullable=false,columnDefinition="TEXT") private String description;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private TicketStatus status=TicketStatus.TO_DO;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Priority priority=Priority.MEDIUM;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=50) private Category category=Category.GENERAL;
 @Enumerated(EnumType.STRING) @Column(length=30) private Sentiment sentiment=Sentiment.NEUTRAL;
 @Column(name="ai_summary",columnDefinition="TEXT") private String aiSummary;
 @Column(name="ai_draft_reply",columnDefinition="TEXT") private String aiDraftReply;
 @Column(name="reporter_id",nullable=false) private Long reporterId;
 @Column(name="assigned_agent_id") private Long assignedAgentId;
 @Column(name="assigned_agent_name",length=100) private String assignedAgentName;
 @Column(name="sla_deadline",nullable=false) private LocalDateTime slaDeadline;
 @Column(name="created_at",updatable=false) private LocalDateTime createdAt;
 @Column(name="updated_at") private LocalDateTime updatedAt;
 @PrePersist void onCreate(){LocalDateTime now=LocalDateTime.now();if(createdAt==null)createdAt=now;if(updatedAt==null)updatedAt=now;}
 @PreUpdate void onUpdate(){updatedAt=LocalDateTime.now();}
 public Long getId(){return id;} public void setId(Long v){id=v;}
 public String getTitle(){return title;} public void setTitle(String v){title=v;}
 public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public TicketStatus getStatus(){return status;} public void setStatus(TicketStatus v){status=v;}
 public Priority getPriority(){return priority;} public void setPriority(Priority v){priority=v;}
 public Category getCategory(){return category;} public void setCategory(Category v){category=v;}
 public Sentiment getSentiment(){return sentiment;} public void setSentiment(Sentiment v){sentiment=v;}
 public String getAiSummary(){return aiSummary;} public void setAiSummary(String v){aiSummary=v;}
 public String getAiDraftReply(){return aiDraftReply;} public void setAiDraftReply(String v){aiDraftReply=v;}
 public Long getReporterId(){return reporterId;} public void setReporterId(Long v){reporterId=v;}
 public Long getAssignedAgentId(){return assignedAgentId;} public void setAssignedAgentId(Long v){assignedAgentId=v;}
 public String getAssignedAgentName(){return assignedAgentName;} public void setAssignedAgentName(String v){assignedAgentName=v;}
 public LocalDateTime getSlaDeadline(){return slaDeadline;} public void setSlaDeadline(LocalDateTime v){slaDeadline=v;}
 public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
 public LocalDateTime getUpdatedAt(){return updatedAt;} public void setUpdatedAt(LocalDateTime v){updatedAt=v;}
}
