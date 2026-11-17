package com.resolveai.notification.scheduler;
import com.resolveai.notification.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
@Component
@ConditionalOnProperty(name="app.sla.scheduler-enabled",havingValue="true",matchIfMissing=true)
public class SlaBreachScheduler {
 private static final Logger log=LoggerFactory.getLogger(SlaBreachScheduler.class);
 private final AlertService alerts;
 public SlaBreachScheduler(AlertService alerts){this.alerts=alerts;}
 @Scheduled(fixedDelayString="${app.sla.check-interval-ms:60000}") public void check(){try{int count=alerts.flagSlaBreaches();if(count>0)log.info("Created SLA breach alerts count={}",count);}catch(Exception ex){log.error("SLA breach check failed; scheduler will retry later",ex);}}
}
