# ForgeBoard Backend Flow

This standalone preview shows how a request moves through the backend. Open it in GitHub or a Markdown preview with Mermaid support to render the diagram.

```mermaid
flowchart TD
    server["server.ts<br/>Reads and validates PORT<br/>Starts app.listen()"] -->|"imports app"| app["app.ts<br/>Creates Express app"]

    client["Client"] --> logger["requestLogger"]
    app -. "registers first" .-> logger
    logger --> json["express.json()"]
    json --> match{"Which mounted route matches?"}

    match -->|"GET /api/v1/health"| healthRouter["health.routes.ts"]
    healthRouter --> healthController["health.controllers.ts<br/>healthCheck"]
    healthController --> healthResponse["HTTP 200 health response"]
    healthResponse --> client

    match -->|"GET /api/v1/issues"| issueRouter["issue.routes.ts"]
    issueRouter -->|"GET /"| issueController["issue.controller.ts"]
    issueRouter -->|"GET /:id"| issueController
    issueController -->|"List: getAllIssues(status)"| issueService["issue.service.ts"]
    issueController -->|"Details: getIssueById(id)"| issueService
    issueService -->|"findAllIssues() or findIssueById(id)"| issueRepository["issue.repository.ts"]
    issueRepository --> issueStore["In-memory issues array"]
    issueStore -. "returns issue data" .-> issueRepository
    issueRepository -. "returns issues or issue/null" .-> issueService
    issueService -. "returns data" .-> issueController
    issueController --> issueResponse["HTTP 200, 400, or 404 JSON response"]
    issueResponse --> client

    match -->|"No route matches"| notFound["notFoundMiddleware"]
    notFound --> notFoundResponse["HTTP 404 response"]
    notFoundResponse --> client

    app -. "mounts /api/v1/health" .-> healthRouter
    app -. "mounts /api/v1/issues" .-> issueRouter
    app -. "registers after routes" .-> notFound
    app -. "registers error handler" .-> errorHandler["ErrorHandler"]
    json -. "parsing error" .-> errorHandler
    healthController -. "forwarded error" .-> errorHandler
    issueController -. "forwarded error" .-> errorHandler
    errorHandler --> errorResponse["JSON error response"]
    errorResponse --> client

    issueTypes["issues.types.ts<br/>Issue and IssueStatus types"] -. "compile-time types" .-> issueController
    issueTypes -. "compile-time types" .-> issueService
    issueTypes -. "compile-time types" .-> issueRepository
```

The health check responds directly from its controller. Issue requests go through the controller, service, and repository to the in-memory array. The array is temporary: its data is lost when the backend process restarts. The user router is not mounted yet.
