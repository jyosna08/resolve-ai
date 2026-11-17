package com.resolveai.ai.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ai.enums.*;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
class TriageResponseParserTest {
 private final TriageResponseParser parser=new TriageResponseParser(new ObjectMapper());
 @Test void parsesValidJson() { var r=parser.parse("{\"category\":\"BILLING\",\"priority\":\"HIGH\",\"sentiment\":\"FRUSTRATED\",\"summary\":\"Payment failed\",\"draftReply\":\"We can help\"}","Title").orElseThrow();assertThat(r.category()).isEqualTo(Category.BILLING);assertThat(r.priority()).isEqualTo(Priority.HIGH); }
 @Test void parsesJsonFence() { assertThat(parser.parse("```json\n{\"category\":\"GENERAL\"}\n```","Title")).isPresent(); }
 @Test void defaultsUnknownValuesIndividually() { var r=parser.parse("{\"category\":\"NOPE\",\"priority\":\"urgent\",\"sentiment\":\"x\"}","Title").orElseThrow();assertThat(r.category()).isEqualTo(Category.GENERAL);assertThat(r.priority()).isEqualTo(Priority.MEDIUM);assertThat(r.sentiment()).isEqualTo(Sentiment.NEUTRAL);assertThat(r.summary()).isEqualTo("Title"); }
 @Test void acceptsLowercaseAndTruncatesSummary() { var r=parser.parse("{\"category\":\"billing\",\"priority\":\"critical\",\"sentiment\":\"positive\",\"summary\":\""+"s".repeat(200)+"\"}","Title").orElseThrow();assertThat(r.category()).isEqualTo(Category.BILLING);assertThat(r.summary()).hasSize(160); }
 @Test void garbageTextIsEmpty() { assertThat(parser.parse("not json","Title")).isEmpty(); }
}
