import path from "path";
import Sentry from "./lib/sentry";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { requireAuth } from "./middleware/require-auth";
import usersRouter from "./routes/users";
import ticketsRouter from "./routes/tickets";
import agentsRouter from "./routes/agents";
import webhooksRouter from "./routes/webhooks";
import repliesRouter from "./routes/replies";
import { startQueue, stopQueue } from "./lib/queue";


if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

// Trust Railway / reverse proxy headers for secure cookies and rate limiting
app.set("trust proxy", 1);

const trustedOrigins = [
  ...(process.env.TRUSTED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? []),
  ...(process.env.RAILWAY_PUBLIC_DOMAIN ? [`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`] : []),
];

app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://*.sentry.io", "https://*.ingest.us.sentry.io", "https://*.ingest.de.sentry.io"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
          },
        }
      : false,
  })
);
app.use(
  cors({
    origin: trustedOrigins.length > 0 ? trustedOrigins : true,
    credentials: true,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  skip: () => !isProduction,
});

// Mount Better Auth handler BEFORE express.json()
// Better Auth parses its own request bodies
// toNodeHandler returns a promise; must be caught for Express 5
app.all("/api/auth/{*any}", authLimiter, (req, res, next) => {
  res.on("finish", () => {
    if (req.path.includes("sign-in") && res.statusCode >= 400) {
      Sentry.captureMessage(`Backend login failed (HTTP ${res.statusCode})`, {
        level: res.statusCode >= 500 ? "error" : "warning",
        tags: { area: "auth", action: "sign-in" },
        extra: { path: req.path, statusCode: res.statusCode, ip: req.ip },
      });
    }
  });
  toNodeHandler(auth)(req, res).catch(next);
});

app.use(express.json());

// Root endpoint for browser & status check
app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Helpdesk API Server (Port 3000)</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 36px; max-width: 520px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #34e7c6ff; box-shadow: 0 0 8px #10b981; }
        h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #fff; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; }
        .btn { display: inline-flex; align-items: center; justify-content: center; background: #3b82f6; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: background 0.2s; width: 100%; box-sizing: border-box; text-align: center; }
        .btn:hover { background: #2563eb; }
        .endpoints { margin-top: 24px; padding-top: 18px; border-top: 1px solid #1f2937; }
        .endpoints h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin: 0 0 8px 0; }
        .endpoints ul { list-style: none; padding: 0; margin: 0; font-family: monospace; font-size: 12px; color: #cbd5e1; }
        .endpoints li { padding: 4px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge"><span class="dot"></span> Backend API Server Live & Running</div>
        <h1>Helpdesk API Server (Port 3000)</h1>
        <p>Aap <strong>Backend API Server (Port 3000)</strong> par hain. Frontend web application (Login & Dashboard) dekhne ke liye neeche diye gaye link par click karein:</p>
        <a href="http://localhost:5173" class="btn">🚀 Open Frontend Website (http://localhost:5173)</a>
        <div class="endpoints">
          <h3>Active API Endpoints:</h3>
          <ul>
            <li>GET <a href="/api/health" style="color: #38bdf8;">/api/health</a> (Server Health: OK)</li>
            <li>GET <a href="/api/tickets" style="color: #38bdf8;">/api/tickets</a> (Tickets REST API)</li>
            <li>POST /api/auth/sign-in/email (Better Auth Sign-in)</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/me", requireAuth, (req, res) => {
  const { id, name, email, role } = req.user;
  res.json({ user: { id, name, email, role } });
});

app.use("/api/users", usersRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/tickets/:ticketId/replies", repliesRouter);
app.use("/api/webhooks", webhooksRouter);

Sentry.setupExpressErrorHandler(app);

// In production, serve the built React client as static files
if (isProduction) {
  const clientDist = path.resolve(import.meta.dirname, "../../client/dist");
  app.use(express.static(clientDist));

  // SPA fallback: serve index.html for any non-API route
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

if (!process.env.WEBHOOK_SECRET) {
  console.warn("Warning: WEBHOOK_SECRET is not set. Webhook endpoints will return 500.");
}

async function boot() {
  try {
    await startQueue();
  } catch (err: any) {
    console.warn("⚠️ Background queue notice (pg-boss):", err?.message || err);
    console.log("ℹ️ Server continuing in embedded database mode (Auth & API fully active)");
  }

  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  const shutdown = async () => {
    console.log("Shutting down...");
    server.close();
    try {
      await stopQueue();
    } catch { }
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

boot().catch((error) => {
  Sentry.captureException(error);
  console.error("Failed to start server:", error);
  process.exit(1);
});
