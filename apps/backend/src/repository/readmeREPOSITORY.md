//this is something that we have encountered first time

# Repository Pattern

## 1. What is the Repository Pattern?

The Repository Pattern is a software architectural pattern that separates **data access logic from business logic**.

It acts as an intermediary between the Service Layer and the actual data storage system.

The Service Layer doesn't need to know how data is stored, retrieved, updated, or deleted. It simply communicates with the Repository through predefined functions.

For example, instead of directly accessing a JavaScript array inside a service using `.find()`, `.push()`, or `.filter()`, we create repository functions such as:

- `findAllIssues()`
- `findIssueById(id)`
- `createIssue(data)`
- `updateIssue(id, data)`
- `deleteIssue(id)`

The Repository handles the actual data operations.

**In simple words:** The Service asks for data, and the Repository figures out how to retrieve or modify it.

---

## 2. Why Do We Need the Repository Pattern?

Consider ForgeBoard.

Currently, in Phase 1, we are storing issues in plain JavaScript arrays. Later, in Phase 5, we plan to migrate to PostgreSQL using Prisma.

### Without Repository Pattern

Suppose we directly write database operations inside our services.

Initially:

```typescript
const issue = issues.find((item) => item.id === id);
```

Later, when we migrate to PostgreSQL:

```typescript
const issue = await prisma.issue.findUnique({
  where: { id },
});
```

Now, we have to modify the service wherever the old array operations were used.

This creates tight coupling between business logic and the storage implementation.

### With Repository Pattern

Instead, we create a separate Repository Layer.

The Service communicates with the Repository, and the Repository handles the storage operations.

Initially, the Repository uses JavaScript arrays.

Later, we replace its internal implementation with Prisma queries.

The Service continues calling the same repository functions.

### Main Benefits

1. **Separation of concerns:** Business logic and data access logic remain separate.
2. **Maintainability:** Changes to storage implementation are isolated.
3. **Flexibility:** We can switch from in-memory storage to PostgreSQL without rewriting the entire backend.
4. **Testability:** We can test business logic using mock repositories without requiring a real database.
5. **Reusability:** Multiple services can use the same repository methods instead of duplicating data-access logic.

---

## 3. When Should We Use the Repository Pattern?

The Repository Pattern is particularly useful when:

- An application has multiple entities and complex data operations.
- We want to separate business logic from database operations.
- We expect the database implementation to change.
- Multiple services need to access the same data.
- We want to make unit testing easier by mocking data-access operations.

For small applications with very simple CRUD operations, introducing a separate repository layer might add unnecessary complexity.

However, for larger applications and projects like ForgeBoard, it provides a useful architectural boundary.

---

## 4. Where Does Repository Fit in Backend Architecture?

Our backend follows a layered architecture.

Each layer has a specific responsibility.

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
| Routes | Defines API endpoints and connects them to controllers. |
| Controller | Handles HTTP requests, extracts input, calls services, and sends responses. |
| Service | Contains business rules, validations, and application logic. |
| Repository | Handles data access operations such as creating, finding, updating, and deleting records. |
| Data Store | Actual storage system, such as an array or PostgreSQL database. |

**Important distinction:**

- Controller understands HTTP.
- Service understands business rules.
- Repository understands data access.
- Database understands data persistence.

---

## 5. How Does Data Flow Through the Repository?

Let's understand this using an example.

Suppose a user wants to retrieve a particular GitHub issue from ForgeBoard.

The client sends:

```http
GET /api/issues/1
```

### Step-by-Step Data Flow

**Step 1: Route**

The router matches the incoming request and forwards it to the appropriate controller.

**Step 2: Controller**

The controller extracts the issue ID from the URL parameters.

It calls the corresponding service function.

**Step 3: Service**

The service handles the application's business logic.

It calls:

```typescript
findIssueById("1");
```

It doesn't care whether the data is stored in an array or a database.

**Step 4: Repository**

The repository receives the ID and performs the actual data-access operation.

In Phase 1:

```typescript
const issue = issues.find((item) => item.id === id);
```

If the issue exists, it returns the issue.

Otherwise, it returns `null`.

**Step 5: Service and Controller**

The result travels back through the layers.

The service handles any required business logic, and the controller sends the appropriate HTTP response.

### Visual Flow

```text
CLIENT
  |
  | GET /api/issues/1
  v
ROUTE
  |
  v
CONTROLLER
  |
  | Calls getIssueById("1")
  v
SERVICE
  |
  | Calls findIssueById("1")
  v
REPOSITORY
  |
  | Searches using .find()
  v
IN-MEMORY ARRAY
  |
  | Returns Issue / null
  v
REPOSITORY
  |
  v
SERVICE
  |
  v
CONTROLLER
  |
  | Sends JSON response
  v
CLIENT
```

