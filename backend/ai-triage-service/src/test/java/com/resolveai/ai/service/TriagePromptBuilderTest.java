package com.resolveai.ai.service;
import com.resolveai.ai.dto.AnalyzeRequest;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
class TriagePromptBuilderTest {
 @Test void promptHasSafetyDelimitersRulesAndTicketData() { String p=new TriagePromptBuilder().build(new AnalyzeRequest("Payment fails","Checkout fails after entering card details"));assertThat(p).contains("<ticket_title>","</ticket_title>","<ticket_description>","</ticket_description>","TECHNICAL, BILLING, FRONTEND, DEVOPS, GENERAL","CRITICAL, HIGH, MEDIUM, LOW","FRUSTRATED, NEUTRAL, POSITIVE","Payment fails","Checkout fails after entering card details","untrusted user DATA","ONLY a JSON object"); }
}
