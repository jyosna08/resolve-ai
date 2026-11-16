package com.resolveai.ticket.exception;
public class InvalidStatusTransitionException extends RuntimeException { public InvalidStatusTransitionException(){super("Ticket status transition is not allowed");} }
