# 09. Testing Plan & Verification Report — ResolveAI

## 1. Testing Strategy

- **Unit Testing:** JUnit 5 & Mockito for service-layer logic (JWT generation, workload calculation, AI JSON parsing fallback, Kanban transitions).
- **Integration Testing:** Spring Boot Test verifying repository queries against PostgreSQL and Feign/RabbitMQ serialization.
- **API Testing:** Automated collection in `postman/ResolveAI.postman_collection.json` covering positive (200/201) and negative (400/401/404) scenarios.
- **UI & End-to-End Verification:** Manual browser testing across desktop and mobile viewports.

## 2. Core Test Cases Matrix

| Test ID | Module                     | Scenario                                           | Expected Result                                                | Status  |
| :------ | :------------------------- | :------------------------------------------------- | :------------------------------------------------------------- | :------ |
| TC-01   | `auth-team-service`        | Register new Agent with valid payload              | HTTP 201 + User DTO returned                                   | Pending |
| TC-02   | `auth-team-service`        | Login with invalid password                        | HTTP 401 + Standard Error JSON                                 | Pending |
| TC-03   | `ai-triage-service`        | Analyze urgent payment failure text                | Returns `CRITICAL` priority + `BILLING` category + draft reply | Pending |
| TC-04   | `ai-triage-service`        | Simulate Gemini API timeout/failure                | Graceful fallback returns `MEDIUM` priority without crashing   | Pending |
| TC-05   | `ticket-workflow-service`  | Create ticket & verify auto-assignment             | Ticket assigned to least-loaded agent in matching dept         | Pending |
| TC-06   | `ticket-workflow-service`  | Move ticket `TO_DO` -> `IN_PROGRESS` -> `RESOLVED` | Status updated & agent active workload decremented on resolve  | Pending |
| TC-07   | `notification-sla-service` | Submit `CRITICAL` ticket                           | Alert record created via RabbitMQ / REST fallback              | Pending |
| TC-08   | `frontend`                 | Open Kanban card & click "Verify & Send Reply"     | Drawer posts reply, updates board column to `RESOLVED`         | Pending |

## 3. Deliverables Checklist (Phase 11)

- [ ] JUnit test suites passing across all microservices (`mvn test`)
- [ ] Exported Postman Collection (`postman/ResolveAI.postman_collection.json`)
- [ ] Verified Loading, Error, and Empty states in React UI
