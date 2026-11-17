package com.resolveai.ticket.dto;
public record DashboardStatsResponse(long totalOpen,long criticalAlerts,long resolvedToday,long slaWarnings) { }
