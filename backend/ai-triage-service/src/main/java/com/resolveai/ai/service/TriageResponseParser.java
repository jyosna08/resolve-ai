package com.resolveai.ai.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ai.dto.TriageResponse;
import com.resolveai.ai.enums.*;
import java.util.Locale;
import java.util.Optional;
import org.springframework.stereotype.Component;
@Component
public class TriageResponseParser {
 public static final String FALLBACK_REPLY="Thank you for contacting us. We have received your request and our team is reviewing it. We will get back to you shortly.";
 private final ObjectMapper mapper;
 public TriageResponseParser(ObjectMapper mapper) { this.mapper=mapper; }
 public Optional<TriageResponse> parse(String raw,String title) {
  try { JsonNode json=mapper.readTree(stripFence(raw)); if(json==null||!json.isObject()) return Optional.empty();
   return Optional.of(new TriageResponse(enumValue(json,"category",Category.class,Category.GENERAL),enumValue(json,"priority",Priority.class,Priority.MEDIUM),enumValue(json,"sentiment",Sentiment.class,Sentiment.NEUTRAL),truncate(text(json,"summary",title),160),truncate(text(json,"draftReply",FALLBACK_REPLY),600)));
  } catch(Exception ex) { return Optional.empty(); }
 }
 private String stripFence(String raw) { String s=raw==null?"":raw.trim(); if(s.startsWith("```")){s=s.replaceFirst("^```(?:json)?\\s*","");s=s.replaceFirst("\\s*```$","");} return s; }
 private <E extends Enum<E>> E enumValue(JsonNode n,String field,Class<E> type,E fallback) { try { String value=n.path(field).asText("").trim().toUpperCase(Locale.ROOT); return Enum.valueOf(type,value); } catch(Exception ex) { return fallback; } }
 private String text(JsonNode n,String field,String fallback) { String value=n.path(field).asText("").trim(); return value.isEmpty()?fallback:value; }
 private String truncate(String value,int max) { return value.length()>max?value.substring(0,max):value; }
}
