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

## ADR 002: Lit over React/Vue for UI Components

### Context
Need lightweight, reusable web components that work with Shadow DOM for encapsulation, without framework lock-in.

### Decision
Use Lit for all interactive UI components (LoginForm, ItemsGrid, SellerDashboard, BidDrawer).

### Options Considered
- **React**: Large bundle size, requires JSX, no Shadow DOM
- **Vue**: Good but adds abstraction layer
- **Lit**: Native web components, tiny bundle (~5KB), Shadow DOM isolation

### Chosen Solution
Lit 3.x with TypeScript decorators for reactive properties and Shadow DOM styling.

### Consequences
**Pros:**
- Extremely small bundle size
- Native browser support
- True encapsulation with Shadow DOM
- No framework lock-in
- Excellent performance

**Cons:**
- Smaller ecosystem than React
- Shadow DOM makes global styling harder (solved with unsafeCSS)

---

## ADR 003: Tailwind CSS with PostCSS

### Context
Need utility-first styling that works inside Shadow DOM while maintaining design consistency.

### Decision
Tailwind CSS v3 with PostCSS compilation pipeline.

### Options Considered
- **Traditional CSS**: Scoped to components but repetitive
- **CSS-in-JS**: Runtime overhead, complex setup
- **Tailwind CDN**: Easy but large bundle, no customization
- **Tailwind + PostCSS**: Optimized, tree-shaken, customizable

### Chosen Solution
Tailwind CSS compiled to CSS file, imported via `unsafeCSS()` in Lit components.

### Consequences
**Pros:**
- Consistent design system
- Small production CSS (only used classes)
- No runtime CSS-in-JS overhead
- Excellent developer experience

**Cons:**
- Requires build step
- `unsafeCSS` needed for Shadow DOM
- Learning utility classes initially

---

## ADR 004: WebSocket for Real-time Chat & Bidding

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

## ADR 005: JWT + bcrypt for Authentication

### Context
Need secure, stateless authentication with role-based access (buyer/seller/admin).

### Decision
JWT (JSON Web Tokens) for sessions with bcrypt for password hashing.

### Options Considered
- **Session-based (express-session)**: Stateful, harder to scale
- **OAuth2**: Overkill for this use case
- **JWT with localStorage**: Stateless, easy to implement

### Chosen Solution
JWT tokens stored in localStorage, bcrypt for password hashing (10 rounds), 7-day token expiry.

### Consequences
**Pros:**
- Stateless authentication
- Easy to scale horizontally
- Built-in token expiry
- Role information embedded in token

**Cons:**
- Token storage in localStorage (XSS vulnerability - mitigated by CSP)
- Tokens cannot be invalidated easily without blacklist

---

## ADR 006: In-Memory Data Storage (MVP)

### Context
Need fast development iteration without database setup complexity for the assessment deadline.

### Decision
In-memory JavaScript arrays for users and items, with optional JSON file persistence.

### Options Considered
- **PostgreSQL**: Production-ready but complex setup
- **MongoDB**: Good but adds dependency
- **JSON files**: Simple but concurrent write issues
- **In-memory arrays**: Fastest for development

### Chosen Solution
In-memory arrays imported directly in controllers, no file I/O for reads.

### Consequences
**Pros:**
- Zero database setup
- Fast development iteration
- Easy to reset state

**Cons:**
- Data resets on server restart
- Not suitable for production
- No concurrent request safety

**Future Improvement:** Migrate to PostgreSQL or MongoDB for production.

---

## ADR 007: Component-Based Architecture with Drawer Pattern

### Context
Need smooth UX for bidding workflow without page navigation.

### Decision
Right-side sliding drawer (3/4 width) with split view: 1/3 product details, 2/3 chat.

### Options Considered
- **Modal**: Blocks entire view, poor UX
- **New Page**: Disrupts user flow
- **Side Drawer**: Non-intrusive, maintains context

### Chosen Solution
Custom `bid-drawer` Lit component with CSS transitions and WebSocket integration.

### Consequences
**Pros:**
- Smooth user experience
- Preserves marketplace context
- Responsive on mobile/desktop

**Cons:**
- Complex state management
- WebSocket connection per drawer

---

## Version History

| Date | ADR | Change |
|------|-----|--------|
| 2026-04-20 | 001-007 | Initial documentation |
| 2026-04-20 | 004 | Added WebSocket reconnection logic |
| 2026-04-20 | 005 | Enhanced JWT security notes |

---
