package com.resolveai.ai.service.impl;
import com.resolveai.ai.client.GeminiClient;
import com.resolveai.ai.dto.*;
import com.resolveai.ai.enums.*;
import com.resolveai.ai.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
@Service
public class TriageServiceImpl implements TriageService {
 private static final Logger log=LoggerFactory.getLogger(TriageServiceImpl.class);
 private final GeminiClient gemini; private final TriagePromptBuilder promptBuilder; private final TriageResponseParser parser;
 public TriageServiceImpl(GeminiClient gemini,TriagePromptBuilder promptBuilder,TriageResponseParser parser) { this.gemini=gemini;this.promptBuilder=promptBuilder;this.parser=parser; }
 @Override public TriageResponse analyze(AnalyzeRequest request) {
  try { var result=gemini.generate(promptBuilder.build(request)).flatMap(text->parser.parse(text,request.title())); if(result.isPresent()){log.info("Triage completed using Gemini");return result.get();} }
  catch(Exception ex) { log.warn("Triage provider failed; using fallback"); }
  log.info("Triage completed using fallback"); return fallback(request.title());
 }
 private TriageResponse fallback(String title) { String summary=title.length()>160?title.substring(0,160):title; return new TriageResponse(Category.GENERAL,Priority.MEDIUM,Sentiment.NEUTRAL,summary,TriageResponseParser.FALLBACK_REPLY); }
}
