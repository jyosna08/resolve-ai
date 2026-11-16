package com.resolveai.auth.service.impl;
import com.resolveai.auth.dto.*;
import com.resolveai.auth.entity.User;
import com.resolveai.auth.enums.*;
import com.resolveai.auth.exception.*;
import com.resolveai.auth.repository.UserRepository;
import com.resolveai.auth.security.JwtService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class) class AuthServiceImplTest {
 @Mock UserRepository repo; BCryptPasswordEncoder encoder=new BCryptPasswordEncoder(); JwtService jwt=new JwtService("resolveai-unit-test-secret-at-least-32-bytes-long",60000);
 AuthServiceImpl auth; UserServiceImpl service;
 @BeforeEach void setup(){auth=new AuthServiceImpl(repo,encoder,jwt);service=new UserServiceImpl(repo);}
 @Test void registerHashesPasswordAndNormalizesEmail(){when(repo.existsByEmail("a@b.com")).thenReturn(false);when(repo.save(any())).thenAnswer(i->{User u=i.getArgument(0);u.setId(1L);return u;}); var out=auth.register(new RegisterRequest("Agent","A@B.COM","Password1",Role.AGENT,null));assertThat(out.email()).isEqualTo("a@b.com");ArgumentCaptor<User> cap=ArgumentCaptor.forClass(User.class);verify(repo).save(cap.capture());assertThat(encoder.matches("Password1",cap.getValue().getPasswordHash())).isTrue();assertThat(out.department()).isEqualTo(Department.GENERAL);}
 @Test void duplicateRegistrationIsRejected(){when(repo.existsByEmail("a@b.com")).thenReturn(true);assertThatThrownBy(()->auth.register(new RegisterRequest("Agent","a@b.com","Password1",Role.AGENT,null))).isInstanceOf(DuplicateEmailException.class);}
 @Test void loginReturnsToken(){User u=agent(4,0);u.setPasswordHash(encoder.encode("Password1"));when(repo.findByEmail("a@b.com")).thenReturn(Optional.of(u));assertThat(auth.login(new LoginRequest("A@B.COM","Password1")).token()).isNotBlank();}
 @Test void loginFailuresShareMessage(){when(repo.findByEmail("a@b.com")).thenReturn(Optional.empty());String missing=catchMessage(()->auth.login(new LoginRequest("a@b.com","Password1")));User u=agent(2,0);u.setPasswordHash(encoder.encode("different"));when(repo.findByEmail("wrong@b.com")).thenReturn(Optional.of(u));String mismatch=catchMessage(()->auth.login(new LoginRequest("wrong@b.com","Password1")));assertThat(missing).isEqualTo(mismatch).isEqualTo("Invalid email or password");}
 @Test void findsLeastLoadedOrThrows(){when(repo.findFirstByRoleAndDepartmentOrderByActiveTicketCountAscIdAsc(Role.AGENT,Department.TECHNICAL)).thenReturn(Optional.of(agent(3,2)));assertThat(service.findLeastLoadedAgent(Department.TECHNICAL).activeTicketCount()).isEqualTo(2);when(repo.findFirstByRoleAndDepartmentOrderByActiveTicketCountAscIdAsc(Role.AGENT,Department.BILLING)).thenReturn(Optional.empty());assertThatThrownBy(()->service.findLeastLoadedAgent(Department.BILLING)).isInstanceOf(ResourceNotFoundException.class);}
 @Test void workloadChangesAndMissingUser(){when(repo.increment(5L)).thenReturn(1);when(repo.decrement(5L)).thenReturn(1);when(repo.findById(5L)).thenReturn(Optional.of(agent(5,1)),Optional.of(agent(5,0)));assertThat(service.incrementWorkload(5L).activeTicketCount()).isEqualTo(1);assertThat(service.decrementWorkload(5L).activeTicketCount()).isZero();when(repo.increment(9L)).thenReturn(0);when(repo.existsById(9L)).thenReturn(false);assertThatThrownBy(()->service.incrementWorkload(9L)).isInstanceOf(ResourceNotFoundException.class);}
 private String catchMessage(Runnable r){try{r.run();throw new AssertionError("Expected failure");}catch(InvalidCredentialsException ex){return ex.getMessage();}}
 private User agent(long id,int count){User u=new User();u.setId(id);u.setFullName("Agent");u.setEmail("a@b.com");u.setRole(Role.AGENT);u.setDepartment(Department.TECHNICAL);u.setActiveTicketCount(count);return u;}
}
