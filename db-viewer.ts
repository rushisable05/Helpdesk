import express from "express";
import prisma from "./server/src/db";

const app = express();
const PORT = 5555;

app.use(express.json());

// API: Get summary of tables & counts
app.get("/api/summary", async (_req, res) => {
  try {
    const [tickets, users, replies, sessions, accounts] = [
      await prisma.ticket.count(),
      await prisma.user.count(),
      await prisma.reply.count(),
      await prisma.session.count(),
      await prisma.account.count(),
    ];
    res.json({
      tables: [
        { name: "ticket", label: "Tickets", count: tickets, icon: "🎫" },
        { name: "user", label: "Users", count: users, icon: "👥" },
        { name: "reply", label: "Replies", count: replies, icon: "💬" },
        { name: "session", label: "Sessions", count: sessions, icon: "🔑" },
        { name: "account", label: "Accounts", count: accounts, icon: "🛡️" },
      ],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get rows of a specific table
app.get("/api/table/:name", async (req, res) => {
  const { name } = req.params;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  try {
    let rows: any[] = [];
    let total = 0;

    switch (name) {
      case "ticket":
        total = await prisma.ticket.count();
        rows = await prisma.ticket.findMany({
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        });
        break;
      case "user":
        total = await prisma.user.count();
        rows = await prisma.user.findMany({
          skip,
          take: pageSize,
          orderBy: { createdAt: "asc" },
        });
        break;
      case "reply":
        total = await prisma.reply.count();
        rows = await prisma.reply.findMany({
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        });
        break;
      case "session":
        total = await prisma.session.count();
        rows = await prisma.session.findMany({
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        });
        break;
      case "account":
        total = await prisma.account.count();
        rows = await prisma.account.findMany({
          skip,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        });
        break;
      default:
        res.status(400).json({ error: "Unknown table name" });
        return;
    }

    res.json({ rows, total, page, pageSize });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Execute Raw SQL query
app.post("/api/query", async (req, res) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== "string") {
    res.status(400).json({ error: "SQL string required" });
    return;
  }

  const trimmed = sql.trim().toLowerCase();
  try {
    if (trimmed.startsWith("select")) {
      const result: any[] = await prisma.$queryRawUnsafe(sql);
      // Convert BigInt to string for JSON serialization
      const sanitized = JSON.parse(
        JSON.stringify(result, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
      );
      res.json({ rows: sanitized, count: sanitized.length });
    } else {
      const affected = await prisma.$executeRawUnsafe(sql);
      res.json({ affected, message: `Query executed. Rows affected: ${affected}` });
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Frontend UI
app.get("/{*path}", (_req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Database Studio | Helpdesk</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f1f5f9; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</head>
<body class="min-h-screen flex flex-col">
  <!-- Navbar -->
  <header class="h-16 border-b border-gray-800 bg-[#111827] flex items-center justify-between px-6 sticky top-0 z-20">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md shadow-indigo-600/30">
        🗄️
      </div>
      <div>
        <h1 class="text-base font-bold text-white leading-tight">Helpdesk Database Studio</h1>
        <p class="text-xs text-gray-400">PostgreSQL @ 127.0.0.1:5432 &bull; Database: <span class="text-indigo-400 font-mono">helpdesk</span></p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Connected
      </span>
      <a href="http://localhost:5173" target="_blank" class="text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 transition flex items-center gap-1.5">
        🚀 Open App (5173) &rarr;
      </a>
    </div>
  </header>

  <div class="flex-1 flex overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-gray-800 bg-[#0d1322] flex flex-col shrink-0">
      <div class="p-4 border-b border-gray-800/80">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-400">Tables</h2>
      </div>
      <nav id="table-list" class="p-3 space-y-1 overflow-y-auto flex-1">
        <div class="text-xs text-gray-500 p-2">Loading tables...</div>
      </nav>
      <div class="p-3 border-t border-gray-800/80">
        <button onclick="selectRawSql()" id="btn-sql" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition">
          <span>⚡</span>
          <span>SQL Query Runner</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col bg-[#0b0f19] overflow-hidden">
      <!-- Top Actions Bar -->
      <div class="h-14 border-b border-gray-800 bg-[#0e1424] px-6 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-3">
          <h2 id="view-title" class="text-lg font-bold text-white">Tickets</h2>
          <span id="badge-count" class="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">0 rows</span>
        </div>
        <div id="table-actions" class="flex items-center gap-3">
          <input type="text" id="search-input" oninput="filterRows()" placeholder="Search in view..." class="bg-[#161f36] border border-gray-700 text-xs text-gray-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-500 w-56">
          <button onclick="loadCurrentTable()" class="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-3 py-1.5 rounded-lg border border-gray-700 transition flex items-center gap-1">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Table View Container -->
      <div id="table-container" class="flex-1 overflow-auto p-6">
        <div class="text-sm text-gray-400">Loading data...</div>
      </div>

      <!-- SQL Console Container (Hidden by default) -->
      <div id="sql-container" class="flex-1 flex-col p-6 hidden overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <label class="text-xs font-semibold text-gray-300 uppercase tracking-wider">Execute Custom SQL Query</label>
          <div class="flex gap-2">
            <button onclick="setQuery('SELECT * FROM ticket LIMIT 10')" class="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-700">Sample Ticket Query</button>
            <button onclick="setQuery('SELECT id, name, email, role FROM \\"user\\"')\" class="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-700">Sample Users Query</button>
          </div>
        </div>
        <textarea id="sql-input" rows="4" class="w-full bg-[#111827] border border-gray-700 rounded-lg p-3 text-sm font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 mb-3" placeholder="SELECT * FROM ticket LIMIT 10;"></textarea>
        <div class="flex justify-between items-center mb-4">
          <button onclick="runSql()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md shadow-indigo-600/30 flex items-center gap-1.5">
            ▶️ Run Query
          </button>
          <span id="sql-status" class="text-xs text-gray-400"></span>
        </div>
        <div id="sql-results" class="flex-1 overflow-auto border border-gray-800 rounded-lg bg-[#0e1424] p-4 text-xs font-mono">
          <span class="text-gray-500">Query results will appear here...</span>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div id="pagination-bar" class="h-12 border-t border-gray-800 bg-[#0e1424] px-6 flex items-center justify-between shrink-0 text-xs text-gray-400">
        <span id="page-info">Page 1</span>
        <div class="flex items-center gap-2">
          <button id="btn-prev" onclick="prevPage()" class="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
          <button id="btn-next" onclick="nextPage()" class="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
        </div>
      </div>
    </main>
  </div>

  <script>
    let currentTable = 'ticket';
    let currentPage = 1;
    let allRows = [];
    let tablesData = [];

    async function init() {
      await fetchSummary();
      selectTable('ticket');
    }

    async function fetchSummary() {
      try {
        const res = await fetch('/api/summary');
        const data = await res.json();
        tablesData = data.tables || [];
        renderSidebar();
      } catch (err) {
        console.error(err);
      }
    }

    function renderSidebar() {
      const container = document.getElementById('table-list');
      container.innerHTML = tablesData.map(t => \`
        <button onclick="selectTable('\${t.name}')" id="nav-\${t.name}" class="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition \${currentTable === t.name ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : ''}">
          <div class="flex items-center gap-2">
            <span>\${t.icon}</span>
            <span class="capitalize">\${t.label}</span>
          </div>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-400">\${t.count}</span>
        </button>
      \`).join('');
    }

    function selectTable(name) {
      currentTable = name;
      currentPage = 1;
      document.getElementById('search-input').value = '';
      document.getElementById('table-container').classList.remove('hidden');
      document.getElementById('pagination-bar').classList.remove('hidden');
      document.getElementById('table-actions').classList.remove('hidden');
      document.getElementById('sql-container').classList.add('hidden');
      document.getElementById('btn-sql').classList.remove('bg-indigo-600/20', 'text-indigo-300');
      
      renderSidebar();
      loadCurrentTable();
    }

    function selectRawSql() {
      document.getElementById('table-container').classList.add('hidden');
      document.getElementById('pagination-bar').classList.add('hidden');
      document.getElementById('table-actions').classList.add('hidden');
      document.getElementById('sql-container').classList.remove('hidden');
      document.getElementById('sql-container').classList.add('flex');
      document.getElementById('view-title').textContent = "SQL Query Console";
      document.getElementById('badge-count').textContent = "interactive";

      // remove active style from table buttons
      tablesData.forEach(t => {
        const btn = document.getElementById('nav-' + t.name);
        if (btn) btn.className = btn.className.replace('bg-indigo-600/20 text-indigo-300 border border-indigo-500/30', '');
      });
      document.getElementById('btn-sql').classList.add('bg-indigo-600/20', 'text-indigo-300');
    }

    async function loadCurrentTable() {
      const container = document.getElementById('table-container');
      container.innerHTML = '<div class="text-sm text-gray-400 animate-pulse">Loading data from PostgreSQL...</div>';
      
      const tableMeta = tablesData.find(t => t.name === currentTable);
      document.getElementById('view-title').textContent = tableMeta ? tableMeta.label : currentTable;

      try {
        const res = await fetch(\`/api/table/\${currentTable}?page=\${currentPage}\`);
        const data = await res.json();
        allRows = data.rows || [];
        document.getElementById('badge-count').textContent = \`\${data.total} rows total\`;
        
        const totalPages = Math.ceil(data.total / data.pageSize) || 1;
        document.getElementById('page-info').textContent = \`Page \${currentPage} of \${totalPages} (\${data.total} total items)\`;
        document.getElementById('btn-prev').disabled = currentPage <= 1;
        document.getElementById('btn-next').disabled = currentPage >= totalPages;

        renderTable(allRows);
      } catch (err) {
        container.innerHTML = \`<div class="p-4 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm">Failed to load table: \${err.message}</div>\`;
      }
    }

    function renderTable(rows) {
      const container = document.getElementById('table-container');
      if (!rows || rows.length === 0) {
        container.innerHTML = '<div class="text-sm text-gray-500 p-8 text-center border border-dashed border-gray-800 rounded-xl">No records found in this table.</div>';
        return;
      }

      const columns = Object.keys(rows[0]);
      let html = \`
        <div class="border border-gray-800 rounded-xl overflow-hidden shadow-xl bg-[#0e1424]">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-[#141b2e] border-b border-gray-800 text-gray-300 font-semibold tracking-wide">
                  <th class="p-3 text-gray-500 w-12 text-center">#</th>
                  \${columns.map(c => \`<th class="p-3 whitespace-nowrap uppercase tracking-wider text-[11px] text-gray-400">\${c}</th>\`).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800/60 font-mono">
      \`;

      rows.forEach((row, i) => {
        html += \`<tr class="hover:bg-gray-800/40 transition">\`;
        html += \`<td class="p-3 text-gray-500 text-center">\${(currentPage - 1) * 20 + i + 1}</td>\`;
        columns.forEach(col => {
          let val = row[col];
          let formatted = formatCell(col, val);
          html += \`<td class="p-3 whitespace-nowrap text-gray-200">\${formatted}</td>\`;
        });
        html += \`</tr>\`;
      });

      html += \`</tbody></table></div></div>\`;
      container.innerHTML = html;
    }

    function formatCell(col, val) {
      if (val === null || val === undefined) return '<span class="text-gray-600">NULL</span>';
      if (typeof val === 'boolean') return val ? '<span class="text-emerald-400">true</span>' : '<span class="text-rose-400">false</span>';
      if (col.toLowerCase().includes('status')) {
        const color = val === 'open' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : val === 'resolved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-gray-700 text-gray-300 border-gray-600';
        return \`<span class="px-2 py-0.5 rounded text-[11px] font-sans border \${color}">\${val}</span>\`;
      }
      if (col.toLowerCase().includes('role')) {
        return \`<span class="px-2 py-0.5 rounded text-[11px] font-sans bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">\${val}</span>\`;
      }
      if (typeof val === 'string' && val.length > 50) {
        return \`<span title="\${escapeHtml(val)}" class="text-gray-300 font-sans">\${escapeHtml(val.slice(0, 48))}...</span>\`;
      }
      if (typeof val === 'object') {
        return \`<span class="text-indigo-400">\${escapeHtml(JSON.stringify(val))}</span>\`;
      }
      return \`<span class="font-sans text-gray-200">\${escapeHtml(String(val))}</span>\`;
    }

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function filterRows() {
      const q = document.getElementById('search-input').value.toLowerCase();
      if (!q) {
        renderTable(allRows);
        return;
      }
      const filtered = allRows.filter(row => {
        return Object.values(row).some(v => String(v).toLowerCase().includes(q));
      });
      renderTable(filtered);
    }

    function prevPage() {
      if (currentPage > 1) {
        currentPage--;
        loadCurrentTable();
      }
    }

    function nextPage() {
      currentPage++;
      loadCurrentTable();
    }

    function setQuery(sql) {
      document.getElementById('sql-input').value = sql;
    }

    async function runSql() {
      const sql = document.getElementById('sql-input').value;
      const statusEl = document.getElementById('sql-status');
      const resultsEl = document.getElementById('sql-results');

      if (!sql.trim()) return;
      statusEl.textContent = 'Executing query...';

      try {
        const res = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sql })
        });
        const data = await res.json();
        if (data.error) {
          statusEl.textContent = '❌ Error';
          resultsEl.innerHTML = \`<div class="text-red-400 font-mono">\${escapeHtml(data.error)}</div>\`;
        } else if (data.rows) {
          statusEl.textContent = \`✅ Success (\${data.count} rows returned)\`;
          resultsEl.innerHTML = \`<pre class="text-emerald-300 font-mono overflow-auto max-h-96">\${escapeHtml(JSON.stringify(data.rows, null, 2))}</pre>\`;
        } else {
          statusEl.textContent = \`✅ Success\`;
          resultsEl.innerHTML = \`<div class="text-emerald-400 font-mono">\${escapeHtml(data.message)}</div>\`;
        }
      } catch (err) {
        statusEl.textContent = '❌ Request failed';
        resultsEl.innerHTML = \`<div class="text-red-400 font-mono">\${escapeHtml(err.message)}</div>\`;
      }
    }

    init();
  </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`Database Studio live on http://localhost:${PORT}`);
});
