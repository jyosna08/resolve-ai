package com.resolveai.ai.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolveai.ai.config.GeminiProperties;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(OutputCaptureExtension.class)
class GeminiRestClientTest {
    private static final String BASE_URL = "https://generativelanguage.googleapis.com";
    private static final String MODEL = "gemini-3.5-flash-lite";
    private static final String URL = BASE_URL + "/v1beta/models/" + MODEL + ":generateContent";

    @Test
    void postsPromptWithoutThinkingConfigAndReturnsInnerTextWithKeyHeader() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(URL))
                .andExpect(header("x-goog-api-key", "secret-test-key"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json("""
                        {
                          "contents": [{"parts": [{"text": "safe prompt"}]}],
                          "generationConfig": {
                            "responseMimeType": "application/json",
                            "temperature": 0.2,
                            "maxOutputTokens": 2048
                          }
                        }
                        """, true))
                .andRespond(withSuccess("""
                        {"candidates":[{"finishReason":"STOP","content":{"parts":[{"text":"{\\"category\\":\\"GENERAL\\"}"}]}}]}
                        """, MediaType.APPLICATION_JSON));

        GeminiRestClient client = new GeminiRestClient(builder.build(), properties("secret-test-key"), new ObjectMapper());

        assertThat(client.generate("safe prompt")).hasValue("{\"category\":\"GENERAL\"}");
        server.verify();
    }

    @Test
    void skipsThoughtPartsAndReturnsTheFirstNonBlankAnswerPart() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(URL)).andRespond(withSuccess("""
                {"candidates":[{"finishReason":"STOP","content":{"parts":[
                  {"text":"internal reasoning","thought":true},
                  {"text":"  "},
                  {"text":"{\\"category\\":\\"BILLING\\"}"}
                ]}}]}
                """, MediaType.APPLICATION_JSON));

        assertThat(client(builder, "key").generate("prompt")).hasValue("{\"category\":\"BILLING\"}");
        server.verify();
    }

    @Test
    void http400GoogleErrorReturnsEmpty() {
        assertHttpFailure(HttpStatus.BAD_REQUEST,
                "{\"error\":{\"code\":400,\"status\":\"INVALID_ARGUMENT\",\"message\":\"Invalid generation config\"}}",
                MediaType.APPLICATION_JSON);
    }

    @Test
    void diagnosticsIncludeSafeGoogleErrorDetailsAndTruncateMessage(CapturedOutput output) {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        String message = "x".repeat(240);
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\":{\"status\":\"INVALID_ARGUMENT\",\"message\":\"" + message + "\"}}"));

        assertThat(client(builder, "sensitive-api-key").generate("private-ticket-text")).isEmpty();

        assertThat(output.getOut()).contains("HTTP status=400 Google status=INVALID_ARGUMENT");
        assertThat(output.getOut()).contains("message=" + "x".repeat(200));
        assertThat(output.getOut()).doesNotContain("x".repeat(201));
        assertThat(output.getOut()).doesNotContain("sensitive-api-key", "private-ticket-text");
        server.verify();
    }

    @Test
    void http404GoogleErrorReturnsEmpty() {
        assertHttpFailure(HttpStatus.NOT_FOUND,
                "{\"error\":{\"code\":404,\"status\":\"NOT_FOUND\",\"message\":\"Model not found\"}}",
                MediaType.APPLICATION_JSON);
    }

    @Test
    void http429GoogleErrorReturnsEmpty() {
        assertHttpFailure(HttpStatus.TOO_MANY_REQUESTS,
                "{\"error\":{\"code\":429,\"status\":\"RESOURCE_EXHAUSTED\",\"message\":\"Rate limit exceeded\"}}",
                MediaType.APPLICATION_JSON);
    }

    @Test
    void nonJsonHttpErrorReturnsEmptyWithoutThrowing() {
        assertHttpFailure(HttpStatus.BAD_REQUEST, "upstream error", MediaType.TEXT_PLAIN);
    }

    @Test
    void http500FailureReturnsEmpty() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(URL)).andRespond(withServerError());

        assertThat(client(builder, "key").generate("prompt")).isEmpty();
        server.verify();
    }

    @Test
    void malformedEnvelopeAndEmptyCandidatesReturnEmpty() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer malformedServer = MockRestServiceServer.bindTo(builder).build();
        malformedServer.expect(requestTo(URL)).andRespond(withSuccess("not-json", MediaType.APPLICATION_JSON));
        assertThat(client(builder, "key").generate("prompt")).isEmpty();
        malformedServer.verify();

        RestClient.Builder emptyBuilder = RestClient.builder();
        MockRestServiceServer emptyServer = MockRestServiceServer.bindTo(emptyBuilder).build();
        emptyServer.expect(requestTo(URL)).andRespond(withSuccess("{\"candidates\":[]}", MediaType.APPLICATION_JSON));
        assertThat(client(emptyBuilder, "key").generate("prompt")).isEmpty();
        emptyServer.verify();
    }

    @Test
    void blockedAndBlankResponsesReturnEmpty() {
        RestClient.Builder blockedBuilder = RestClient.builder();
        MockRestServiceServer blockedServer = MockRestServiceServer.bindTo(blockedBuilder).build();
        blockedServer.expect(requestTo(URL)).andRespond(withSuccess(
                "{\"candidates\":[{\"finishReason\":\"SAFETY\",\"content\":{\"parts\":[]}}]}",
                MediaType.APPLICATION_JSON));
        assertThat(client(blockedBuilder, "key").generate("prompt")).isEmpty();
        blockedServer.verify();

        RestClient.Builder blankBuilder = RestClient.builder();
        MockRestServiceServer blankServer = MockRestServiceServer.bindTo(blankBuilder).build();
        blankServer.expect(requestTo(URL)).andRespond(withSuccess(
                "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"  \"}]}}]}",
                MediaType.APPLICATION_JSON));
        assertThat(client(blankBuilder, "key").generate("prompt")).isEmpty();
        blankServer.verify();
    }

    @Test
    void blankKeyDoesNotCallServer() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();

        assertThat(client(builder, " ").generate("prompt")).isEmpty();
        server.verify();
    }

    private void assertHttpFailure(HttpStatus status, String body, MediaType contentType) {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(requestTo(URL)).andRespond(withStatus(status).contentType(contentType).body(body));

        assertThat(client(builder, "key").generate("prompt")).isEmpty();
        server.verify();
    }

    private GeminiRestClient client(RestClient.Builder builder, String key) {
        return new GeminiRestClient(builder.build(), properties(key), new ObjectMapper());
    }

    private GeminiProperties properties(String key) {
        return new GeminiProperties(key, BASE_URL, MODEL, 3000, 15000, 2048);
    }
}
