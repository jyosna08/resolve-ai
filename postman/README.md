# ResolveAI Postman collection

Import `ResolveAI.postman_collection.json` and `ResolveAI.local.postman_environment.json` into Postman, select **ResolveAI Local**, then enter the bootstrap administrator email and password used in `docker/.env`. The environment stores no credentials by default; tokens, IDs, and unique test emails are generated or saved by the collection.

Run the collection top to bottom using **Run collection** in Postman or the Newman command below; do not run individual requests. Runtime tokens and IDs are created by earlier requests and used later. Start the Docker Compose stack first. The admin must already exist; set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` before the first auth service startup. The collection exercises setup, auth, users, AI triage, tickets, notifications, and gateway health in that order.

The sample `testPassword` collection variable is used only for generated test accounts. The AI request can take up to 20 seconds; without a Gemini key it uses the documented fallback.

Run with Newman from the repository root:

```bash
npx newman run postman/ResolveAI.postman_collection.json -e postman/ResolveAI.local.postman_environment.json
```
