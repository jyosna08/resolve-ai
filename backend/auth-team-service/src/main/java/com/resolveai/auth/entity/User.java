package com.resolveai.auth.entity;
import com.resolveai.auth.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="users",indexes=@Index(name="idx_users_role_dept",columnList="role, department, active_ticket_count"))
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="full_name",nullable=false,length=100) private String fullName;
 @Column(nullable=false,unique=true,length=150) private String email;
 @Column(name="password_hash",nullable=false,length=255) private String passwordHash;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Role role;
 @Enumerated(EnumType.STRING) @Column(length=50) private Department department=Department.GENERAL;
 @Column(name="active_ticket_count") private int activeTicketCount;
 @Column(name="created_at",updatable=false) private LocalDateTime createdAt;
 @PrePersist void setCreatedAt() { if(createdAt==null) createdAt=LocalDateTime.now(); }
 public User() { }
 public Long getId(){return id;} public void setId(Long v){id=v;}
 public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
 public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;}
 public Role getRole(){return role;} public void setRole(Role v){role=v;}
 public Department getDepartment(){return department;} public void setDepartment(Department v){department=v;}
 public int getActiveTicketCount(){return activeTicketCount;} public void setActiveTicketCount(int v){activeTicketCount=v;}
 public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}
