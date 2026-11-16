package com.resolveai.ticket.client;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ticket.enums.Priority;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest @ActiveProfiles("test") class CriticalEventPayloadJsonTest {
 @Autowired ObjectMapper mapper;
 @Test void serializesContractFieldsAndIsoDeadline()throws Exception{String json=mapper.writeValueAsString(new CriticalEventPayload(101L,"Payment Gateway Failure",Priority.CRITICAL,"Priya Sharma",LocalDateTime.of(2026,11,17,9,30)));JsonNode node=mapper.readTree(json);Set<String> keys=new HashSet<>();node.fieldNames().forEachRemaining(keys::add);assertThat(keys).containsExactlyInAnyOrder("ticketId","title","priority","assignedAgentName","slaDeadline");assertThat(node.get("slaDeadline").asText()).isEqualTo("2026-11-17T09:30:00");}
}
