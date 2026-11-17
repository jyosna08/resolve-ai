package com.resolveai.ai.service.impl;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ai.client.GeminiClient;
import com.resolveai.ai.dto.AnalyzeRequest;
import com.resolveai.ai.enums.*;
import com.resolveai.ai.service.*;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class) class TriageServiceImplTest {
 @Mock GeminiClient gemini;
 private TriageServiceImpl service(){var mapper=new ObjectMapper();return new TriageServiceImpl(gemini,new TriagePromptBuilder(),new TriageResponseParser(mapper));}
 @Test void criticalPaymentTicketIsClassified() { when(gemini.generate(anyString())).thenReturn(Optional.of("{\"category\":\"BILLING\",\"priority\":\"CRITICAL\",\"sentiment\":\"FRUSTRATED\",\"summary\":\"Checkout blocked\",\"draftReply\":\"We understand how frustrating this is.\"}"));var r=service().analyze(new AnalyzeRequest("Payment failure","Payment checkout is blocked for every attempt"));assertThat(r.priority()).isEqualTo(Priority.CRITICAL);assertThat(r.category()).isEqualTo(Category.BILLING);assertThat(r.draftReply()).isNotBlank();}
 @Test void emptyAndProviderExceptionUseFallback() { when(gemini.generate(anyString())).thenReturn(Optional.empty());var empty=service().analyze(new AnalyzeRequest("Broken checkout","My checkout page is not loading"));assertFallback(empty);when(gemini.generate(anyString())).thenThrow(new RuntimeException("provider down"));assertFallback(service().analyze(new AnalyzeRequest("Broken checkout","My checkout page is not loading")));}
 @Test void unparsableTextUsesFallback() { when(gemini.generate(anyString())).thenReturn(Optional.of("not json"));assertFallback(service().analyze(new AnalyzeRequest("Card payment","The payment screen is broken")));}
 private void assertFallback(com.resolveai.ai.dto.TriageResponse r){assertThat(r.priority()).isEqualTo(Priority.MEDIUM);assertThat(r.category()).isEqualTo(Category.GENERAL);assertThat(r.sentiment()).isEqualTo(Sentiment.NEUTRAL);}
}
