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
        <div class="stat-number">${stats.pendingRequests}</div>
        <div class="stat-label">Pending Requests</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.publishedPosts}</div>
        <div class="stat-label">Published Posts</div>
      </div>
    </div>

    <div class="card">
      <h3 style="font-size: 18px; margin-bottom: 20px;">Quick Links</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <a href="/admin/members" class="btn btn-primary" style="text-align: center;">Manage Members</a>
        <a href="/admin/requests" class="btn btn-primary" style="text-align: center;">Pending Requests${stats.pendingRequests > 0 ? ` (${stats.pendingRequests})` : ''}</a>
        <a href="/admin/posts/new" class="btn btn-primary" style="text-align: center;">Create Post</a>
        <a href="/admin/posts" class="btn btn-primary" style="text-align: center;">All Posts</a>
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

export function adminPostsPage(posts: Post[]): string {
  const rows = posts
    .map(
      (p) => `
    <tr>
      <td><a href="/admin/posts/${p.id}/edit" style="font-weight: 500;">${escapeHtml(p.title)}</a></td>
      <td>
        <span style="display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; ${
          p.published
            ? 'background: #f0faf0; color: #2d6a2d;'
            : 'background: #f5f0e8; color: var(--text-muted);'
        }">${p.published ? 'Published' : 'Draft'}</span>
      </td>
      <td style="font-size: 13px; color: var(--text-muted);">${formatDate(p.updated_at)}</td>
      <td><a href="/admin/posts/${p.id}/edit" style="font-size: 13px;">Edit</a></td>
    </tr>
  `
    )
    .join('');

  const content = `
    ${adminNav()}
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px;">All Posts</h1>
      <a href="/admin/posts/new" class="btn btn-primary">Create New Post</a>
    </div>

    <div class="card">
      ${
        posts.length === 0
          ? '<p style="color: var(--text-muted); text-align: center; padding: 20px 0;">No posts yet. Create your first post!</p>'
          : `
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
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

export function adminPostFormPage(post?: Post): string {
  const isEdit = !!post;
  const title = isEdit ? 'Edit Post' : 'Create Post';

  const content = `
    ${adminNav()}
    <h1 style="font-size: 28px; margin-bottom: 32px;">${title}</h1>

    <form method="POST" action="${isEdit ? `/admin/posts/${post!.id}` : '/admin/posts'}" class="card">
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" name="title" required value="${isEdit ? escapeHtml(post!.title) : ''}" placeholder="Your post title">
      </div>

      <div class="form-group">
        <label for="excerpt">Excerpt <span style="color: var(--text-muted); font-weight: 400;">(optional, shown in feed)</span></label>
        <input type="text" id="excerpt" name="excerpt" value="${isEdit && post!.excerpt ? escapeHtml(post!.excerpt) : ''}" placeholder="A brief summary of your post">
      </div>

      <div class="form-group">
        <label for="content">Content <span style="color: var(--text-muted); font-weight: 400;">(HTML)</span></label>
        <textarea id="content" name="content" required placeholder="Write your post content here... HTML is supported.">${isEdit ? escapeHtml(post!.content) : ''}</textarea>
      </div>

      <div class="checkbox-group">
        <input type="checkbox" id="published" name="published" value="1" ${isEdit && post!.published ? 'checked' : ''}>
        <label for="published">Published</label>
      </div>

      <div class="checkbox-group">
        <input type="checkbox" id="email_members" name="email_members" value="1">
        <label for="email_members">Email all members about this post</label>
      </div>

      <div style="display: flex; gap: 12px; align-items: center;">
        <button type="submit" class="btn btn-primary">Save Post</button>
        <a href="/admin/posts" style="color: var(--text-muted); font-size: 14px;">Cancel</a>
        ${
          isEdit
            ? `
          <form method="POST" action="/admin/posts/${post!.id}/delete" style="margin-left: auto;" onsubmit="return confirm('Delete this post permanently?')">
            <button type="submit" class="btn btn-danger">Delete</button>
          </form>
        `
            : ''
        }
      </div>
    </form>

    <p style="margin-top: 16px;"><a href="/admin/posts" style="font-size: 14px; color: var(--text-muted);">&larr; Back to all posts</a></p>
  `;
  return layout(title, content);
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
