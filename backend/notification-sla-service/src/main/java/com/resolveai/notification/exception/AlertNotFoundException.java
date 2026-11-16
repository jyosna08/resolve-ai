package com.resolveai.notification.exception;
public class AlertNotFoundException extends RuntimeException { public AlertNotFoundException(Long id){super("Alert not found: "+id);} }
