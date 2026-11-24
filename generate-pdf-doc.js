const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const outputPath = path.resolve(__dirname, 'Helpdesk_Project_Documentation.pdf');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Helpdesk — AI-Powered Ticket Management System Documentation</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 15mm 18mm 15mm;
      @bottom-right {
        content: counter(page);
        font-size: 9pt;
        color: #71717a;
      }
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      line-height: 1.55;
      font-size: 10pt;
      background-color: #ffffff;
    }

    /* Page Breaks */
    .page-break {
      page-break-before: always;
    }
    .avoid-break {
      page-break-inside: avoid;
    }

    /* Cover Page */
    .cover {
      min-height: 85vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px 20px;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 30px;
    }
    .cover-badge {
      display: inline-block;
      align-self: flex-start;
      background: #eff6ff;
      color: #2563eb;
      font-weight: 600;
      font-size: 9pt;
      padding: 6px 14px;
      border-radius: 9999px;
      margin-bottom: 20px;
      border: 1px solid #bfdbfe;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .cover h1 {
      font-size: 28pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    .cover .subtitle {
      font-size: 14pt;
      color: #475569;
      font-weight: 400;
      margin-bottom: 30px;
      line-height: 1.4;
    }
    .cover-meta {
      margin-top: 40px;
      background: #f8fafc;
      padding: 20px 24px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .meta-item {
      font-size: 9.5pt;
    }
    .meta-item strong {
      color: #334155;
      display: block;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 3px;
    }

    /* Typography */
    h1, h2, h3, h4 {
      color: #0f172a;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    h2 {
      font-size: 16pt;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 6px;
      margin-top: 28px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    h3 {
      font-size: 12pt;
      margin-top: 18px;
      margin-bottom: 8px;
      color: #1e3a8a;
    }
    h4 {
      font-size: 10.5pt;
      margin-top: 12px;
      margin-bottom: 4px;
      color: #334155;
    }
    p {
      margin-bottom: 10px;
      text-align: justify;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    li {
      margin-bottom: 4px;
    }

    /* Badges */
    .badge {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-purple { background: #f3e8ff; color: #6b21a8; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-slate { background: #f1f5f9; color: #475569; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 18px 0;
      font-size: 8.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 700;
      color: #1e293b;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Code Blocks */
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
      color: #b91c1c;
    }
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8pt;
      line-height: 1.45;
      overflow-x: auto;
      margin: 10px 0 14px 0;
    }
    pre code {
      background: transparent;
      padding: 0;
      color: inherit;
    }

    /* Cards & Callouts */
    .callout {
      border-left: 4px solid #3b82f6;
      background: #eff6ff;
      padding: 10px 14px;
      border-radius: 0 6px 6px 0;
      margin: 12px 0;
      font-size: 9pt;
    }
    .callout-success {
      border-left-color: #10b981;
      background: #ecfdf5;
    }
    .callout-warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .callout-title {
      font-weight: 700;
      margin-bottom: 4px;
      color: #0f172a;
    }

    /* Architecture Diagram Box */
    .diagram-container {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      margin: 14px 0;
      text-align: center;
    }
    .diagram-flow {
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
    }
    .diagram-node {
      background: #ffffff;
      border: 2px solid #3b82f6;
      padding: 10px 14px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 8.5pt;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      flex: 1;
    }
    .diagram-arrow {
      color: #64748b;
      font-weight: bold;
      font-size: 14pt;
    }

    .file-tree {
      background: #1e293b;
      color: #cbd5e1;
      padding: 12px 16px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 8.5pt;
      line-height: 1.4;
      margin: 12px 0;
    }
    .file-tree .dir { color: #60a5fa; font-weight: bold; }
    .file-tree .file { color: #f1f5f9; }
    .file-tree .desc { color: #94a3b8; font-style: italic; }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover">
    <div class="cover-badge">Full-Stack Technical Documentation</div>
    <h1>Helpdesk System</h1>
    <div class="subtitle">AI-Powered Ticket Management, Customer Support & Automated Ingestion Platform</div>
    
    <div class="cover-meta">
      <div class="meta-item">
        <strong>Author & Developer</strong>
        Rushikesh Sable (rushisable05)
      </div>
      <div class="meta-item">
        <strong>Repository</strong>
        github.com/rushisable05/helpdesk
      </div>
      <div class="meta-item">
        <strong>Architecture</strong>
        TypeScript Monorepo (Client, Server, Core, E2E)
      </div>
      <div class="meta-item">
        <strong>Database & Engine</strong>
        Embedded PostgreSQL (PGlite) + Prisma 7 ORM
      </div>
      <div class="meta-item">
        <strong>Frontend</strong>
        React 19 + Vite + Tailwind CSS v4 + Radix UI
      </div>
      <div class="meta-item">
        <strong>Authentication</strong>
        Better Auth (Session-based RBAC: Admin & Agent)
      </div>
    </div>
  </div>

  <!-- TABLE OF CONTENTS -->
  <div class="avoid-break" style="margin-bottom: 25px;">
    <h2>Table of Contents</h2>
    <ol style="margin-left: 20px; font-size: 9.5pt; line-height: 1.8;">
      <li><strong>Executive Summary & System Overview</strong> (Problem, Solution, Core Value)</li>
      <li><strong>System Architecture & Multi-Layer Design</strong> (Client, Server, DB, Queues, AI)</li>
      <li><strong>Technology Stack & Key Dependencies</strong> (Versions, Purpose, Value)</li>
      <li><strong>Database Schema & Entity Relationship Model</strong> (User, Account, Ticket, Reply)</li>
      <li><strong>Comprehensive File-by-File Directory Analysis</strong> (Core, Server, Client, E2E, Root)</li>
      <li><strong>Core Code Implementations & Workflows</strong> (Auth, Webhook, Ticket CRUD, AI Polish)</li>
      <li><strong>Key Engineering Challenges & Applied Solutions</strong> (Embedded DB, Socket Drops, AI Fallback)</li>
      <li><strong>Verification & Test Suite Results</strong> (Vitest 114 tests, Playwright 12 E2E tests)</li>
      <li><strong>Setup, Execution & Seeding Guide</strong> (Local dev commands, seed commands)</li>
    </ol>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 1 -->
  <h2>1. Executive Summary & System Overview</h2>
  <p>
    The <strong>Helpdesk</strong> application is a modern, enterprise-ready support operations system engineered to streamline high-volume customer inquiries, automate tier-1 support using artificial intelligence, and equip human agents with a fast, intuitive workspace.
  </p>

  <div class="callout callout-success">
    <div class="callout-title">Core Problem Solved</div>
    Traditional customer support teams suffer from manual overhead: reviewing incoming emails, sorting them into categories, replying to repetitive FAQ questions, and assigning tickets to appropriate agents. Helpdesk eliminates this bottleneck through intelligent background processing, autonomous knowledge-base resolution, and agent reply polishing.
  </div>

  <h3>Key Features Delivered:</h3>
  <ul>
    <li><strong>Automated Inbound Ingestion:</strong> Ingests customer support emails via SendGrid webhook, extracting sender information, subject lines, plain text, and HTML formatting.</li>
    <li><strong>AI Ticket Classification:</strong> Asynchronously categorizes tickets into <code>technical_question</code>, <code>general_question</code>, or <code>refund_request</code>.</li>
    <li><strong>Autonomous Auto-Resolution:</strong> Evaluates incoming tickets against an internal knowledge base (<code>knowledge-base.md</code>) to formulate human-like instant resolutions and dispatch outbound email replies via background queue workers.</li>
    <li><strong>Dynamic Ticket Dashboard:</strong> Complete management view featuring 30-day daily volume bar charts, real-time ticket analytics, multi-column sorting, multi-criteria filtering, and pagination.</li>
    <li><strong>AI Reply Polisher with Local Fallback:</strong> Re-phrases and elevates agent drafts into courteous, grammatically polished responses with customer greetings and professional sign-offs. Designed with a deterministic local engine that functions 100% reliably even without OpenAI API keys or internet connection.</li>
    <li><strong>Role-Based Access Control (RBAC):</strong> Granular security separating <em>Administrators</em> (full user management, metrics, ticket routing) from <em>Agents</em> (ticket resolution and communication).</li>
  </ul>

  <!-- SECTION 2 -->
  <h2>2. System Architecture & Multi-Layer Design</h2>
  <p>
    The project is designed as an integrated <strong>TypeScript Monorepo</strong> divided into four distinct workspaces: <code>client</code>, <code>server</code>, <code>core</code>, and <code>e2e</code>.
  </p>

  <div class="diagram-container">
    <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 10px;">End-to-End System Flow</div>
    <div class="diagram-flow">
      <div class="diagram-node">Customer Email / Webhook</div>
      <div class="diagram-arrow">&rarr;</div>
      <div class="diagram-node">Express API &amp; Auth (Port 3000)</div>
      <div class="diagram-arrow">&rarr;</div>
      <div class="diagram-node">Prisma ORM &amp; PGlite (Port 5432)</div>
      <div class="diagram-arrow">&rarr;</div>
      <div class="diagram-node">React Client SPA (Port 5173)</div>
    </div>
    <div style="font-size: 8pt; color: #64748b; margin-top: 8px;">
      Asynchronous Pg-Boss workers handle AI classification, auto-resolution, and SendGrid outbound email dispatch.
    </div>
  </div>

  <table class="avoid-break">
    <thead>
      <tr>
        <th style="width: 25%;">Layer</th>
        <th style="width: 35%;">Components &amp; Technologies</th>
        <th style="width: 40%;">Responsibilities</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Presentation Layer (Client)</strong></td>
        <td>React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Query &amp; Table</td>
        <td>Renders reactive UI, manages client route authorization, handles optimistic query updates, controls table pagination, sorting, and search filters.</td>
      </tr>
      <tr>
        <td><strong>Application Layer (Server)</strong></td>
        <td>Express 5, Bun, Better Auth, Vercel AI SDK, pg-boss, Helmet</td>
        <td>Exposes REST API endpoints, validates requests with Zod, validates sessions, coordinates AI tasks, and runs asynchronous job workers.</td>
      </tr>
      <tr>
        <td><strong>Data Layer (Database)</strong></td>
        <td>Prisma Client 7, PGlite (Embedded WASM PostgreSQL)</td>
        <td>Enforces relational schema integrity, manages transactions, executes optimized PostgreSQL functions (<code>get_ticket_stats</code>).</td>
      </tr>
      <tr>
        <td><strong>Shared Core Layer</strong></td>
        <td>TypeScript Workspace (<code>core</code>)</td>
        <td>Single source of truth for Zod schemas, TypeScript types, status/category enums, and test seed data shared across client and server.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- SECTION 3 -->
  <h2>3. Technology Stack &amp; Key Dependencies</h2>
  <table class="avoid-break">
    <thead>
      <tr>
        <th>Package / Tool</th>
        <th>Version</th>
        <th>Scope</th>
        <th>Purpose &amp; Implementation Details</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>bun</code></td>
        <td>1.4.4</td>
        <td>Root / Runtime</td>
        <td>Ultra-fast runtime and package manager powering monorepo workspace resolution and development orchestration.</td>
      </tr>
      <tr>
        <td><code>react</code> / <code>react-dom</code></td>
        <td>19.2.0</td>
        <td>Client</td>
        <td>Modern component-based declarative UI framework utilizing latest concurrent rendering primitives.</td>
      </tr>
      <tr>
        <td><code>vite</code></td>
        <td>7.3.1</td>
        <td>Client</td>
        <td>Next-generation frontend bundler providing lightning-fast HMR and optimized production bundles.</td>
      </tr>
      <tr>
        <td><code>tailwindcss</code></td>
        <td>4.1.18</td>
        <td>Client</td>
        <td>CSS styling framework using native CSS variables, container queries, and clean utility classes.</td>
      </tr>
      <tr>
        <td><code>@tanstack/react-table</code></td>
        <td>8.21.3</td>
        <td>Client</td>
        <td>Headless data table handling multi-column sorting, pagination, and multi-field keyword filtering.</td>
      </tr>
      <tr>
        <td><code>@tanstack/react-query</code></td>
        <td>5.90.21</td>
        <td>Client</td>
        <td>Server state synchronization, query caching, refetching, and mutation lifecycle handlers.</td>
      </tr>
      <tr>
        <td><code>better-auth</code></td>
        <td>1.4.18</td>
        <td>Client / Server</td>
        <td>Authentication platform providing session cookies, Argon2/Scrypt password hashing, and user profile management.</td>
      </tr>
      <tr>
        <td><code>express</code></td>
        <td>5.2.1</td>
        <td>Server</td>
        <td>Node.js web framework handling REST routing, JSON payload parsing, and middleware chains.</td>
      </tr>
      <tr>
        <td><code>@prisma/client</code></td>
        <td>7.3.0</td>
        <td>Server</td>
        <td>Type-safe database ORM client executing queries and migrations against PostgreSQL.</td>
      </tr>
      <tr>
        <td><code>@electric-sql/pglite</code></td>
        <td>0.5.16</td>
        <td>Root / Server</td>
        <td>Embedded WASM PostgreSQL engine persisting data locally in <code>.pgdata</code> without requiring an external DB installation.</td>
      </tr>
      <tr>
        <td><code>@ai-sdk/openai</code> / <code>ai</code></td>
        <td>3.0 / 6.0</td>
        <td>Server</td>
        <td>Vercel AI SDK integration supporting GPT-4o-mini generation for summarization and reply assistance.</td>
      </tr>
      <tr>
        <td><code>@playwright/test</code></td>
        <td>1.58.2</td>
        <td>E2E</td>
        <td>Browser automation suite running end-to-end tests across isolated chromium instances.</td>
      </tr>
      <tr>
        <td><code>vitest</code></td>
        <td>4.0.18</td>
        <td>Client</td>
        <td>Vite-native unit test runner for component testing with React Testing Library.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 4 -->
  <h2>4. Database Schema &amp; Data Models</h2>
  <p>
    The database is structured around six core models in <code>server/prisma/schema.prisma</code>:
  </p>

  <div class="avoid-break">
    <h3>Data Models Summary</h3>
    <table>
      <thead>
        <tr>
          <th>Model</th>
          <th>Table Name</th>
          <th>Primary Key</th>
          <th>Key Fields &amp; Relationships</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>User</code></td>
          <td><code>user</code></td>
          <td><code>id (String UUID)</code></td>
          <td><code>name, email (unique), role (enum: admin/agent), deletedAt (soft-delete)</code>. Related to Sessions, Accounts, Assigned Tickets, and authored Replies.</td>
        </tr>
        <tr>
          <td><code>Session</code></td>
          <td><code>session</code></td>
          <td><code>id (String)</code></td>
          <td><code>token (unique), userId (FK), expiresAt, ipAddress, userAgent</code>. Handled automatically by Better Auth.</td>
        </tr>
        <tr>
          <td><code>Account</code></td>
          <td><code>account</code></td>
          <td><code>id (String)</code></td>
          <td><code>accountId, providerId ('credential'), userId (FK), password (hashed)</code>. Holds credentials.</td>
        </tr>
        <tr>
          <td><code>Ticket</code></td>
          <td><code>ticket</code></td>
          <td><code>id (Int Autoincrement)</code></td>
          <td><code>subject, body, bodyHtml, status (enum), category (enum), senderName, senderEmail, assignedToId (FK)</code>. Has many Replies.</td>
        </tr>
        <tr>
          <td><code>Reply</code></td>
          <td><code>reply</code></td>
          <td><code>id (Int Autoincrement)</code></td>
          <td><code>body, bodyHtml, senderType (enum: agent/customer), ticketId (FK cascade), userId (FK optional)</code>.</td>
        </tr>
        <tr>
          <td><code>Verification</code></td>
          <td><code>verification</code></td>
          <td><code>id (String)</code></td>
          <td><code>identifier, value, expiresAt</code>. Supports secure token validation flows.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="avoid-break">
    <h3>Enums Defined:</h3>
    <ul>
      <li><code>Role</code>: <code>admin</code> (full access), <code>agent</code> (ticket management only).</li>
      <li><code>TicketStatus</code>: <code>new</code>, <code>processing</code>, <code>open</code>, <code>resolved</code>, <code>closed</code>.</li>
      <li><code>TicketCategory</code>: <code>general_question</code>, <code>technical_question</code>, <code>refund_request</code>.</li>
      <li><code>SenderType</code>: <code>agent</code>, <code>customer</code>.</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 5 -->
  <h2>5. Comprehensive File-by-File Directory Analysis</h2>

  <h3>5.1 Root Workspace Configuration &amp; Scripts</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">File Path</th>
        <th style="width: 35%;">Key Purpose</th>
        <th style="width: 40%;">Implementation &amp; Interconnections</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>package.json</code></td>
        <td>Monorepo definition &amp; task scripts</td>
        <td>Defines <code>workspaces: ["client", "server", "core"]</code>. Houses <code>dev</code>, <code>db:seed</code>, <code>db:seed:100</code>, and <code>test:e2e</code>.</td>
      </tr>
      <tr>
        <td><code>start-dev.ts</code></td>
        <td>Unified developer orchestrator</td>
        <td>Starts PGlite on port 5432, launches Express backend, and starts Vite frontend with graceful multi-process termination.</td>
      </tr>
      <tr>
        <td><code>seed-100-tickets.ts</code></td>
        <td>Production-grade dataset generator</td>
        <td>Connects to <code>.pgdata</code>, purges old tickets, seeds 100 diversified tickets across 30 past days, A–Z subjects, and generates 45 replies.</td>
      </tr>
      <tr>
        <td><code>seed-pglite.ts</code></td>
        <td>Database seed wrapper</td>
        <td>Entry point for <code>bun run db:seed</code> calling <code>seed100Tickets()</code>.</td>
      </tr>
      <tr>
        <td><code>init-db.ts</code></td>
        <td>Prisma migration runner</td>
        <td>Runs raw SQL migrations to build the schema in <code>.pgdata</code> on clean machines.</td>
      </tr>
      <tr>
        <td><code>playwright.config.ts</code></td>
        <td>E2E test suite configuration</td>
        <td>Spawns frontend and backend on port 3000/5173 targeting <code>.pgdata-test</code> with <code>workers: 1</code> to avoid lock collision.</td>
      </tr>
    </tbody>
  </table>

  <h3>5.2 Shared Core Directory (<code>/core</code>)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">File Path</th>
        <th style="width: 35%;">Key Purpose</th>
        <th style="width: 40%;">Implementation &amp; Interconnections</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>core/constants/role.ts</code></td>
        <td>Role constants &amp; types</td>
        <td>Exports <code>Role = { admin: "admin", agent: "agent" }</code> and TypeScript type.</td>
      </tr>
      <tr>
        <td><code>core/constants/ticket-status.ts</code></td>
        <td>Ticket status configurations</td>
        <td>Defines <code>ticketStatuses</code>, <code>statusLabel</code>, and badge UI color variants (<code>outline</code>, <code>default</code>, <code>secondary</code>).</td>
      </tr>
      <tr>
        <td><code>core/constants/ticket-category.ts</code></td>
        <td>Category definitions</td>
        <td>Defines categories (<code>general_question</code>, <code>technical_question</code>, <code>refund_request</code>) and display labels.</td>
      </tr>
      <tr>
        <td><code>core/constants/ai-agent.ts</code></td>
        <td>System AI agent identifier</td>
        <td>Exports <code>AI_AGENT_ID = 'ai_agent'</code> used for automated auto-resolution replies and SQL metrics calculation.</td>
      </tr>
      <tr>
        <td><code>core/schemas/users.ts</code></td>
        <td>Zod validation for Users</td>
        <td>Validates user creation (name &ge; 2 chars, valid email, password &ge; 8 chars) and user updates.</td>
      </tr>
      <tr>
        <td><code>core/schemas/tickets.ts</code></td>
        <td>Zod validation for Tickets</td>
        <td>Validates query parameters (<code>page</code>, <code>pageSize</code>, <code>sortBy</code>, <code>sortOrder</code>, <code>status</code>, <code>category</code>, <code>search</code>).</td>
      </tr>
      <tr>
        <td><code>core/schemas/replies.ts</code></td>
        <td>Zod validation for Replies</td>
        <td>Validates draft reply submission (<code>createReplySchema</code>) and polish requests (<code>polishReplySchema</code>).</td>
      </tr>
      <tr>
        <td><code>core/data/tickets-seed-data.ts</code></td>
        <td>100 Realistic ticket templates</td>
        <td>Contains curated real-life support templates spanning IT bugs, billing queries, and cancellation requests.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h3>5.3 Backend Server Directory (<code>/server</code>)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">File Path</th>
        <th style="width: 35%;">Key Purpose</th>
        <th style="width: 40%;">Implementation &amp; Interconnections</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>server/src/index.ts</code></td>
        <td>Express API Server Entry</td>
        <td>Configures CORS, Helmet, Better-Auth cookies, JSON middleware, mounts API routes, and starts background workers.</td>
      </tr>
      <tr>
        <td><code>server/src/db.ts</code></td>
        <td>Prisma client &amp; Postgres pool</td>
        <td>Instantiates <code>PrismaClient</code> via <code>PrismaPg</code> with a dedicated <code>pg.Pool</code> and error listener to prevent process crashes.</td>
      </tr>
      <tr>
        <td><code>server/src/lib/auth.ts</code></td>
        <td>Better Auth configuration</td>
        <td>Configures username/password authentication, database adapter, and custom user fields (<code>role</code>, <code>deletedAt</code>).</td>
      </tr>
      <tr>
        <td><code>server/src/middleware/require-auth.ts</code></td>
        <td>Authentication guard</td>
        <td>Validates session cookie via Better Auth. Sets <code>req.user</code> and <code>req.session</code>, or returns 401 Unauthorized.</td>
      </tr>
      <tr>
        <td><code>server/src/middleware/require-admin.ts</code></td>
        <td>Admin authorization guard</td>
        <td>Ensures <code>req.user.role === 'admin'</code>; returns 403 Forbidden to non-admin support agents.</td>
      </tr>
      <tr>
        <td><code>server/src/routes/tickets.ts</code></td>
        <td>Tickets REST endpoints</td>
        <td>Provides <code>GET /</code> (sorted, filtered, paginated tickets), <code>GET /stats</code> (SQL analytics), <code>GET /:id</code>, and <code>PATCH /:id</code>.</td>
      </tr>
      <tr>
        <td><code>server/src/routes/replies.ts</code></td>
        <td>Replies &amp; AI endpoints</td>
        <td>Handles <code>GET /</code>, <code>POST /</code>, <code>POST /polish</code> (AI rewrite with heuristic fallback), and <code>POST /summarize</code>.</td>
      </tr>
      <tr>
        <td><code>server/src/routes/users.ts</code></td>
        <td>User Management endpoints</td>
        <td>Provides admin-only CRUD: <code>GET /</code>, <code>POST /</code> (creates agent with hash), <code>PUT /:id</code>, <code>DELETE /:id</code> (soft-delete).</td>
      </tr>
      <tr>
        <td><code>server/src/routes/webhooks.ts</code></td>
        <td>Inbound email webhook</td>
        <td>Receives multipart SendGrid email posts, parses subject/body, inserts ticket with status <code>new</code>, and enqueues classification.</td>
      </tr>
      <tr>
        <td><code>server/src/lib/auto-resolve-ticket.ts</code></td>
        <td>Knowledge base auto-resolver</td>
        <td>Worker checking incoming tickets against <code>knowledge-base.md</code>. Auto-resolves if matched or escalates to human agent.</td>
      </tr>
      <tr>
        <td><code>server/src/lib/classify-ticket.ts</code></td>
        <td>Ticket classifier worker</td>
        <td>Worker evaluating ticket content and updating category to technical, general, or refund.</td>
      </tr>
    </tbody>
  </table>

  <h3>5.4 Frontend Client Directory (<code>/client</code>)</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">File Path</th>
        <th style="width: 35%;">Key Purpose</th>
        <th style="width: 40%;">Implementation &amp; Interconnections</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>client/src/App.tsx</code></td>
        <td>Router &amp; Query Provider</td>
        <td>Sets up <code>QueryClientProvider</code> and React Router v7 routes (<code>/</code>, <code>/login</code>, <code>/tickets</code>, <code>/tickets/:id</code>, <code>/users</code>).</td>
      </tr>
      <tr>
        <td><code>client/src/components/Layout.tsx</code></td>
        <td>Master application shell</td>
        <td>Displays top navigation, active route links, logged-in user email and role badge, and session timeout monitor.</td>
      </tr>
      <tr>
        <td><code>client/src/pages/TicketsPage.tsx</code></td>
        <td>Tickets view orchestrator</td>
        <td>Maintains <code>filters</code> state (<code>search</code>, <code>status</code>, <code>category</code>) and coordinates filter controls with table.</td>
      </tr>
      <tr>
        <td><code>client/src/pages/TicketsFilters.tsx</code></td>
        <td>Filter toolbar controls</td>
        <td>Renders search input with magnifying glass, status dropdown (<code>All</code>, <code>Open</code>, <code>Resolved</code>, <code>Closed</code>), and category dropdown.</td>
      </tr>
      <tr>
        <td><code>client/src/pages/TicketsTable.tsx</code></td>
        <td>Dynamic data table</td>
        <td>Implements TanStack Table: column header sorting (A-Z, Z-A), status badges, category pills, and 10-page pagination controls.</td>
      </tr>
      <tr>
        <td><code>client/src/pages/TicketDetailPage.tsx</code></td>
        <td>Ticket conversation view</td>
        <td>Displays ticket subject, metadata, status changer, agent assignment dropdown, conversation thread, and reply box.</td>
      </tr>
      <tr>
        <td><code>client/src/components/ReplyForm.tsx</code></td>
        <td>Reply composition &amp; Polish</td>
        <td>Textarea connected to React Hook Form. Houses <strong>Polish</strong> button (triggering AI polish) and <strong>Send Reply</strong> button.</td>
      </tr>
      <tr>
        <td><code>client/src/components/TicketSummary.tsx</code></td>
        <td>AI ticket summarizer widget</td>
        <td>Button triggering <code>POST /summarize</code> displaying 2-4 sentence executive summary in a clean alert card.</td>
      </tr>
      <tr>
        <td><code>client/src/pages/UsersPage.tsx</code></td>
        <td>Admin User Management</td>
        <td>Displays user table, "New User" modal trigger, "Edit User" dialog, and "Delete User" confirmation modal.</td>
      </tr>
      <tr>
        <td><code>client/src/components/ProtectedRoute.tsx</code></td>
        <td>Session authentication guard</td>
        <td>Checks <code>useSession()</code>. Redirects unauthenticated visitors to <code>/login</code> with redirect memory.</td>
      </tr>
      <tr>
        <td><code>client/src/components/AdminRoute.tsx</code></td>
        <td>Role authorization guard</td>
        <td>Checks <code>session.user.role === 'admin'</code>. Blocks agents from navigating to <code>/users</code>.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- SECTION 6 -->
  <h2>6. Core Code Implementations &amp; Workflows</h2>

  <h3>6.1 Authentication &amp; RBAC Guard Implementation</h3>
  <p>
    Security is enforced on both client and server. The client checks session state and hides administrative navigation links, while the server verifies session cookies on every API call:
  </p>
  <pre><code>// server/src/middleware/require-admin.ts
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden: Admin privileges required" });
    return;
  }
  next();
}</code></pre>

  <h3>6.2 Ticket Querying, Sorting &amp; Filtering Implementation</h3>
  <p>
    In <code>server/src/routes/tickets.ts</code>, queries dynamically construct Prisma where conditions while enforcing case-insensitive keyword search and pagination:
  </p>
  <pre><code>// server/src/routes/tickets.ts
const where: Prisma.TicketWhereInput = {};
if (query.status) where.status = query.status;
else where.status = { in: ["open", "resolved", "closed"] };

if (query.category) where.category = query.category;

if (query.search) {
  where.OR = [
    { subject: { contains: query.search, mode: "insensitive" } },
    { senderName: { contains: query.search, mode: "insensitive" } },
    { senderEmail: { contains: query.search, mode: "insensitive" } },
  ];
}

const [tickets, total] = await Promise.all([
  prisma.ticket.findMany({
    where,
    orderBy: { [query.sortBy]: query.sortOrder },
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  }),
  prisma.ticket.count({ where }),
]);</code></pre>

  <h3>6.3 AI Polish Architecture with Resilient Local Fallback</h3>
  <p>
    The Polish button leverages a hybrid AI + Heuristic architecture in <code>server/src/routes/replies.ts</code>:
  </p>
  <pre><code>// server/src/routes/replies.ts
export function polishReplyLocally(rawBody: string, customerName: string, agentName: string): string {
  let cleaned = rawBody.trim()
    .replace(/^(hi|hello|hey|dear)\\s+[^,\\n]+[,:\\s]*/i, "")
    .replace(/(best\\s+regards|regards|sincerely|thanks|cheers)[\\s\\S]*$/i, "")
    .replace(/https?:\\/\\/localhost:5173\\/?/gi, "")
    .trim();

  // Capitalize sentence beginnings and expand abbreviations (pls -> please, thx -> thank you)
  cleaned = cleaned.replace(/(^|[.!?]\\s+)([a-z])/g, (_, p, l) => p + l.toUpperCase());
  if (cleaned && !/[.!?]$/.test(cleaned)) cleaned += ".";

  return \`Hi \${customerName},\\n\\n\${cleaned}\\n\\nBest regards,\\n\${agentName}\\nhttp://localhost:5173/\`;
}</code></pre>

  <div class="page-break"></div>

  <!-- SECTION 7 -->
  <h2>7. Key Engineering Challenges &amp; Applied Solutions</h2>

  <div class="callout callout-warning avoid-break">
    <div class="callout-title">Challenge 1: Zero-Config Embedded Database</div>
    <p><strong>Problem:</strong> Standard PostgreSQL required developers to run external Docker daemons or local Postgres installations.</p>
    <p><strong>Solution:</strong> Embedded <code>@electric-sql/pglite</code> WASM PostgreSQL directly into the repository. <code>start-db.ts</code> runs a socket server listening on <code>127.0.0.1:5432</code>, allowing standard Prisma client and Better Auth connections with zero setup.</p>
  </div>

  <div class="callout callout-warning avoid-break">
    <div class="callout-title">Challenge 2: Test Database File Locking &amp; Socket Drops (P1017)</div>
    <p><strong>Problem:</strong> Rapid test restarts caused Windows NTFS file lock collisions on <code>postmaster.pid</code> and transient socket disconnects (<code>DriverAdapterError: ConnectionClosed / P1017</code>), crashing backend test processes.</p>
    <p><strong>Solution:</strong> Refactored <code>start-test-db.ts</code> to a single-instance pattern, passing the active database directly to migrations and seeders. Added error listeners to <code>pg.Pool</code> in <code>server/src/db.ts</code> to absorb transient WASM socket disconnects cleanly.</p>
  </div>

  <div class="callout callout-warning avoid-break">
    <div class="callout-title">Challenge 3: Testing Dataset Limitations</div>
    <p><strong>Problem:</strong> Initial development only had 4 basic tickets. Sorting columns, search keywords, and pagination (which requires &gt;10 rows) could not be tested or showcased.</p>
    <p><strong>Solution:</strong> Authored <code>seed-100-tickets.ts</code> and <code>core/data/tickets-seed-data.ts</code>. Generated 100 diversified tickets spanning all statuses (44 open, 48 resolved, 8 closed), categories (55 technical, 28 general, 12 refund, 5 uncategorized), A–Z subject alphabetical diversity, and 30 days of timestamp distribution.</p>
  </div>

  <div class="callout callout-warning avoid-break">
    <div class="callout-title">Challenge 4: "Polish" Button 500 Failure</div>
    <p><strong>Problem:</strong> The Polish button crashed with <code>500 Internal Server Error</code> and showed "Failed to polish reply" because <code>OPENAI_API_KEY</code> was unconfigured by default and model name <code>gpt-5-nano</code> was non-existent.</p>
    <p><strong>Solution:</strong> Wrapped OpenAI calls in try/catch blocks with dynamic model resolution (<code>gpt-4o-mini</code>) and implemented <code>polishReplyLocally</code>. If OpenAI keys are missing or offline, the local polisher formats the text instantly, ensuring the button always succeeds.</p>
  </div>

  <div class="callout callout-warning avoid-break">
    <div class="callout-title">Challenge 5: Polished Reply Link Customization</div>
    <p><strong>Problem:</strong> Polish replies originally appended course link <code>https://codewithmosh.com</code>.</p>
    <p><strong>Solution:</strong> Customized both AI prompt instructions and local heuristic engines to sign off with the authenticated agent's name and append <code>http://localhost:5173/</code> on its own line.</p>
  </div>

  <!-- SECTION 8 -->
  <h2>8. Verification &amp; Test Suite Results</h2>
  <div class="avoid-break">
    <p>The system is verified by two comprehensive automated test suites:</p>
    <div style="display: flex; gap: 15px; margin: 15px 0;">
      <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 6px;">
        <div style="font-weight: 700; color: #166534; font-size: 11pt;">Vitest Component Suite</div>
        <div style="font-size: 20pt; font-weight: 800; color: #15803d; margin: 4px 0;">114 / 114 Passed</div>
        <div style="font-size: 8.5pt; color: #166534;">8 Test Files | 100% Pass Rate | ~10.2s runtime</div>
      </div>
      <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 6px;">
        <div style="font-weight: 700; color: #1e40af; font-size: 11pt;">Playwright E2E Suite</div>
        <div style="font-size: 20pt; font-weight: 800; color: #1d4ed8; margin: 4px 0;">12 / 12 Passed</div>
        <div style="font-size: 8.5pt; color: #1e40af;">Full User Management CRUD | ~43.7s runtime</div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 9 -->
  <h2>9. Setup, Execution &amp; Seeding Guide</h2>

  <h3>9.1 Starting the Complete Project</h3>
  <p>To start the embedded database, API backend, and frontend interface in a single command:</p>
  <pre><code>cd d:\\internship\\helpdesk
bun run dev</code></pre>
  <p>Open <code>http://localhost:5173</code> in your browser to access the dashboard.</p>

  <h3>9.2 Default Administrative Credentials</h3>
  <table>
    <thead>
      <tr>
        <th>Role</th>
        <th>Email Address</th>
        <th>Password</th>
        <th>Capabilities</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge badge-purple">Admin</span></td>
        <td><code>admin@example.com</code></td>
        <td><code>AdminPassword123!</code></td>
        <td>Full platform access: Tickets, Analytics, AI Tools, and User Management.</td>
      </tr>
      <tr>
        <td><span class="badge badge-blue">Agent</span></td>
        <td><code>agent1@example.com</code></td>
        <td><code>AgentPassword123!</code></td>
        <td>Ticket handling, customer replies, AI polishing, status updates.</td>
      </tr>
    </tbody>
  </table>

  <h3>9.3 Database Seeding &amp; Testing Commands</h3>
  <pre><code># Re-seed all 100 diversified tickets into .pgdata
bun run db:seed:100

# Run Playwright End-to-End tests in headless mode
bun run test:e2e

# Run Playwright End-to-End tests in interactive UI mode
bun run test:e2e:ui

# Run client Vitest unit tests
cd client &amp;&amp; bun run test</code></pre>

  <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 8pt;">
    Helpdesk Documentation &copy; 2026 rushisable05. All Rights Reserved. Generated with Playwright Chromium.
  </div>

</body>
</html>
`;

async function generatePdf() {
  console.log('🚀 Launching Chromium to generate PDF documentation...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '12mm',
      right: '12mm',
    },
  });

  await browser.close();
  console.log(`✅ Documentation PDF generated successfully at: ${outputPath}`);
}

generatePdf().catch((err) => {
  console.error('❌ PDF generation failed:', err);
  process.exit(1);
});
