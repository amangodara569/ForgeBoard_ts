# ForgeBoard_ts

complete data flow 
1. Client Sends GET /api/issues/1
    |
2. RouteMatches the request and invokes the controller.
    |
3. Controller Extracts the ID and calls the service.
    |
4. Service Handles business logic and calls findIssueById("1").
    |
5. Repository Searches the array using .find() and returns the issue.
    |
6. Response The controller sends the issue back to the client as JSON.