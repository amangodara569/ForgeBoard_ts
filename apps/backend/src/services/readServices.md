1. The Problem
Right now, issue.repository.ts only fetches raw data. If you call the repository directly from a controller, you have nowhere clean to put business rules—like filtering issues by status, preventing duplicate bookmarks, or merging local tracking data with live GitHub API responses. Putting that logic inside a controller couples your application's core rules to HTTP (req and res), which makes them impossible to reuse later in background jobs (Phase 7) or test without spinning up Express.

2. The Intuition
In the restaurant model: the Controller is the waiter, the Repository is the storage pantry, and the Service is the chef. The waiter never walks into the pantry to cook, and the pantry never decides how a dish is prepared. The chef takes clean inputs from the waiter, pulls raw ingredients from the pantry, applies the recipe (business logic), and hands back the finished result.

3. How It Works Internally
A service is plain TypeScript—it imports nothing from Express. It does not know what req, res, headers, or HTTP status codes are. It receives typed arguments (like id: string or an optional status), calls one or more repositories or external API clients, enforces business rules, and returns domain data (Issue[], Issue, or null).


# Service Layer

## 1. What is the Service Layer?

The Service Layer is the part of the backend responsible for implementing the application's **business logic and application rules**.

It acts as an intermediary between the Controller Layer and the Repository Layer.

The Controller receives HTTP requests and delegates the actual work to the Service.

The Service decides what needs to happen, applies the necessary business rules, and communicates with the Repository whenever it needs to access or modify data.

In simple words:

- Controller handles the HTTP request.
- Service decides what the application should do.
- Repository handles how data is accessed or stored.

### Example: ForgeBoard

Suppose a user wants to update the status of a saved GitHub issue.

The user sends a request to update the status to `merged`.

The Service might need to:

1. Check whether the issue exists.
2. Check whether the requested status is valid.
3. Apply any business rules regarding status transitions.
4. Ask the Repository to update the issue.
5. Return the updated issue.

These decisions belong in the Service Layer, not in the Controller or Repository.

---

## 2. Why Do We Need the Service Layer?

Imagine we don't have a Service Layer.

The Controller directly communicates with the Repository and handles all the business logic itself.

For example:

```typescript
export const updateIssueController = async (req, res) => {
  const issue = await findIssueById(req.params.id);

  if (!issue) {
    return res.status(404).json({
      message: "Issue not found",
    });
  }

  // Business logic
  if (req.body.status === "merged" && issue.status !== "pr_opened") {
    return res.status(400).json({
      message: "Invalid status transition",
    });
  }

  // Update database
  const updatedIssue = await updateIssue(
    req.params.id,
    req.body
  );

  return res.json(updatedIssue);
};
```

This works, but the Controller is now doing too many things:

- Handling HTTP requests.
- Checking whether an issue exists.
- Applying business rules.
- Accessing the Repository.
- Handling application logic.

As the application grows, Controllers become large and difficult to maintain.

### Solution: Introduce the Service Layer

Move business logic into a separate Service.

Now the Controller only needs to:

1. Receive the request.
2. Extract the required information.
3. Call the Service.
4. Send the response.

The Service handles the actual application logic.

### Main Benefits

1. **Separation of concerns:** HTTP handling and business logic remain separate.
2. **Reusability:** Multiple Controllers or other application components can use the same Service functions.
3. **Maintainability:** Business rules are centralized instead of scattered across Controllers.
4. **Testability:** Business logic can be tested independently of Express and HTTP requests.
5. **Scalability:** New business operations can be added without making Controllers unnecessarily complicated.

---

## 3. When Should We Use the Service Layer?

The Service Layer becomes especially useful when:

- An operation involves multiple steps.
- Business rules need to be applied before modifying data.
- Multiple repositories need to work together.
- The same business logic is needed by multiple API endpoints.
- We want to keep Controllers small and focused.
- We need to test business logic independently.

For very simple applications, a separate Service Layer might feel unnecessary.

However, for applications like ForgeBoard, it provides a clean separation between HTTP handling and application behavior.

---

## 4. Where Does Service Fit in Backend Architecture?

