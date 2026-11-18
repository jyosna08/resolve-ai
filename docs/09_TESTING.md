# 09. Testing & Verification Report

## 1. Strategy and test environment

The backend uses JUnit 5, Spring Boot Test, Mockito, and H2 for database-backed tests. AI-provider calls are mocked in automated tests; RabbitMQ behavior is covered with isolated publisher/disabled-context tests. No external services are required for the automated suites. The frontend uses Vitest and React Testing Library.

CI is configured for Java 17 and Node 20. This report was run locally with JDK 25.0.4 (backend Maven compiler release 17) and Node 24.18.1. The persistent backend test databases use H2; discovery, gateway, and AI tests do not use a database. Test counts below are from `mvn -B test` in each backend module and `npm test` in `frontend/` during this session.

## 2. Automated test report

| Module | Tests run | Failures | Errors | Skipped | Command |
| --- | ---: | ---: | ---: | ---: | --- |
| `discovery-server` | 1 | 0 | 0 | 0 | `mvn -B test` |
| `api-gateway` | 2 | 0 | 0 | 0 | `mvn -B test` |
| `auth-team-service` | 19 | 0 | 0 | 0 | `mvn -B test` |
| `ai-triage-service` | 25 | 0 | 0 | 0 | `mvn -B test` |
| `ticket-workflow-service` | 27 | 0 | 0 | 0 | `mvn -B test` |
| `notification-sla-service` | 13 | 0 | 0 | 0 | `mvn -B test` |
| **Backend total** | **87** | **0** | **0** | **0** | Six module runs |
| `frontend` | 124 | 0 | 0 | 0 | `npm test` |
| **All suites** | **211** | **0** | **0** | **0** | Above commands |

The Maven suites were run module by module from each `backend/<module>/` directory. The frontend suite was run from `frontend/`. Frontend output reported 36 test files passed.

## 3. Core test case matrix

The original TC-01 through TC-08 identifiers are retained. TC-01 reflects the enforced customer-only public registration and administrator team creation; privileged public registration is now expected to fail.

| Test ID | Module / scenario | Automated coverage (class and method) | Postman coverage | Result |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | `auth-team-service`: public registration creates customers only; administrator creates an agent | `AuthControllerIntegrationTest.publicRegistrationCreatesOnlyCustomersAndRejectsPrivilegedRoles`; `AuthControllerIntegrationTest.adminCreatesTeamUsersAndOtherRolesCannot` | `00 Setup`, `01 Auth`, `02 Users` | Automated pass |
| TC-02 | `auth-team-service`: invalid login returns unauthorized without disclosing whether the account exists | `AuthServiceImplTest.loginFailuresShareMessage` | `01 Auth` | Automated pass |
| TC-03 | `ai-triage-service`: urgent payment failure receives Billing/Critical triage and a draft reply | `TriageServiceImplTest.criticalPaymentTicketIsClassified`; `AiControllerIntegrationTest.validJwtReturnsExactlyFiveContractFields` | `03 AI Triage` | Automated pass with mocked Gemini; live Gemini behavior was manually verified |
| TC-04 | `ai-triage-service`: empty, invalid, or failing provider uses fallback | `TriageServiceImplTest.emptyAndProviderExceptionUseFallback`; `TriageServiceImplTest.unparsableTextUsesFallback`; `AiControllerIntegrationTest.geminiUnavailableStillReturns200Fallback` | `03 AI Triage` | Automated pass; REST fallback with RabbitMQ stopped is pending |
| TC-05 | `ticket-workflow-service`: ticket creation keeps stored AI data, assigns the least-loaded agent, and sends critical events | `TicketServiceImplTest.customerCreationKeepsFullTicketForPersistenceWorkloadAndCriticalEvent`; `TicketControllerIntegrationTest.customerCreatesTicketWithPrivateFieldsRedactedAndPublicFieldsPresent` | `04 Tickets`, `05 Notifications` | Automated pass |
| TC-06 | `ticket-workflow-service`: status transitions resolve tickets and decrement workload | `TicketControllerIntegrationTest.agentTransitionsResolveAndDecrementWhileCustomerIsForbidden`; `TicketServiceImplTest.statusUpdateDecrementsAndInvalidResolvedTransitionsFail`; `TicketControllerIntegrationTest.verifyReplyResolvesSavesVerifiedCommentAndEnforcesRole` | `04 Tickets` | Automated pass |
| TC-07 | `notification-sla-service`: critical event creates an idempotent alert and acknowledgement is role protected | `AlertControllerIntegrationTest.eventIngestIsIdempotentAndRequiresAuthentication`; `AlertControllerIntegrationTest.alertsAndAcknowledgeEnforceRoleAndNotFound`; `AlertServiceImplTest.flaggingCreatesOnlyOverdueUnacknowledgedBreachesAndIsIdempotent` | `05 Notifications` | Automated pass |
| TC-08 | `frontend`: verify reply resolves the ticket and refreshes the dashboard | `DashboardPage > opens the drawer, verifies a reply, moves the card to resolved, and refreshes KPIs` | `04 Tickets` checks the matching API path | Automated pass |

