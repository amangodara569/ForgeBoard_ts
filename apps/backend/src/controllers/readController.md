GET /api/v1/issues
        |
        v
app.ts
        |
        v
issues.routes.ts
        |
        v
issues.controller.ts
        |
        v
Response


In production backends, a controller has a strict boundary: it is the only layer that knows HTTP exists (req, res, status codes, headers, query strings). It should never contain business rules or database queries. Its job is strictly to unpack HTTP input, call a service, and format the HTTP output.