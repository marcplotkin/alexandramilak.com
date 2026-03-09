import { layout } from './layout';
import type { Post, Member } from '../index';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getWordCount(content: string): number {
  const text = content.replace(/<[^>]*>/g, '').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function statusBadge(status: string): string {
  const styles: Record<string, string> = {
    draft: 'background: #f5f0e8; color: var(--text-muted);',
    scheduled: 'background: #e8f0fa; color: #2563eb;',
    published: 'background: #f0faf0; color: #2d6a2d;',
  };
  const labels: Record<string, string> = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    published: 'Published',
  };
  return `<span style="display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; ${styles[status] || styles.draft}">${labels[status] || status}</span>`;
}

function adminNav(): string {
  return `
    <nav class="nav">
      <a href="/admin" class="nav-brand">Sunday Sauce <span style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; background: var(--burgundy); color: var(--cream); padding: 2px 8px; border-radius: 4px; margin-left: 8px; vertical-align: middle;">ADMIN</span></a>
      <div class="nav-links">
        <a href="/feed">Feed</a>
        <a href="/auth/logout">Log Out</a>
      </div>
    </nav>
  `;
}

export function adminDashboard(stats: {
  totalMembers: number;
  pendingRequests: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
}): string {
  const content = `
    ${adminNav()}
    <h1 style="font-size: 28px; margin-bottom: 32px;">Dashboard</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${stats.totalMembers}</div>
        <div class="stat-label">Active Members</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.publishedPosts}</div>
        <div class="stat-label">Published</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.draftPosts}</div>
        <div class="stat-label">Drafts</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.scheduledPosts}</div>
        <div class="stat-label">Scheduled</div>
      </div>
    </div>

    <div class="card">
      <h3 style="font-size: 18px; margin-bottom: 20px;">Quick Actions</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <a href="/admin/posts/new" class="btn btn-primary" style="text-align: center; font-size: 15px; padding: 16px 28px;">&#9998; Write New Post</a>
        <a href="/admin/posts" class="btn btn-primary" style="text-align: center;">All Posts</a>
        <a href="/admin/members" class="btn btn-primary" style="text-align: center;">Members</a>
        <a href="/admin/requests" class="btn btn-primary" style="text-align: center;">Pending Requests${stats.pendingRequests > 0 ? ` (${stats.pendingRequests})` : ''}</a>
      </div>
    </div>
  `;
  return layout('Admin Dashboard', content);
}

export function adminMembersPage(members: Member[]): string {
  const rows = members
    .map(
      (m) => `
    <tr>
      <td>${escapeHtml(m.name)}</td>
      <td>${escapeHtml(m.email)}</td>
      <td>${formatDate(m.approved_at || m.created_at)}</td>
      <td>
        <form method="POST" action="/admin/members/${m.id}/remove" style="display: inline;" onsubmit="return confirm('Remove this member?')">
          <button type="submit" class="btn btn-danger btn-small">Remove</button>
        </form>
      </td>
    </tr>
  `
    )
    .join('');

  const content = `
    ${adminNav()}
    <h1 style="font-size: 28px; margin-bottom: 32px;">Members</h1>

    <div class="card" style="margin-bottom: 32px;">
      <h3 style="font-size: 16px; margin-bottom: 16px;">Add Member Directly</h3>
      <form method="POST" action="/admin/members/add" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end;">
        <div class="form-group" style="flex: 1; min-width: 150px; margin-bottom: 0;">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required placeholder="Full name">
        </div>
        <div class="form-group" style="flex: 1; min-width: 200px; margin-bottom: 0;">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required placeholder="email@example.com">
        </div>
        <button type="submit" class="btn btn-primary" style="margin-bottom: 0;">Add Member</button>
      </form>
    </div>

    <div class="card">
      ${
        members.length === 0
          ? '<p style="color: var(--text-muted); text-align: center; padding: 20px 0;">No active members yet.</p>'
          : `
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `
      }
    </div>

    <p style="margin-top: 16px;"><a href="/admin" style="font-size: 14px; color: var(--text-muted);">&larr; Back to dashboard</a></p>
  `;
  return layout('Members', content);
}

