import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllData() {
    const [users, todos, rawSessions, activityLogs, rolesAccess] = await Promise.all([
      this.prisma.user.findMany({
        select: { id: true, username: true, email: true, role: true, createdAt: true },
        orderBy: { username: 'asc' },
      }),
      this.prisma.todo.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sessionLog.findMany({
        orderBy: { loginTime: 'desc' },
      }),
      this.prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rolesBasedAccess.findMany({
        orderBy: { role: 'asc' },
      }),
    ]);

    const sessionLogs = rawSessions.map((s) => ({
      ...s,
      logoutTime:
        typeof s.logoutTime === 'object' && s.logoutTime !== null && '$date' in (s.logoutTime as any)
          ? (s.logoutTime as any)['$date']
          : s.logoutTime ?? 'Session in progress',
    }));

    return {
      database: 'MongoDB (todo-app)',
      engine: 'NestJS + Prisma ORM',
      stats: {
        totalUsers: users.length,
        totalTodos: todos.length,
        totalSessions: sessionLogs.length,
        activeSessions: sessionLogs.filter((s) => s.logoutTime === 'Session in progress').length,
        totalActivities: activityLogs.length,
        totalRoles: rolesAccess.length,
      },
      data: {
        users,
        todos,
        sessionLogs,
        activityLogs,
        rolesAccess,
      },
    };
  }

  getDashboardHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NestJS & Prisma - MongoDB Data Viewer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-base: #0B0F19;
      --bg-card: rgba(18, 24, 38, 0.7);
      --bg-card-hover: rgba(26, 34, 52, 0.85);
      --border-color: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(99, 102, 241, 0.5);
      --text-main: #F3F4F6;
      --text-muted: #9CA3AF;
      --primary: #6366F1;
      --primary-glow: rgba(99, 102, 241, 0.25);
      --accent: #06B6D4;
      --success: #10B981;
      --warning: #F59E0B;
      --danger: #EF4444;
      --admin-badge: linear-gradient(135deg, #EC4899, #8B5CF6);
      --user-badge: linear-gradient(135deg, #3B82F6, #06B6D4);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg-base);
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(6, 182, 212, 0.12) 0px, transparent 50%),
        radial-gradient(at 50% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      background: rgba(11, 15, 25, 0.8);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 1rem 2rem;
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .logo-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #E0234E 0%, #6366F1 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.25rem;
      box-shadow: 0 4px 20px rgba(224, 35, 78, 0.35);
    }

    .brand-title h1 {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .brand-title p {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .status-pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      border: 1px solid transparent;
      outline: none;
    }

    .btn-primary {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 4px 14px var(--primary-glow);
    }

    .btn-primary:hover {
      background: #4F46E5;
      transform: translateY(-1px);
    }

    .btn-outline {
      background: rgba(255, 255, 255, 0.05);
      border-color: var(--border-color);
      color: var(--text-main);
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }

    main {
      flex: 1;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1.25rem;
    }

    .stat-card {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      opacity: 0.8;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    }

    .stat-label {
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
    }

    .controls-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      background: var(--bg-card);
      padding: 0.75rem 1rem;
      border-radius: 14px;
      border: 1px solid var(--border-color);
    }

    .nav-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .tab-btn:hover {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.05);
    }

    .tab-btn.active {
      color: #fff;
      background: var(--primary);
      box-shadow: 0 2px 10px var(--primary-glow);
    }

    .tab-badge {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.15);
      font-family: 'JetBrains Mono', monospace;
    }

    .search-input {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      color: #fff;
      font-size: 0.875rem;
      min-width: 250px;
      outline: none;
      transition: all 0.2s;
    }

    .search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .content-card {
      background: var(--bg-card);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
    }

    .table-container {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    thead {
      background: rgba(0, 0, 0, 0.35);
      border-bottom: 1px solid var(--border-color);
    }

    th {
      padding: 1rem 1.25rem;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      white-space: nowrap;
    }

    tbody tr {
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      transition: background-color 0.15s ease;
    }

    tbody tr:hover {
      background-color: var(--bg-card-hover);
    }

    td {
      padding: 1rem 1.25rem;
      color: var(--text-main);
      vertical-align: middle;
    }

    .id-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8125rem;
      color: var(--accent);
      background: rgba(6, 182, 212, 0.1);
      padding: 0.2rem 0.45rem;
      border-radius: 6px;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-admin {
      background: var(--admin-badge);
      color: #fff;
    }

    .badge-user {
      background: var(--user-badge);
      color: #fff;
    }

    .badge-in-progress {
      background: rgba(245, 158, 11, 0.15);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .badge-completed {
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .method-tag {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .method-GET { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
    .method-POST { background: rgba(16, 185, 129, 0.2); color: #34D399; }
    .method-PUT { background: rgba(245, 158, 11, 0.2); color: #FBBF24; }
    .method-DELETE { background: rgba(239, 68, 68, 0.2); color: #F87171; }

    .pre-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.785rem;
      white-space: pre-line;
      line-height: 1.4;
      background: rgba(0, 0, 0, 0.25);
      padding: 0.75rem;
      border-radius: 8px;
      color: #D1D5DB;
      max-height: 180px;
      overflow-y: auto;
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }

    footer {
      border-top: 1px solid var(--border-color);
      padding: 1.5rem 2rem;
      text-align: center;
      font-size: 0.8125rem;
      color: var(--text-muted);
      background: rgba(11, 15, 25, 0.6);
    }

    .footer-links {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }

    .footer-links a {
      color: var(--primary);
      text-decoration: none;
    }

    .footer-links a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>

  <header>
    <div class="header-content">
      <div class="brand">
        <div class="logo-badge">N</div>
        <div class="brand-title">
          <h1>NestJS & Prisma Data Viewer <span class="status-pill"><span class="status-dot"></span> MongoDB Connected</span></h1>
          <p>Database: <strong>todo-app</strong> &bull; Migration from <strong>Nodejs_practice/backend</strong></p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" onclick="loadAllData()" id="refreshBtn">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
        <a href="/api/user/get_User" target="_blank" class="btn btn-outline">Raw JSON</a>
      </div>
    </div>
  </header>

  <main>
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Users</div>
        <div class="stat-value" id="statUsers">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Todos</div>
        <div class="stat-value" id="statTodos">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Sessions</div>
        <div class="stat-value" id="statActiveSessions">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Session Logs</div>
        <div class="stat-value" id="statSessions">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Audit Activities</div>
        <div class="stat-value" id="statActivities">-</div>
      </div>
    </div>

    <!-- Navigation & Filter Bar -->
    <div class="controls-bar">
      <div class="nav-tabs">
        <button class="tab-btn active" onclick="switchTab('users')" id="tabUsers">
          Users <span class="tab-badge" id="badgeUsers">0</span>
        </button>
        <button class="tab-btn" onclick="switchTab('todos')" id="tabTodos">
          Todos <span class="tab-badge" id="badgeTodos">0</span>
        </button>
        <button class="tab-btn" onclick="switchTab('sessions')" id="tabSessions">
          Session Logs <span class="tab-badge" id="badgeSessions">0</span>
        </button>
        <button class="tab-btn" onclick="switchTab('activities')" id="tabActivities">
          Activity Logs <span class="tab-badge" id="badgeActivities">0</span>
        </button>
        <button class="tab-btn" onclick="switchTab('roles')" id="tabRoles">
          Roles Access <span class="tab-badge" id="badgeRoles">0</span>
        </button>
      </div>

      <input type="text" class="search-input" id="searchInput" placeholder="Search current table..." oninput="handleSearch()">
    </div>

    <!-- Table Container -->
    <div class="content-card">
      <div class="table-container" id="tableContainer">
        <div class="empty-state">Loading data from MongoDB via Prisma...</div>
      </div>
    </div>
  </main>

  <footer>
    <p>Recreated using NestJS 10, TypeScript & Prisma ORM 5 &bull; Local MongoDB todo-app</p>
    <div class="footer-links">
      <a href="/api/Fetch" target="_blank">GET /api/Fetch</a>
      <a href="/api/user/get_User" target="_blank">GET /api/user/get_User</a>
      <a href="/api/user/roles_based_access" target="_blank">GET /api/user/roles_based_access</a>
      <a href="/api/user/session_logs" target="_blank">GET /api/user/session_logs</a>
      <a href="/api/user/activity_logs" target="_blank">GET /api/user/activity_logs</a>
    </div>
  </footer>

  <script>
    let currentData = null;
    let activeTab = 'users';

    async function loadAllData() {
      const btn = document.getElementById('refreshBtn');
      if (btn) btn.style.opacity = '0.5';

      try {
        const res = await fetch('/api/all-data');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        currentData = json.data;

        // Update stats
        document.getElementById('statUsers').textContent = json.stats.totalUsers;
        document.getElementById('statTodos').textContent = json.stats.totalTodos;
        document.getElementById('statActiveSessions').textContent = json.stats.activeSessions;
        document.getElementById('statSessions').textContent = json.stats.totalSessions;
        document.getElementById('statActivities').textContent = json.stats.totalActivities;

        // Update badges
        document.getElementById('badgeUsers').textContent = json.stats.totalUsers;
        document.getElementById('badgeTodos').textContent = json.stats.totalTodos;
        document.getElementById('badgeSessions').textContent = json.stats.totalSessions;
        document.getElementById('badgeActivities').textContent = json.stats.totalActivities;
        document.getElementById('badgeRoles').textContent = json.stats.totalRoles;

        renderCurrentTab();
      } catch (err) {
        document.getElementById('tableContainer').innerHTML = 
          '<div class="empty-state" style="color: #EF4444;">Error loading data: ' + err.message + '</div>';
      } finally {
        if (btn) btn.style.opacity = '1';
      }
    }

    function switchTab(tab) {
      activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
      if (activeBtn) activeBtn.classList.add('active');
      document.getElementById('searchInput').value = '';
      renderCurrentTab();
    }

    function handleSearch() {
      renderCurrentTab();
    }

    function renderCurrentTab() {
      if (!currentData) return;
      const term = (document.getElementById('searchInput').value || '').toLowerCase().trim();
      const container = document.getElementById('tableContainer');

      if (activeTab === 'users') {
        const list = currentData.users.filter(u => 
          !term || u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.role.toLowerCase().includes(term)
        );
        if (list.length === 0) {
          container.innerHTML = '<div class="empty-state">No users match your search.</div>';
          return;
        }
        let html = '<table><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Created At</th></tr></thead><tbody>';
        list.forEach(u => {
          const badgeClass = u.role === 'admin' ? 'badge-admin' : 'badge-user';
          html += '<tr>' +
            '<td><span class="id-code">' + u.id + '</span></td>' +
            '<td><strong>' + escapeHtml(u.username) + '</strong></td>' +
            '<td>' + escapeHtml(u.email) + '</td>' +
            '<td><span class="badge ' + badgeClass + '">' + escapeHtml(u.role) + '</span></td>' +
            '<td>' + (u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A') + '</td>' +
          '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      } 
      else if (activeTab === 'todos') {
        const list = currentData.todos.filter(t => 
          !term || t.title.toLowerCase().includes(term) || (t.description || '').toLowerCase().includes(term) || (t.createdBy || '').toLowerCase().includes(term)
        );
        if (list.length === 0) {
          container.innerHTML = '<div class="empty-state">No todos match your search.</div>';
          return;
        }
        let html = '<table><thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Created By</th><th>User ID</th><th>Created At</th></tr></thead><tbody>';
        list.forEach(t => {
          html += '<tr>' +
            '<td><span class="id-code">' + t.id + '</span></td>' +
            '<td><strong>' + escapeHtml(t.title) + '</strong></td>' +
            '<td>' + escapeHtml(t.description || '') + '</td>' +
            '<td>' + escapeHtml(t.createdBy || '') + '</td>' +
            '<td>' + (t.userId ? '<span class="id-code">' + t.userId + '</span>' : 'N/A') + '</td>' +
            '<td>' + (t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A') + '</td>' +
          '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      }
      else if (activeTab === 'sessions') {
        const list = currentData.sessionLogs.filter(s => 
          !term || s.username.toLowerCase().includes(term) || s.role.toLowerCase().includes(term)
        );
        if (list.length === 0) {
          container.innerHTML = '<div class="empty-state">No session logs match your search.</div>';
          return;
        }
        let html = '<table><thead><tr><th>Session ID</th><th>Username</th><th>Role</th><th>Login Time</th><th>Logout Time</th><th>Duration</th></tr></thead><tbody>';
        list.forEach(s => {
          const badgeClass = s.role === 'admin' ? 'badge-admin' : 'badge-user';
          const isOngoing = s.logoutTime === 'Session in progress';
          const statusClass = isOngoing ? 'badge-in-progress' : 'badge-completed';
          html += '<tr>' +
            '<td><span class="id-code">' + s.id + '</span></td>' +
            '<td><strong>' + escapeHtml(s.username) + '</strong></td>' +
            '<td><span class="badge ' + badgeClass + '">' + escapeHtml(s.role) + '</span></td>' +
            '<td>' + (s.loginTime ? new Date(s.loginTime).toLocaleString() : 'N/A') + '</td>' +
            '<td>' + (isOngoing ? '<span class="badge ' + statusClass + '">In Progress</span>' : new Date(s.logoutTime).toLocaleString()) + '</td>' +
            '<td>' + (isOngoing ? '<span class="badge ' + statusClass + '">Ongoing</span>' : escapeHtml(s.sessionDuration)) + '</td>' +
          '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      }
      else if (activeTab === 'activities') {
        const list = currentData.activityLogs.filter(a => 
          !term || a.username.toLowerCase().includes(term) || a.action.toLowerCase().includes(term) || (a.details || '').toLowerCase().includes(term) || (a.endpoint || '').toLowerCase().includes(term)
        );
        if (list.length === 0) {
          container.innerHTML = '<div class="empty-state">No activity logs match your search.</div>';
          return;
        }
        let html = '<table><thead><tr><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Endpoint</th><th>Status</th><th>Details</th></tr></thead><tbody>';
        list.forEach(a => {
          const method = a.method || 'GET';
          html += '<tr>' +
            '<td>' + (a.createdAt ? new Date(a.createdAt).toLocaleString() : 'N/A') + '</td>' +
            '<td><strong>' + escapeHtml(a.username) + '</strong></td>' +
            '<td><span class="badge ' + (a.role === 'admin' ? 'badge-admin' : 'badge-user') + '">' + escapeHtml(a.role) + '</span></td>' +
            '<td><strong>' + escapeHtml(a.action) + '</strong></td>' +
            '<td><span class="method-tag method-' + method + '">' + method + '</span> ' + escapeHtml(a.endpoint) + '</td>' +
            '<td><span class="badge ' + (a.status === 'SUCCESS' ? 'badge-completed' : 'badge-in-progress') + '">' + escapeHtml(a.status) + '</span></td>' +
            '<td>' + escapeHtml(a.details || '') + '</td>' +
          '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      }
      else if (activeTab === 'roles') {
        const list = currentData.rolesAccess.filter(r => 
          !term || r.username.toLowerCase().includes(term) || r.role.toLowerCase().includes(term)
        );
        if (list.length === 0) {
          container.innerHTML = '<div class="empty-state">No role permissions match your search.</div>';
          return;
        }
        let html = '<table><thead><tr><th>Username</th><th>Role</th><th>Allowed Activities (can_perform)</th></tr></thead><tbody>';
        list.forEach(r => {
          html += '<tr>' +
            '<td><strong>' + escapeHtml(r.username) + '</strong></td>' +
            '<td><span class="badge ' + (r.role === 'admin' ? 'badge-admin' : 'badge-user') + '">' + escapeHtml(r.role) + '</span></td>' +
            '<td><div class="pre-text">' + escapeHtml(r.can_perform) + '</div></td>' +
          '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Initial Load
    loadAllData();
  </script>
</body>
</html>`;
  }
}
