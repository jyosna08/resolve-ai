package com.resolveai.ai.client;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ai.config.GeminiProperties;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
@Component
public class GeminiRestClient implements GeminiClient {
 private static final Logger log=LoggerFactory.getLogger(GeminiRestClient.class);
 private final RestClient restClient; private final GeminiProperties properties; private final ObjectMapper mapper;
 public GeminiRestClient(RestClient geminiRestClient,GeminiProperties properties,ObjectMapper mapper) { this.restClient=geminiRestClient;this.properties=properties;this.mapper=mapper; }
 @Override public Optional<String> generate(String prompt) {
  if(properties.apiKey()==null||properties.apiKey().isBlank()){log.warn("Gemini API key is not configured; using fallback");return Optional.empty();}
  try { return request(prompt); } catch(Exception ex) { log.warn("Gemini request failed; using fallback");return Optional.empty(); }
 }
 private Optional<String> request(String prompt) throws Exception {
  String uri=properties.baseUrl()+"/v1beta/models/"+properties.model()+":generateContent";
  JsonNode envelope=restClient.post().uri(uri).header("x-goog-api-key",properties.apiKey()).contentType(MediaType.APPLICATION_JSON).body(requestBody(prompt)).retrieve().body(JsonNode.class);
  return extract(envelope);
 }
 private Map<String,Object> requestBody(String prompt) {
  return Map.of("contents",List.of(Map.of("parts",List.of(Map.of("text",prompt)))),"generationConfig",Map.of("responseMimeType","application/json","temperature",0.2,"maxOutputTokens",properties.maxOutputTokens(),"thinkingConfig",Map.of("thinkingBudget",0)));
 }
 private Optional<String> extract(JsonNode envelope) {
  JsonNode candidate=envelope==null?null:envelope.path("candidates").path(0);
  if(candidate==null||candidate.isMissingNode()||candidate.isNull()){log.warn("Gemini returned no candidate; using fallback");return Optional.empty();}
  String finish=candidate.path("finishReason").asText("");
  if(!finish.isBlank()&&!"STOP".equalsIgnoreCase(finish)){log.warn("Gemini candidate did not finish normally; using fallback");return Optional.empty();}
  String text=candidate.path("content").path("parts").path(0).path("text").asText("");
  if(text.isBlank()){log.warn("Gemini returned empty content; using fallback");return Optional.empty();}
  return Optional.of(text);
 }
}
