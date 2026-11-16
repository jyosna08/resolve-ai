package com.resolveai.notification.entity;
import com.resolveai.notification.enums.AlertType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="sla_alerts",uniqueConstraints=@UniqueConstraint(name="uq_alert_ticket_type",columnNames={"ticket_id","alert_type"}))
public class SlaAlert {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="ticket_id",nullable=false) private Long ticketId;
 @Column(name="ticket_title",nullable=false,length=200) private String ticketTitle;
 @Enumerated(EnumType.STRING) @Column(name="alert_type",nullable=false,length=30) private AlertType alertType;
 @Column(nullable=false,columnDefinition="TEXT") private String message;
 @Column(name="sla_deadline") private LocalDateTime slaDeadline;
 @Column(name="is_acknowledged") private boolean acknowledged;
 @Column(name="created_at",updatable=false) private LocalDateTime createdAt;
 @PrePersist void onCreate(){if(createdAt==null)createdAt=LocalDateTime.now();}
 public Long getId(){return id;} public void setId(Long v){id=v;}
 public Long getTicketId(){return ticketId;} public void setTicketId(Long v){ticketId=v;}
 public String getTicketTitle(){return ticketTitle;} public void setTicketTitle(String v){ticketTitle=v;}
 public AlertType getAlertType(){return alertType;} public void setAlertType(AlertType v){alertType=v;}
 public String getMessage(){return message;} public void setMessage(String v){message=v;}
 public LocalDateTime getSlaDeadline(){return slaDeadline;} public void setSlaDeadline(LocalDateTime v){slaDeadline=v;}
 public boolean isAcknowledged(){return acknowledged;} public void setAcknowledged(boolean v){acknowledged=v;}
 public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}
