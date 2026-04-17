import { layout } from './layout';
import { isAdmin } from '../lib/auth';
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
    draft: 'background: rgba(255,248,240,0.1); color: rgba(255,248,240,0.7);',
    scheduled: 'background: rgba(37,99,235,0.2); color: #93b5f5;',
    published: 'background: rgba(45,106,45,0.2); color: #6aba6a;',
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
    <nav class="nav" aria-label="Admin navigation">
      <a href="/admin" class="nav-brand">Sunday Sauce <span style="font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 2px; background: rgba(255,248,240,0.1); color: var(--cream); padding: 3px 10px; border-radius: 20px; margin-left: 10px; vertical-align: middle;">ADMIN</span></a>
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
      <h2 style="font-size: 18px; margin-bottom: 20px;">Quick Actions</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <a href="/admin/posts/new" class="btn btn-primary" style="text-align: center; font-size: 15px; padding: 16px 28px;">&#9998; Write New Post</a>
        <a href="/admin/posts" class="btn btn-primary" style="text-align: center;">All Posts</a>
        <a href="/admin/members" class="btn btn-primary" style="text-align: center;">Members</a>
        <a href="/admin/requests" class="btn btn-primary" style="text-align: center;">Pending Requests${stats.pendingRequests > 0 ? ` (${stats.pendingRequests})` : ''}</a>
        <a href="/admin/analytics" class="btn btn-primary" style="text-align: center;">Analytics</a>
        <a href="/admin/appearance" class="btn btn-primary" style="text-align: center;">&#127912; Appearance</a>
      </div>
    </div>
  `;
  return layout('Admin Dashboard', content);
}

export function adminMembersPage(members: Member[], adminEmail: string): string {
  const rows = members
    .map(
      (m) => `
    <tr>
      <td>${escapeHtml(m.name)}${isAdmin(m.email, adminEmail) ? ' <span style="display: inline-block; font-size: 11px; padding: 2px 8px; background: rgba(192,57,43,0.25); color: #E8A87C; border-radius: 4px; margin-left: 8px; vertical-align: middle; letter-spacing: 0.3px;">Admin</span>' : ''}</td>
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
      <h2 style="font-size: 16px; margin-bottom: 16px;">Add Member Directly</h2>
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

    <div style="margin-bottom: 16px;">
      <input type="text" id="memberSearch" placeholder="Search members..." aria-label="Search members"
        style="width: 100%; padding: 10px 14px; border: 1px solid rgba(255,248,240,0.15); border-radius: 8px; font-size: 15px; font-family: 'DM Sans', sans-serif; background: rgba(255,248,240,0.08); color: #FFF8F0; outline: none;">
    </div>

    <div class="card">
      ${
        members.length === 0
          ? '<p style="color: rgba(255,248,240,0.6); text-align: center; padding: 20px 0;">No active members yet.</p>'
          : `
        <div class="table-wrapper"><table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table></div>
      `
      }
    </div>

    <script>
      document.getElementById('memberSearch').addEventListener('input', function(e) {
        var query = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(function(row) {
          var text = row.textContent.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    </script>

    <p style="margin-top: 16px;"><a href="/admin" style="font-size: 14px; color: rgba(255,248,240,0.65);">&larr; Back to dashboard</a></p>
  `;
  return layout('Members', content);
}

export function adminRequestsPage(requests: Member[], referrerNames?: Record<number, string>): string {
  const refNames = referrerNames || {};
  const requestCards = requests
    .map(
      (r) => `
    <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <div>
        <strong>${escapeHtml(r.name)}</strong>
        <br><span style="color: rgba(255,248,240,0.7); font-size: 14px;">${escapeHtml(r.email)}</span>
        ${r.referred_by && refNames[r.referred_by] ? `<br><span style="color: rgba(114,47,55,0.9); font-size: 13px; background: rgba(114,47,55,0.15); padding: 2px 8px; border-radius: 4px;">Referred by ${escapeHtml(refNames[r.referred_by])}</span>` : ''}
        <br><span style="color: rgba(255,248,240,0.6); font-size: 13px;">Requested ${formatDate(r.created_at)}</span>
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
        ? '<div class="card"><p style="color: rgba(255,248,240,0.6); text-align: center; padding: 20px 0;">No pending requests.</p></div>'
        : requestCards
    }
    <p style="margin-top: 16px;"><a href="/admin" style="font-size: 14px; color: rgba(255,248,240,0.65);">&larr; Back to dashboard</a></p>
  `;
  return layout('Pending Requests', content);
}

export function adminPostsPage(posts: (Post & { view_count?: number; unique_readers?: number })[], filter?: string): string {
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
    return `display: inline-block; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: ${active ? '600' : '400'}; text-decoration: none; color: ${active ? 'var(--cream)' : 'rgba(255,248,240,0.5)'}; background: ${active ? 'rgba(255,248,240,0.12)' : 'transparent'}; `;
  };

  const rows = filteredPosts
    .map(
      (p) => `
    <tr>
      <td><a href="/admin/posts/${p.id}/edit" style="font-weight: 500;">${escapeHtml(p.title)}</a></td>
      <td>${statusBadge(p.status)}${p.emailed ? ' <span title="Emailed to subscribers" style="font-size: 12px; opacity: 0.5;">\u2709</span>' : ''}</td>
      <td style="font-size: 13px; color: rgba(255,248,240,0.6);">${getWordCount(p.content)} words</td>
      <td style="font-size: 13px; color: rgba(255,248,240,0.6); text-align: center;">${p.view_count || 0} <span style="opacity: 0.5;">/ ${p.unique_readers || 0}</span></td>
      <td style="font-size: 13px; color: rgba(255,248,240,0.6);">${formatDate(p.status === 'published' ? (p.published_at || p.updated_at) : p.updated_at)}</td>
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

    <div style="display: flex; gap: 4px; margin-bottom: 24px; background: rgba(255,248,240,0.05); padding: 4px; border-radius: 10px;">
      <a href="/admin/posts" style="${tabStyle('all')}">All (${filterCounts.all})</a>
      <a href="/admin/posts?filter=published" style="${tabStyle('published')}">Published (${filterCounts.published})</a>
      <a href="/admin/posts?filter=draft" style="${tabStyle('draft')}">Drafts (${filterCounts.draft})</a>
      <a href="/admin/posts?filter=scheduled" style="${tabStyle('scheduled')}">Scheduled (${filterCounts.scheduled})</a>
    </div>

    <div style="margin-bottom: 16px;">
      <input type="text" id="postSearch" placeholder="Search posts..." aria-label="Search posts"
        style="width: 100%; padding: 10px 14px; border: 1px solid rgba(255,248,240,0.15); border-radius: 8px; font-size: 15px; font-family: 'DM Sans', sans-serif; background: rgba(255,248,240,0.08); color: #FFF8F0; outline: none;">
    </div>

    <div class="card">
      ${
        filteredPosts.length === 0
          ? '<p style="color: rgba(255,248,240,0.6); text-align: center; padding: 20px 0;">No posts here. Create your first post!</p>'
          : `
        <div class="table-wrapper"><table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Words</th>
              <th style="text-align: center;">Views / Readers</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table></div>
      `
      }
    </div>

    <script>
      document.getElementById('postSearch').addEventListener('input', function(e) {
        var query = e.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(function(row) {
          var text = row.textContent.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    </script>

    <p style="margin-top: 16px;"><a href="/admin" style="font-size: 14px; color: rgba(255,248,240,0.65);">&larr; Back to dashboard</a></p>
  `;
  return layout('All Posts', content);
}

export function adminAnalyticsPage(
  postViews: { title: string; slug: string; total_views: number; unique_readers: number; published_at: string | null }[],
  recentReaders: { name: string; title: string; slug: string; viewed_at: string }[],
  totalViews: number,
  totalUniqueReaders: number,
): string {
  const postRows = postViews.map(p => `
    <tr>
      <td><a href="/feed/${escapeHtml(p.slug)}" style="font-weight: 500;">${escapeHtml(p.title)}</a></td>
      <td style="text-align: center;">${p.total_views}</td>
      <td style="text-align: center;">${p.unique_readers}</td>
      <td style="font-size: 13px; color: rgba(255,248,240,0.6);">${p.published_at ? formatDate(p.published_at) : '—'}</td>
    </tr>
  `).join('');

  const readerRows = recentReaders.map(r => `
    <tr>
      <td>${escapeHtml(r.name)}</td>
      <td><a href="/feed/${escapeHtml(r.slug)}">${escapeHtml(r.title)}</a></td>
      <td style="font-size: 13px; color: rgba(255,248,240,0.6);">${formatDate(r.viewed_at)}</td>
    </tr>
  `).join('');

  const content = `
    ${adminNav()}
    <h1 style="font-size: 28px; margin-bottom: 32px;">Analytics</h1>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${totalViews}</div>
        <div class="stat-label">Total Views</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${totalUniqueReaders}</div>
        <div class="stat-label">Unique Readers</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${postViews.length}</div>
        <div class="stat-label">Posts Viewed</div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 32px;">
      <h2 style="font-size: 18px; margin-bottom: 16px;">Views by Post</h2>
      ${postViews.length === 0
        ? '<p style="color: rgba(255,248,240,0.6); text-align: center; padding: 20px 0;">No views yet.</p>'
        : `
        <div class="table-wrapper"><table>
          <thead>
            <tr>
              <th>Post</th>
              <th style="text-align: center;">Views</th>
              <th style="text-align: center;">Readers</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>${postRows}</tbody>
        </table></div>
      `}
    </div>

    <div class="card">
      <h2 style="font-size: 18px; margin-bottom: 16px;">Recent Activity</h2>
      ${recentReaders.length === 0
        ? '<p style="color: rgba(255,248,240,0.6); text-align: center; padding: 20px 0;">No activity yet.</p>'
        : `
        <div class="table-wrapper"><table>
          <thead>
            <tr>
              <th>Reader</th>
              <th>Post</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>${readerRows}</tbody>
        </table></div>
      `}
    </div>

    <p style="margin-top: 16px;"><a href="/admin" style="font-size: 14px; color: rgba(255,248,240,0.65);">&larr; Back to dashboard</a></p>
  `;
  return layout('Analytics', content);
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
      <p style="color: rgba(255,248,240,0.6); margin-bottom: 24px;">${message}</p>
      <a href="${backLink}" class="btn btn-primary">${backLabel}</a>
    </div>
  `;
  return layout(title, content);
}
