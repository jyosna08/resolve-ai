# 08. Coding Standards — ResolveAI

## 1. Mandatory Engineering Practices

- **SOLID Principles:** Single Responsibility per service/class; interface-driven service layers.
- **Strict Layered Architecture:** `Controller` -> `Service` -> `Repository` -> `Entity`.
- **DTO Pattern:** Never expose JPA `@Entity` classes directly in REST controllers; always map to Request/Response DTOs.
- **Constructor Injection:** Always use constructor injection (or Lombok `@RequiredArgsConstructor`); avoid field-level `@Autowired`.
- **Bean Validation:** Validate all incoming DTOs using Jakarta Validation (`@Valid`, `@NotBlank`, `@Size`, `@Email`).
- **Global Exception Handling:** Every microservice must include a `@RestControllerAdvice` class returning standardized error payloads (`timestamp`, `status`, `error`, `message`, `path`).
- **API Documentation:** Configure `springdoc-openapi-starter-webmvc-ui` so Swagger UI is accessible at `/swagger-ui.html`.
- **Unit Testing:** Write JUnit 5 + Mockito tests covering core business logic in `*ServiceImpl` classes.
- **Meaningful Logging:** Use SLF4J (`@Slf4j`) with structured `INFO`, `WARN`, and `ERROR` logs—never `System.out.println()`.

## 2. Anti-Patterns to Avoid

- No business logic or database queries inside `@RestController` classes.
- No hardcoded secrets, API keys, or passwords (always read from environment variables / `application.yml` placeholders).
- No magic numbers or raw string literals for statuses/roles (use Java `enum` types).
- No duplicate code across services; keep methods concise (< 30 lines).
