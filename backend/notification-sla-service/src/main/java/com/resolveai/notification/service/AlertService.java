package com.resolveai.notification.service;
import com.resolveai.notification.dto.*;
import java.util.List;
public interface AlertService {
 RecordResult recordCriticalEvent(CriticalTicketEventRequest event);
 List<AlertResponse> listActiveAlerts();
 AlertResponse acknowledge(Long id);
 int flagSlaBreaches();
 record RecordResult(AlertResponse alert,boolean created) { }
}
