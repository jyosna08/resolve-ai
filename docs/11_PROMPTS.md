# 11. AI-Assisted Development Prompt Log

## How prompts were used

Prompts followed an architect-style plan: read the project contract and coding standards first, work on one module or feature scope per prompt, state assumptions before editing, and verify the result with the requested test loop. A human reviewed runtime behavior and chose when to commit; commits remained manual. TrainingMug ADF was used as the development workflow reference. Prompts recorded the permitted files, tests, and final report so the changes could be reviewed against the intended scope.

## Prompt log

The table records scope and outcome without reproducing full prompt text. It contains 20 entries. Test totals are stated only where supplied as part of that work's recorded outcome.

| # | Scope | Branch | Outcome |
| --- | --- | --- | --- |
| 1 | Foundation services: discovery-server, api-gateway, auth-team-service | `feature/auth-team-service` | 15 tests; JWT authentication and agent workload endpoints |
| 2 | `ai-triage-service` | `feature/ai-triage-service` | Gemini client, response parser, and safe fallback |
| 3 | `ticket-workflow-service` | `feature/ticket-workflow-service` | Ticket CRUD, Kanban workflow, Feign integration, and auto-assignment |
| 4A | `notification-sla-service` | `feature/notification-sla-service` | Alerts, RabbitMQ consumer, and SLA scheduler |
| 4B | Critical event publisher with REST fallback | `feature/critical-event-publisher` | Critical event delivery over RabbitMQ with REST fallback |
| 5A | Frontend foundation and authentication | `feature/frontend-foundation` | Frontend shell, auth flow, and role-based routes |
| 5B | Agent dashboard, Kanban, and AI Co-Pilot drawer | `feature/agent-dashboard` | Agent ticket workspace and reply flow |
| 5C | Customer portal, Submit Issue modal, and notification bell | `feature/customer-portal` | Customer ticket flow and agent notifications |
| 6 | Customer response privacy | `feature/customer-response-privacy` | Customer ticket DTOs redact AI, SLA, and assigned-agent data |
| 7 | Dockerfiles, Compose, and low-memory support | `feature/docker-compose` | Containerized stack and resource-aware startup settings |
| 8 | Gemini model and request fix | `feature/gemini-model-fix` | Resolved model 404 and `thinkingConfig` 400; added useful diagnostics |
| 9 | UTC timestamp handling | `feature/timezone-fix` | Zone-less API date-times are parsed as UTC and displayed locally |
| 10 | GitHub Actions CI/CD | `feature/ci-cd` | Backend/frontend tests, image build, and Compose smoke workflow |
| 11A | Secure registration backend | `feature/secure-registration` | Public registration is customer-only; administrator manages team roles |
| 11B | Team page, customer-only registration UI, and duplicate-submit guard | `feature/secure-registration-ui` | Team user creation UI and safer issue submission |
| 12 | Postman, test report, README, and prompt log | `feature/final-docs` | API collection, verified test counts, setup documentation, and reusable prompt guidance |
| 12B | Postman sandbox reserved-name and script robustness fix | `feature/postman-fix` | Renamed reserved sandbox variables and made response parsing and missing-variable assertions safer |
| 13 | Production deployment files | `feature/production-deploy` | Production Compose configuration, deployment scripts, and AWS/Vercel deployment setup |
| 13B | CI Compose smoke startup race | `feature/ci-smoke-fix` | Wait for healthy services and retry transient gateway routing failures |
| 14 | Deployed documentation, bootstrap OS support, and health check fix | `feature/deployed-docs` | Recorded verified deployment, added operations guidance, expanded Ubuntu support, and documented the IPv4 loopback health check |

## Lessons learned

- Read and honor the project docs before changing code.
- Keep each prompt focused on one module or feature.
- Mock external AI calls in automated tests.
- Never assume a model name is available; verify it against the provider.
- Use direct API calls to confirm a failure before changing implementation.
- Keep credentials and tokens out of git.
- Check real runtime behavior in Docker in addition to unit tests.
- Small, scoped prompts are easier to complete under quota limits.
- AWS Free plan eligibility can restrict which instance types are available.
- Wait for service discovery before sending smoke requests through the gateway.
- Check the operating system assumptions in setup scripts against the actual host image.
- Use `127.0.0.1` in container health checks when Alpine resolves `localhost` to IPv6.

## Reusable prompt template

```text
You are working in the repository at <path> on branch <branch>.

SESSION RULES
1. Read <specific docs, code, and configuration> before editing.
2. Print an ASSUMPTIONS list (maximum <N> bullets), then continue without waiting.
3. Modify only <explicit files or directories>. Do not touch other areas.
4. Do not run git commands. Do not commit changes.
5. Stop after the final report.

GOAL
<Describe the behavior and constraints.>

IMPLEMENTATION
<List required changes, ownership/security rules, and compatibility constraints.>

TESTS AND VERIFICATION LOOP
<Name the exact test/build/validation commands. Run them and fix failures until green.>

FINAL REPORT (SHORT)
- Files changed
- Verification results and counts
- Deviations and why
```