export function adminRequestsPage(requests: Member[]): string {
  const requestCards = requests
    .map(
      (r) => `
    <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <div>
        <strong>${escapeHtml(r.name)}</strong>
        <br><span style="color: var(--text-muted); font-size: 14px;">${escapeHtml(r.email)}</span>
        <br><span style="color: var(--text-muted); font-size: 13px;">Requested ${formatDate(r.created_at)}</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <form method="POST" action="/admin/requests/${r.id}/approve">
          <button type="submit" class="btn btn-primary btn-small">Approve</button>
        </form>
        <form method="POST" action="/admin/requests/${r.id}/deny">
          <button type="submit" class="btn btn-danger btn-small">Deny</button>
        </form>
      </div>
    </div>
  `
    )
    .join('');

  const content = `
    ${adminNav()}
    <h1 style="font-size: 28px; margin-bottom: 32px;">Pending Requests</h1>
    ${
      requests.length === 0
        ? '<div class="card"><p style="color: var(--text-muted); text-align: center; padding: 20px 0;">No pending requests.</p></div>'
        : requestCards
    }
    <p style="margin-top: 16px;"><a href="/admin" style="font-size: 14px; color: var(--text-muted);">&larr; Back to dashboard</a></p>
  `;
  return layout('Pending Requests', content);
}

export function adminPostsPage(posts: Post[], filter?: string): string {
  const currentFilter = filter || 'all';

  const filterCounts = {
    all: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
  };

  const filteredPosts = currentFilter === 'all'
    ? posts
    : posts.filter(p => p.status === currentFilter);

  const tabStyle = (tab: string) => {
    const active = tab === currentFilter;
    return `display: inline-block; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: ${active ? '600' : '400'}; text-decoration: none; color: ${active ? 'var(--burgundy)' : 'var(--text-muted)'}; background: ${active ? 'white' : 'transparent'}; ${active ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.06);' : ''}`;
  };

  const rows = filteredPosts
    .map(
      (p) => `
    <tr>
      <td><a href="/admin/posts/${p.id}/edit" style="font-weight: 500;">${escapeHtml(p.title)}</a></td>
      <td>${statusBadge(p.status)}</td>
      <td style="font-size: 13px; color: var(--text-muted);">${getWordCount(p.content)} words</td>
      <td style="font-size: 13px; color: var(--text-muted);">${formatDate(p.status === 'published' ? (p.published_at || p.updated_at) : p.updated_at)}</td>
      <td>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <a href="/admin/posts/${p.id}/edit" style="font-size: 13px;">Edit</a>
          <form method="POST" action="/admin/posts/${p.id}/delete" style="display: inline;" onsubmit="return confirm('Delete this post?')">
            <button type="submit" style="background: none; border: none; color: var(--tomato-red); cursor: pointer; font-size: 13px; font-family: Inter, sans-serif;">Delete</button>
          </form>
        </div>
      </td>
    </tr>
  `
    )
    .join('');

  const content = `
    ${adminNav()}
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h1 style="font-size: 28px;">All Posts</h1>
      <a href="/admin/posts/new" class="btn btn-primary">New Post</a>
    </div>

    <div style="display: flex; gap: 4px; margin-bottom: 24px; background: var(--cream); padding: 4px; border-radius: 10px;">
      <a href="/admin/posts" style="${tabStyle('all')}">All (${filterCounts.all})</a>
      <a href="/admin/posts?filter=published" style="${tabStyle('published')}">Published (${filterCounts.published})</a>
      <a href="/admin/posts?filter=draft" style="${tabStyle('draft')}">Drafts (${filterCounts.draft})</a>
      <a href="/admin/posts?filter=scheduled" style="${tabStyle('scheduled')}">Scheduled (${filterCounts.scheduled})</a>
    </div>

    <div class="card">
      ${
        filteredPosts.length === 0
          ? '<p style="color: var(--text-muted); text-align: center; padding: 20px 0;">No posts here. Create your first post!</p>'
          : `
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Words</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `
      }
    </div>

    <p style="margin-top: 16px;"><a href="/admin" style="font-size: 14px; color: var(--text-muted);">&larr; Back to dashboard</a></p>
  `;
  return layout('All Posts', content);
}

export function adminActionResultPage(
  title: string,
  message: string,
  backLink: string,
  backLabel: string
): string {
  const content = `
    ${adminNav()}
    <div class="card" style="text-align: center; padding: 48px 32px;">
      <h2 style="font-size: 22px; margin-bottom: 12px;">${title}</h2>
      <p style="color: var(--text-muted); margin-bottom: 24px;">${message}</p>
      <a href="${backLink}" class="btn btn-primary">${backLabel}</a>
    </div>
  `;
  return layout(title, content);
}