Our backend follows a layered architecture.

```text
                  CLIENT
                    |
                    v
                  ROUTES
                    |
                    v
                CONTROLLER
                    |
                    v
                 SERVICE
                    |
                    v
               REPOSITORY
                    |
                    v
                DATA STORE
```

### Responsibilities of Each Layer

| Layer | Responsibility |
|---|---|
| Routes | Defines API endpoints and connects them to Controllers. |
| Controller | Handles HTTP requests and responses. |
| Service | Implements business logic and application rules. |
| Repository | Handles data access operations. |
| Data Store | Stores application data. |

### Important distinction

**Controller:**

Understands HTTP concepts such as:

- `req.params`
- `req.body`
- `req.query`
- `res.status()`
- `res.json()`

**Service:**

Understands application concepts such as:

- Whether an issue exists.
- Whether a status transition is allowed.
- Whether an operation should be performed.
- What should happen when a particular business condition occurs.

**Repository:**

Understands data access operations such as:

- Finding an issue.
- Creating an issue.
- Updating an issue.
- Deleting an issue.

---

## 5. How Does Data Flow Through the Service Layer?

Let's understand this using a ForgeBoard example.

Suppose a user wants to update the status of an issue.

The client sends:

```http
PATCH /api/issues/1/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Step 1: Route

The route matches the incoming request and forwards it to the appropriate Controller.

### Step 2: Controller

The Controller extracts:

- Issue ID from `req.params`.
- New status from `req.body`.

It then calls the Service:

```typescript
await updateIssueStatus("1", "in_progress");
```

### Step 3: Service

The Service receives the ID and requested status.

It performs the necessary business checks.

For example:

1. Does the issue exist?
2. Is the requested status allowed?
3. Is this status transition valid?

If everything is valid, the Service asks the Repository to update the issue.

```typescript
await updateIssue("1", {
  status: "in_progress",
});
```

### Step 4: Repository

The Repository performs the actual update in the data store.

In Phase 1, this means modifying the JavaScript array.

In Phase 5, it will mean executing a Prisma database operation.

### Step 5: Return the Result

The updated issue travels back through the Service to the Controller.

The Controller sends the HTTP response to the client.

### Visual Data Flow

```text
CLIENT
  |
  | PATCH /api/issues/1/status
  v
ROUTE
  |
  v
CONTROLLER
  |
  | Extract ID and status
  | Call updateIssueStatus()
  v
SERVICE
  |
  | Check issue existence
  | Validate business rules
  | Call updateIssue()
  v
REPOSITORY
  |
  | Perform actual update
  v
DATA STORE
  |
  | Return updated issue
  v
REPOSITORY
  |
  v
SERVICE
  |
  v
CONTROLLER
  |
  | Send HTTP response
  v
CLIENT
```

Notice that the Service doesn't directly manipulate the array or execute database queries.

It delegates those responsibilities to the Repository.

---

## 6. How Does the Service Work Internally?

Let's look at a simplified implementation for ForgeBoard.

File:

`apps/backend/src/services/issue.service.ts`

### Example: Get All Issues

```typescript
import { findAllIssues } from "../repositories/issue.repository.js";

export const getAllIssues = async () => {
  const issues = await findAllIssues();

  return issues;
};
```

Here:

1. The Service imports a Repository function.
2. It calls `findAllIssues()`.
3. It waits for the Promise using `await`.
4. It returns the retrieved issues.

This is a simple example because no additional business rules are required.

### Example: Get Issue By ID

```typescript
import { findIssueById } from "../repositories/issue.repository.js";

export const getIssueById = async (id: string) => {
  const issue = await findIssueById(id);

  if (!issue) {
    throw new Error("Issue not found");
  }

  return issue;
};
```

Here the Service adds application-level behavior.

The Repository only tells us whether an issue exists.

The Service decides that an issue must exist for this operation to succeed.

The Controller or centralized error handler can translate this error into an appropriate HTTP response.

### Example: Update Issue Status

```typescript
import {
  findIssueById,
  updateIssue,
} from "../repositories/issue.repository.js";

import type { IssueStatus } from "../types/issue.types.js";

