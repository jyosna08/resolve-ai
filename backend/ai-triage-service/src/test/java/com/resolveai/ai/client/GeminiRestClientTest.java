package com.resolveai.ai.client;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ai.config.GeminiProperties;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
class GeminiRestClientTest {
 private static final String URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
 @Test void postsPromptAndReturnsInnerTextWithKeyHeader() {
  RestClient.Builder b=RestClient.builder();MockRestServiceServer server=MockRestServiceServer.bindTo(b).build();server.expect(requestTo(URL)).andExpect(header("x-goog-api-key","secret-test-key")).andExpect(content().contentType(MediaType.APPLICATION_JSON)).andRespond(withSuccess("{\"candidates\":[{\"finishReason\":\"STOP\",\"content\":{\"parts\":[{\"text\":\"{\\\"category\\\":\\\"GENERAL\\\"}\"}]}}]}",MediaType.APPLICATION_JSON));
  var client=new GeminiRestClient(b.build(),props("secret-test-key"),new ObjectMapper());assertThat(client.generate("safe prompt")).hasValue("{\"category\":\"GENERAL\"}");server.verify();
 }
 @Test void httpFailureReturnsEmpty() { RestClient.Builder b=RestClient.builder();MockRestServiceServer s=MockRestServiceServer.bindTo(b).build();s.expect(requestTo(URL)).andRespond(withServerError());assertThat(client(b,"key").generate("prompt")).isEmpty();s.verify(); }
 @Test void malformedEnvelopeAndEmptyCandidatesReturnEmpty() {
  RestClient.Builder b=RestClient.builder();MockRestServiceServer s=MockRestServiceServer.bindTo(b).build();s.expect(requestTo(URL)).andRespond(withSuccess("bad",MediaType.APPLICATION_JSON));assertThat(client(b,"key").generate("p")).isEmpty();s.verify();
  RestClient.Builder b2=RestClient.builder();MockRestServiceServer s2=MockRestServiceServer.bindTo(b2).build();s2.expect(requestTo(URL)).andRespond(withSuccess("{\"candidates\":[]}",MediaType.APPLICATION_JSON));assertThat(client(b2,"key").generate("p")).isEmpty();s2.verify();
 }
 @Test void blankKeyDoesNotCallServer() { RestClient.Builder b=RestClient.builder();MockRestServiceServer s=MockRestServiceServer.bindTo(b).build();assertThat(client(b," ").generate("p")).isEmpty();s.verify(); }
 private GeminiRestClient client(RestClient.Builder b,String key){return new GeminiRestClient(b.build(),props(key),new ObjectMapper());}
 private GeminiProperties props(String key){return new GeminiProperties(key,"https://generativelanguage.googleapis.com","gemini-2.5-flash",3000,15000,1024);}
}