The Postman collection adds endpoint-level cases beyond the original matrix. It has not been run against a live Compose stack or with Newman in this session.

## 4. Manually verified on 2026-11-18

Verified against the Docker Compose stack:

- Registration and login with role-based redirect (customer to My tickets, agent/admin to Dashboard).
- Ticket submission by a customer with real Gemini triage (priority CRITICAL, category Billing, sentiment Frustrated, summary and a context-aware draft reply).
- Critical alert shown in the agent notification bell and acknowledged.
- Kanban board, AI Co-Pilot drawer, Start Progress and Verify & Send Reply (card moves to Resolved, customer sees the reply, customer never sees AI fields).
- Auto-assignment of a BILLING ticket to the BILLING agent.
- UTC timestamps shown correctly in the local time zone (created time and SLA countdown).
- RabbitMQ queue `ticket.critical.queue` created and visible.
- Admin Team page opens and creates team accounts.
- CI pipeline green on pull requests and on develop.
- Customer-only public registration (the register page has no role or department, and registering with role AGENT or ADMIN returns 403).
- An ADMIN creating an AGENT with department BILLING from the Team page, who can then log in.
- The duplicate-submit guard (a fast double click on Submit Issue creates only one ticket).

## 5. Pending verification

- REST fallback with RabbitMQ stopped.
- Full Postman collection run (Newman).
- Deployment on AWS/Vercel.
- Load/performance testing.

## 6. Known limitations and risks

- `ddl-auto=update` instead of migrations.
- JWT stored in `localStorage`.
- Critical-event REST endpoint accepts any authenticated user.
- “Resolved Today” uses the UTC day.
- Agents/admins see all tickets (assignment is informational).
- Free Gemini quota and model availability.
- 4 GB Docker memory slows startup.

## 7. Defects found and fixed

| Defect | Resolution |
| --- | --- |
| Gemini model returned 404 and `thinkingConfig` returned 400 | Updated the default model and removed the unsupported request configuration; added error diagnostics. |
| UTC timestamps displayed in the wrong local time | Frontend now interprets zone-less API timestamps as UTC before local display and SLA calculations. |
| Customer ticket responses exposed AI and assignment fields | Ticket response mapper redacts those fields for customers while preserving the response shape. |
| Public registration allowed AGENT/ADMIN role requests | Public registration now creates customers only; privileged registration requests are forbidden. |
| Method security returned 500 instead of 403 | Security exception handling now returns the expected forbidden response. |
| Frontend container health check failed with IPv6 localhost | Health check now uses the container's IPv4 loopback address. |
| Fast double click submitted duplicate tickets | Added a submit guard to prevent a second in-flight submission. |
