# Project Context

This document defines the coding standards, architectural decisions, and best practices for this project.  
All contributors (human or AI) must follow these rules strictly.

---

## General Principles

- Write clean, readable, and maintainable code.
- Prefer simplicity over complexity.
- Avoid premature optimization.
- Prioritize security, performance, and reliability.
- Consistency across the codebase is mandatory.

---

## Code Style & Comments

- Do NOT use emojis in code or comments.
- Comment only when necessary:
  - Explain WHY, not WHAT.
  - Avoid obvious comments.
- Use descriptive names for variables, functions, and classes.
- Keep functions small and single-purpose.
- Avoid deeply nested logic.
- Follow consistent formatting and structure.

---

## API Security Best Practices

### Input Handling
- Always validate all incoming data (body, params, query).
- Reject invalid or unexpected input early.
- Sanitize user input to prevent injection attacks.

### Authentication & Authorization
- Every protected route MUST enforce authentication.
- Every request MUST be authorized (never trust client-side checks).
- Use secure authentication methods (JWT, OAuth, sessions).
- Tokens must have expiration and proper validation.

### Sensitive Data Protection
- Never expose:
  - Passwords
  - API keys
  - Tokens
  - Internal system details
- Mask sensitive fields in responses.
- Store secrets in environment variables only.

### Password Security
- Hash passwords using strong algorithms (bcrypt or equivalent).
- Never store plaintext passwords.
- Enforce strong password rules.

### Transport Security
- Use HTTPS only.
- Never allow insecure communication in production.

### Rate Limiting & Abuse Protection
- Apply rate limiting on all public endpoints.
- Prevent brute force attacks.
- Implement account lockout or throttling if needed.

### Common Attack Protection
- Prevent SQL Injection (use parameterized queries/ORMs).
- Prevent XSS (escape output, sanitize input).
- Prevent CSRF where applicable.
- Disable unnecessary HTTP methods.

### API Design Security
- Use proper HTTP status codes.
- Do not leak stack traces or internal errors.
- Version APIs when making breaking changes.

---

## Backend Performance Best Practices

### Database Optimization
- Use indexes on frequently queried fields.
- Avoid full table scans on large datasets.
- Prevent N+1 query problems.
- Use efficient joins and query structures.

### Data Handling
- Implement pagination for large datasets.
- Limit response payload sizes.
- Avoid over-fetching data.

### Caching
- Cache frequently accessed data (Redis or in-memory).
- Use cache invalidation strategies properly.
- Avoid stale or inconsistent cache states.

### Concurrency & Scaling
- Use connection pooling for database connections.
- Avoid blocking operations.
- Use async processing where possible.

### Background Processing
- Offload heavy tasks to queues/workers:
  - Reports
  - Notifications
  - Data processing

### Resource Management
- Optimize CPU and memory usage.
- Avoid memory leaks.
- Reuse resources where possible.

### Monitoring & Logging
- Log performance metrics.
- Monitor slow queries.
- Track system health and uptime.

---

## Frontend Performance Best Practices

### Asset Optimization
- Minimize bundle size (tree shaking, dead code removal).
- Compress assets (gzip/brotli).
- Optimize images (correct size and format).

### Loading Strategy
- Lazy load components and routes.
- Use code splitting.
- Defer non-critical resources.

### Rendering Performance
- Avoid unnecessary re-renders.
- Use memoization where appropriate.
- Optimize component structure.

### Network Efficiency
- Minimize API calls.
- Batch requests where possible.
- Use caching strategies (browser/cache headers).

### User Experience
- Use loading states and skeletons.
- Avoid blocking the main thread.
- Ensure fast initial load time.

---

## Database & Architecture Guidelines

- Use proper normalization (up to 3NF unless justified).
- Use foreign key constraints to enforce relationships.
- Maintain referential integrity.
- Use transactions for:
  - Financial operations
  - Inventory updates
  - Critical multi-step processes
- Avoid storing derived data unless necessary.
- Ensure idempotency where required.

---

## Error Handling & Logging

- Never expose internal errors to users.
- Return user-friendly error messages.
- Log full error details internally.
- Use structured logging (JSON or consistent format).
- Include context in logs (userId, requestId, etc.).

---

## Git & Version Control

- Write clear, meaningful commit messages.
- Keep commits small and focused.
- Use feature branches.
- Never commit:
  - Secrets
  - Environment files
  - Credentials

---

## AI Contribution Rules

- All generated code MUST follow this document.
- Do not introduce unnecessary complexity.
- Do not introduce unnecessary dependencies.
- Ensure code is production-ready.
- If making tradeoffs, explicitly justify them in comments.
- Prefer clarity and maintainability over clever solutions.

---

## Domain Rules (Critical)

- Financial and inventory data MUST always remain consistent.
- Never allow negative stock unless explicitly handled.
- All stock updates MUST be transactional.
- Sales and payments MUST be atomic operations.
- Audit logs should be maintained for critical actions.

---

## Final Rule

If any generated code violates these rules, it MUST be corrected before acceptance.