Notice that data travels downward when requesting an operation and the result travels upward when returning.

---

## 6. How Does Repository Work Internally?

For ForgeBoard, we are initially implementing an In-Memory Repository.

An in-memory repository uses ordinary JavaScript data structures such as arrays or Maps to temporarily store application data.

Example:

```typescript
const issues: Issue[] = [];
```

This array acts as our temporary data store.

We then expose functions to interact with it.

### A. Find All Issues

```typescript
export const findAllIssues = async (): Promise<Issue[]> => {
  return [...issues];
};
```

Retrieves all stored issues.

### B. Find Issue By ID

```typescript
export const findIssueById = async (
  id: string
): Promise<Issue | null> => {
  const issue = issues.find((item) => item.id === id);

  return issue ?? null;
};
```

Searches for an issue using its ID.

### C. Create Issue

```typescript
export const createIssue = async (
  issue: Issue
): Promise<Issue> => {
  issues.push(issue);

  return issue;
};
```

Adds a new issue to the array.

### D. Update Issue

```typescript
export const updateIssue = async (
  id: string,
  updates: Partial<Issue>
): Promise<Issue | null> => {
  const issue = issues.find((item) => item.id === id);

  if (!issue) {
    return null;
  }

  Object.assign(issue, updates);

  return issue;
};
```

Finds an issue and updates its properties.

`Partial<Issue>` means that the update object can contain any subset of the Issue properties.

### E. Delete Issue

```typescript
export const deleteIssue = async (
  id: string
): Promise<boolean> => {
  const index = issues.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  issues.splice(index, 1);

  return true;
};
```

Finds an issue by ID and removes it from the array.

These are examples of CRUD operations:

- Create
- Read
- Update
- Delete

**Note:** These examples demonstrate the basic repository responsibilities. Production implementations should also consider duplicate IDs, immutable updates, validation boundaries, and concurrency.

---

## 7. Why Are Repository Functions Asynchronous?

You might wonder why we use `async` even though JavaScript array operations are synchronous.

For example:

```typescript
export const findAllIssues = async (): Promise<Issue[]> => {
  return [...issues];
};
```

The reason is that real database operations are asynchronous.

When we eventually use PostgreSQL with Prisma, querying the database involves I/O operations.

For example:

```typescript
export const findAllIssues = async (): Promise<Issue[]> => {
  return prisma.issue.findMany();
};
```

By using asynchronous repository methods from the beginning, our Service Layer can consistently use `async/await`.

This keeps the interface consistent when changing storage implementations.

---

## 8. Repository Pattern in ForgeBoard: Phase 1 vs Phase 5

### Phase 1: In-Memory Repository

```text
SERVICE
   |
   v
REPOSITORY
   |
   v
JavaScript Array / Map
```

- Uses JavaScript arrays or Maps.
- Data exists in backend memory.
- Data is lost when the backend process restarts.
- No external database is required.

### Phase 5: PostgreSQL + Prisma

```text
SERVICE
   |
   v
REPOSITORY
   |
   v
PRISMA CLIENT
   |
   v
POSTGRESQL
```

- Uses Prisma to communicate with PostgreSQL.
- Data is persisted in the database.
- Data survives backend restarts.
- Supports database queries and relationships.

The key idea is that the Service Layer continues communicating with the Repository through the same operations.

Only the storage implementation changes.

---

## 9. Important Concepts to Remember

| Concept | Meaning |
|---|---|
| Repository Pattern | Separates data access from business logic. |
| In-Memory Storage | Stores data temporarily in application memory. |
| CRUD | Create, Read, Update, Delete. |
| Data Access Layer | The part of the application responsible for interacting with storage. |
| Async/Await | Handles asynchronous operations without blocking the normal flow of execution. |
| Tight Coupling | When one part of the application depends heavily on another part's internal implementation. |
| Separation of Concerns | Dividing an application into layers with distinct responsibilities. |

---

## 10. Final Mental Model

Think of the Repository as a librarian.

You ask the librarian for a book using its ID.

You don't need to know whether the librarian retrieves it from a shelf, a storage room, or an automated library system.

You only need to know how to ask for it.

Similarly:

- Service asks the Repository for data.
- Repository handles the storage operations.
- Storage system stores and retrieves the data.

**The Repository Pattern hides the details of data storage from the rest of the application.**

That is its primary purpose in ForgeBoard.