export const updateIssueStatus = async (
  id: string,
  status: IssueStatus
) => {
  const issue = await findIssueById(id);

  if (!issue) {
    throw new Error("Issue not found");
  }

  const updatedIssue = await updateIssue(id, { status });

  return updatedIssue;
};
```

This example demonstrates the separation of responsibilities.

- Service checks whether the issue exists.
- Service decides whether the operation can proceed.
- Repository performs the actual update.

Note: This is a simplified example. A production implementation should also validate allowed status transitions and handle the possibility that an update fails after the initial lookup.

---

## 7. What Belongs in the Service Layer?

The Service Layer should contain application and business rules.

Examples for ForgeBoard:

| Operation | Service responsibility |
|---|---|
| Create Issue | Check for duplicates if required by product rules. |
| Get Issues | Retrieve issues and apply business-level filtering if needed. |
| Get Issue By ID | Handle the case where the issue doesn't exist. |
| Update Status | Validate allowed status transitions. |
| Delete Issue | Check whether deletion is permitted. |

### What Should NOT Belong in the Service Layer?

Generally, avoid:

- Express-specific objects such as `req` and `res`.
- HTTP response methods such as `res.json()`.
- Direct array manipulation such as `issues.push()`.
- Direct Prisma queries when using a Repository abstraction.

The Service should not need to know about the HTTP request or the underlying storage implementation.

---

## 8. Service Layer vs Repository Layer

These two layers are often confused because both work with application data.

The distinction is simple:

| Service Layer | Repository Layer |
|---|---|
| Contains business logic. | Contains data access logic. |
| Decides what should happen. | Performs data operations. |
| Checks business conditions. | Finds and modifies records. |
| Calls Repository functions. | Communicates with storage. |
| Independent of HTTP and storage implementation. | Abstracts the storage implementation. |

### Example

Suppose a user wants to delete an issue.

**Service:**

```typescript
const issue = await findIssueById(id);

if (!issue) {
  throw new Error("Issue not found");
}

if (issue.status === "merged") {
  throw new Error("Merged issues cannot be deleted");
}

await deleteIssue(id);
```

**Repository:**

```typescript
const deleteIssue = async (id: string) => {
  // Find the issue in the array.
  // Remove it from the array.
  // Return the result.
};
```

The Service decides whether deletion is allowed.

The Repository knows how to delete the record.

---

## 9. Service Layer and Error Handling

The Service Layer can detect application-level errors.

For example:

```typescript
if (!issue) {
  throw new Error("Issue not found");
}
```

However, the Service should not decide how Express sends the error to the client.

That responsibility belongs to the HTTP layer or centralized error-handling middleware.

A common architecture looks like this:

```text
SERVICE
   |
   | Throws application error
   v
CONTROLLER
   |
   | Passes error to Express
   v
ERROR HANDLING MIDDLEWARE
   |
   | Converts error into HTTP response
   v
CLIENT
```

For a larger application, you can introduce custom error classes such as `NotFoundError` and `BadRequestError` to distinguish different error types.

---

## 10. Important Concepts to Remember

| Concept | Meaning |
|---|---|
| Service Layer | Layer responsible for business and application logic. |
| Business Logic | Rules that determine how the application behaves. |
| Separation of Concerns | Dividing responsibilities among different layers. |
| Repository | Layer responsible for accessing and modifying data. |
| Dependency | A component another component relies on to perform its work. |
| Reusability | Using the same business operation from multiple places. |
| Error Handling | Detecting and communicating failures appropriately. |

---

## 11. Final Mental Model

Think of a restaurant.

- Customer = Client.
- Waiter = Controller.
- Manager = Service.
- Kitchen staff handling ingredients and inventory = Repository.
- Storage room = Database.

The waiter receives the customer's request and communicates it to the manager.

The manager decides what needs to happen according to the restaurant's rules.

The kitchen staff handles the actual work and retrieves the required ingredients.

The manager doesn't need to personally manage the inventory system, just as the Service doesn't need to directly manipulate the database.

**The Service Layer is responsible for deciding what the application should do, while the Repository Layer is responsible for handling how data is accessed and modified.**