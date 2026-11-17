package com.resolveai.notification.controller;
import com.resolveai.notification.dto.*;
import com.resolveai.notification.security.AuthenticatedUser;
import com.resolveai.notification.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/notifications") @Tag(name="Alerts")
public class AlertController {
 private final AlertService alerts;
 public AlertController(AlertService alerts){this.alerts=alerts;}
 @GetMapping("/alerts") @PreAuthorize("hasAnyRole('AGENT','ADMIN')") @Operation(summary="List active alerts")
 public List<AlertResponse> active(){return alerts.listActiveAlerts();}
 @PatchMapping("/alerts/{id}/acknowledge") @PreAuthorize("hasAnyRole('AGENT','ADMIN')") @Operation(summary="Acknowledge an alert")
 public AlertResponse acknowledge(@PathVariable Long id){return alerts.acknowledge(id);}
 @PostMapping("/events/critical") @Operation(summary="Ingest a critical ticket event")
 public ResponseEntity<AlertResponse> critical(@Valid @RequestBody CriticalTicketEventRequest event){var result=alerts.recordCriticalEvent(event);return ResponseEntity.status(result.created()?HttpStatus.CREATED:HttpStatus.OK).body(result.alert());}
}
