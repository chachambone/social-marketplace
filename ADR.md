# Architecture Decision Records (ADR)

This document captures the key architectural decisions made during the development of the Social Marketplace application.

---

## ADR 001: TypeScript as Primary Language

### Context
The application requires type safety, better IDE support, and maintainable code for a full-stack marketplace with complex data structures (users, items, messages, bids).

### Decision
Adopt TypeScript for both backend (Node.js) and frontend (Lit components) with no JavaScript files in the codebase.

### Options Considered
- **JavaScript**: Faster initial setup but lacks type safety
- **TypeScript with allowJs**: Mixed codebase leads to confusion
- **Pure TypeScript**: Strict typing, better refactoring

### Chosen Solution
100% TypeScript codebase with separate tsconfig files for client and server:
- `tsconfig.client.json` - For Lit web components
- `tsconfig.server.json` - For Express backend
- `tsconfig.json` - Root configuration

### Consequences
**Pros:**
- Type safety across entire application
- Better IDE autocomplete and error detection
- Easier refactoring and maintenance
- Self-documenting code

**Cons:**
- Longer initial setup
- Compilation step required
- Learning curve for team members

---

## ADR 002: CSS-in-JS for Component Styling

### Context
Need component-scoped styling that works inside Shadow DOM without global CSS leakage.

### Decision
CSS-in-JS approach using `unsafeCSS` from Lit to inject styles directly into components.

### Options Considered
- **Traditional CSS**: Global scope,容易冲突
- **Tailwind CDN**: Easy but large bundle, no Shadow DOM support
- **Tailwind + PostCSS**: Requires build step, extra complexity
- **CSS-in-JS**: Scoped styles, no build step for CSS

### Chosen Solution
CSS-in-JS with `unsafeCSS` in Lit components, allowing Tailwind classes to work inside Shadow DOM.

### Consequences
**Pros:**
- Component-scoped styles (no leakage)
- No separate CSS build step
- Dynamic styling based on component state
- Works perfectly with Shadow DOM

**Cons:**
- `unsafeCSS` needed (bypasses security)
- CSS strings inside JS files
- No CSS hot reload during development

---

## ADR 003: WebSocket for Real-time Chat & Bidding

### Context
Need real-time bidirectional communication for chat messages and instant bid notifications between buyers and sellers.

### Decision
WebSocket protocol with automatic reconnection for the bidding/chat drawer.

### Options Considered
- **HTTP Polling**: Simple but inefficient, high latency
- **Server-Sent Events (SSE)**: One-way only, no bidirectional
- **Socket.IO**: Feature-rich but larger overhead
- **Native WebSocket**: Lightweight, native browser support

### Chosen Solution
Native WebSocket with custom room-based messaging (messages grouped by itemId).

### Consequences
**Pros:**
- Low latency real-time communication
- Bidirectional messaging
- Automatic reconnection handling
- Room-based message isolation

**Cons:**
- Requires WebSocket-aware hosting (Render supports this)
- Connection management complexity
- No fallback for old browsers

---

## ADR 004: Session-based Authentication with express-session

### Context
Need secure authentication with role-based access (buyer/seller/admin).

### Decision
Session-based authentication using `express-session` middleware with in-memory session store.

### Options Considered
- **Session-based (express-session)**: Stateful, harder to scale but simpler for MVP
- **JWT with localStorage**: Stateless, easier to scale
- **OAuth2**: Overkill for this use case

### Chosen Solution
`express-session` with in-memory session store, bcrypt for password hashing (10 rounds).

### Consequences
**Pros:**
- Built-in session management
- Automatic session expiry
- HttpOnly cookies (more secure than localStorage)
- No token management on client side

**Cons:**
- Stateful - harder to scale horizontally
- Sessions stored in memory (lost on restart)
- Requires sticky sessions for multiple servers
- Not ideal for serverless deployments

**Future Improvement:** Move to Redis-based session store for horizontal scaling.

---

## ADR 005: JSON Files for Data Persistence

### Context
Need simple data storage without database setup complexity, while keeping data readable and editable during development.

### Decision
JSON files stored in `src/data/` directory for users and items data.

### Options Considered
- **PostgreSQL**: Production-ready but complex setup
- **MongoDB**: Good but adds dependency
- **In-memory arrays**: Data resets on restart
- **JSON files**: Simple, version-controllable, human-readable

### Chosen Solution
JSON files for data persistence with TypeScript interfaces for type safety. Server reads/writes to JSON files for CRUD operations.

### Consequences
**Pros:**
- Zero database setup
- Data persists across server restarts
- Human-readable and editable
- Easy to version control with Git
- Browser can directly fetch JSON files

**Cons:**
- Not suitable for high concurrency
- File I/O can be slower than database
- No query capabilities
- Not scalable for production

**Future Improvement:** Migrate to PostgreSQL or MongoDB for production.

---

## Version History

| Date | ADR | Change |
|------|-----|--------|
| 2026-04-20 | 001-005 | Initial documentation |
| 2026-04-20 | 003 | Added WebSocket reconnection logic |
| 2026-04-20 | 004 | Changed to express-session authentication |

---