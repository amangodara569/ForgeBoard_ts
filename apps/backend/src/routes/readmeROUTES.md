What is Router?

Router allows us to group related endpoints together.

routes/
├── health.routes.ts
├── issue.routes.ts
├── repository.routes.ts
└── user.routes.ts


right now healthRoutes is defining the route and the logic , its good at firrst , but when we create or scale to multiple routes , it will be a mess , so we will be storing logic in controllers folder 
