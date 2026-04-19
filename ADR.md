# Architecture Decision Records (ADR) - Frontend

This document outlines the key frontend architectural and technical decisions made during the development of the BidHive Social Marketplace.

## ADR 1: Hybrid Rendering (EJS + Lit Components)

### Context
The application required both SEO-friendly static content (homepage, categories) and highly interactive, real-time features (bidding interface, chat system, seller dashboard). A frontend architecture decision was needed to balance performance, developer experience, and user interactivity.

### Options Considered
1.  **Pure EJS with Vanilla JavaScript:** Simple to implement but leads to imperative, hard-to-maintain "spaghetti code" for complex UI interactions like the real-time chat drawer and bidding system.
2.  **Full SPA Framework :** Excellent for interactivity but requires sending large JavaScript bundles upfront, hurts initial load time, and makes SEO more complex (requiring SSR solutions).
3.  **Hybrid: EJS Shell + Lit Web Components (Chosen):** Use EJS to render the static page shell and initial data, then progressively enhance interactive areas with encapsulated Lit components.

### Decision
We chose the **Hybrid (EJS + Lit)** approach.

### Trade-offs
-   **Pros:**
    -   **Progressive Enhancement:** Core content renders instantly; JavaScript enhances only what's needed.
    -   **Component Encapsulation:** Each Lit component (`<items-grid>`, `<bid-drawer>`, `<chat-drawer>`) has its own styles and logic, preventing CSS conflicts and global namespace pollution.
    -   **SEO-Friendly:** Server-rendered content is immediately crawlable without JavaScript execution.
    -   **Smaller Bundle:** Only load component code when needed via the component loader system.
-   **Cons:**
    -   **Two Rendering Contexts:** Developers must switch between EJS templating logic and Lit component logic.
    -   **Communication Overhead:** Passing data from server (EJS) to client components requires embedding JSON in the page or making API calls.

## ADR 2: WebSocket-Based Real-Time Chat Over HTTP Polling

### Context
A core requirement was a "direct messaging system between buyer and seller for each item." The backend server supported HTTP polling, but this creates poor user experience for real-time negotiation.

### Options Considered
1.  **HTTP Polling (Long/Short Polling):** Client repeatedly requests server for new messages. Simple to implement but creates latency (1-30s delays), wastes bandwidth, and feels sluggish for chat.
2.  **Server-Sent Events (SSE):** Server can push messages to client, but communication is one-way only (client cannot send).
3.  **WebSockets (Chosen):** Establishes a persistent, full-duplex connection for instant bi-directional communication.

### Decision
We implemented **WebSockets** for all real-time features (chat messages, bid notifications, winner announcements).

### Trade-offs
-   **Pros:**
    -   **True Real-Time:** Messages appear instantly (<100ms latency), crucial for live bidding and negotiation.
    -   **Bi-Directional:** Both buyer and seller can send/receive messages and bids simultaneously.
    -   **Efficient:** Single persistent connection vs. thousands of polling requests.
    -   **Native Support:** WebSocket API is built into modern browsers and integrates well with Lit lifecycle.
-   **Cons:**
    -   **Connection Management:** Requires handling reconnections, heartbeats, and error states (implemented with status indicators).
    -   **Stateless HTTP vs Stateful WS:** Debugging is harder as each client has an open connection.
    -   **Scaling Complexity:** Would require sticky sessions or a pub/sub layer if horizontally scaled (out of scope).

## ADR 3: Component-Local State Management (No External Library)

### Context
The application has several complex Lit components with significant internal state: `<seller-dashboard>` (items, form state, uploads), `<items-grid>` (filters, search, view mode), and `<bid-drawer>` (messages, bids, connection status). A state management strategy was needed.

### Options Considered
1.  **Global Store (Redux/Zustand):** Centralizes all state. Powerful but introduces significant boilerplate and learning curve for a mid-sized application.
2.  **Context API (Lit Context):** Lit has a built-in context system for sharing state across deep component trees. Adds abstraction but still requires providers.
3.  **Component-Local `@state` + Props + Events (Chosen):** Each component manages its own reactive state, communicating with parents via properties and events.

### Decision
We chose **component-local state management** using Lit's `@state` decorator, with parent-child communication via properties and custom events.

### Trade-offs
-   **Pros:**
    -   **Encapsulation:** Each component is self-contained and portable. The `<items-grid>` can be dropped anywhere without setting up a global store.
    -   **Simplicity:** No additional libraries or boilerplate. State logic lives next to the component that uses it.
    -   **Testability:** Components can be tested in isolation by setting properties directly.
    -   **Reactive by Default:** Lit automatically re-renders when `@state` properties change.
-   **Cons:**
    -   **Prop Drilling:** Passing data through multiple layers (e.g., user ID to `<bid-drawer>`) requires manual prop passing.
    -   **Global State Duplication:** The user object is stored in `localStorage` and accessed by multiple components, leading to potential sync issues.
    -   **Event Propagation:** Child-to-parent communication requires dispatching events, which can become verbose.

### Mitigations Implemented
-   Used global custom events (`window.dispatchEvent`) for cross-component communication like theme changes.
-   Kept component trees shallow to minimize prop drilling.

## ADR 4: Dynamic Component Loader System

### Context
The hybrid architecture meant that Lit components needed to be loaded on specific pages, sometimes multiple components per page. A manual approach of adding `<script type="module">` tags for each component per page would be repetitive and error-prone.

### Options Considered
1.  **Manual Imports per Page:** Add `<script type="module">` to each EJS page importing needed components. Simple but violates DRY principle; every new component requires updating every page template.
2.  **Global Registration:** Import all components in a single `app.js` file. Causes unnecessary bundle bloat as components are loaded even when not used.
3.  **Dynamic Component Loader (Chosen):** Create a reusable EJS partial that accepts a configuration array of components to load and renders a script to dynamically import them.

### Decision
We implemented a **`component-loader.ejs`** partial that accepts component configuration and dynamically imports Lit elements when the page loads.

### Example Implementation
```ejs
<%- include('component-loader', { 
    components: [
        { fileName: 'ItemsGrid.js', componentName: 'ItemsGrid', customName: 'items-grid' },
        { fileName: 'LoginForm.js', componentName: 'LoginForm', customName: 'login-form' }
    ],
    basePath: '/components/',
    autoLoad: true
}) %>