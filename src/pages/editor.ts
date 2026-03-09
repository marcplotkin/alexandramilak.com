import type { Post } from '../index';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function editorPage(post: Post | null, isNew: boolean): string {
  const postId = post?.id || 0;
  const postTitle = post?.title || '';
  const postContent = post?.content || '';
  const postExcerpt = post?.excerpt || '';
  const postSlug = post?.slug || '';
  const postStatus = post?.status || 'draft';
  const postCoverImage = post?.cover_image_url || '';
  const postScheduledAt = post?.scheduled_at || '';
  const postEmailSubs = isNew ? true : (post?.email_subscribers ? true : false);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isNew ? 'New Post' : escapeHtml(postTitle) || 'Edit Post'} — Sunday Sauce</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --burgundy: #2D0A10;
      --burgundy-dark: #1A0609;
      --burgundy-light: #4A1520;
      --cream: #FFF8F0;
      --warm-white: #FFFAF5;
      --tomato-red: #C0392B;
      --gold: #D4A853;
      --text-dark: #FFF8F0;
      --text-muted: rgba(255,248,240,0.5);
      --border: rgba(255,248,240,0.12);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(180deg, #2D0A10 0%, #1A0609 100%);
      background-attachment: fixed;
      color: var(--cream);
      line-height: 1.6;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      letter-spacing: 0.1px;
    }

    /* ---- TOP BAR ---- */
    .editor-topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(45, 10, 16, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .topbar-left a {
      font-size: 14px;
      color: var(--text-muted);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.15s;
    }
    .topbar-left a:hover { color: var(--cream); }

    .topbar-center {
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .save-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #c3e6c3;
      transition: background 0.3s;
    }
    .save-dot.saving { background: var(--gold); }
    .save-dot.unsaved { background: var(--tomato-red); }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .btn:hover { opacity: 0.9; }
    .btn-ghost {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .btn-ghost:hover { border-color: var(--text-muted); color: var(--text-dark); }
    .btn-primary {
      background: var(--cream);
      color: var(--burgundy);
    }
    .btn-danger {
      background: var(--tomato-red);
      color: white;
    }
    .btn-success {
      background: #2d6a2d;
      color: white;
    }
    .btn-blue {
      background: #2563eb;
      color: white;
    }

    /* ---- WRITING AREA ---- */
    .editor-wrapper {
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 24px 200px;
    }

    .cover-image-preview {
      margin-bottom: 32px;
      border-radius: 12px;
      overflow: hidden;
      display: none;
    }
    .cover-image-preview img {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
    }

    .title-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 36px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--text-dark);
      resize: none;
      overflow: hidden;
      min-height: 48px;
    }
    .title-input::placeholder { color: rgba(255,248,240,0.3); }

    .subtitle-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-family: 'DM Sans', sans-serif;
      font-size: 18px;
      font-weight: 400;
      line-height: 1.5;
      color: var(--text-muted);
      resize: none;
      overflow: hidden;
      margin-top: 12px;
      min-height: 28px;
    }
    .subtitle-input::placeholder { color: rgba(255,248,240,0.25); }

    .editor-divider {
      height: 1px;
      background: var(--border);
      margin: 24px 0 32px;
    }

    /* ---- CONTENT EDITABLE ---- */
    .editor-content {
      min-height: 400px;
      outline: none;
      font-size: 18px;
      line-height: 1.8;
      color: var(--text-dark);
      font-family: 'DM Sans', -apple-system, sans-serif;
    }
    .editor-content:empty::before {
      content: 'Start writing...';
      color: rgba(255,248,240,0.25);
      pointer-events: none;
    }
    .editor-content p { margin-bottom: 16px; }
    .editor-content h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      margin: 40px 0 16px;
      line-height: 1.3;
    }
    .editor-content h3 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 22px;
      font-weight: 700;
      margin: 32px 0 12px;
      line-height: 1.3;
    }
    .editor-content blockquote {
      border-left: 3px solid rgba(255,248,240,0.3);
      padding-left: 20px;
      margin: 24px 0;
      color: var(--text-muted);
      font-style: italic;
    }
    .editor-content .pull-quote {
      border-left: none;
      text-align: center;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 24px;
      font-style: italic;
      color: rgba(255,248,240,0.7);
      padding: 24px 40px;
      margin: 32px 0;
    }
    .editor-content ul, .editor-content ol {
      margin: 16px 0;
      padding-left: 24px;
    }
    .editor-content li { margin-bottom: 8px; }
    .editor-content code {
      background: rgba(255,248,240,0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: 'SF Mono', 'Consolas', monospace;
    }
    .editor-content pre {
      background: rgba(0,0,0,0.3);
      color: rgba(255,248,240,0.85);
      padding: 20px 24px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 24px 0;
      font-size: 14px;
      line-height: 1.6;
    }
    .editor-content pre code {
      background: none;
      padding: 0;
      color: inherit;
    }
    .editor-content img {
      max-width: 100%;
      border-radius: 8px;
      margin: 24px 0;
    }
    .editor-content hr {
      border: none;
      height: 1px;
      background: var(--border);
      margin: 40px 0;
    }
    .editor-content a {
      color: rgba(255,248,240,0.7);
      text-decoration: underline;
      text-decoration-color: rgba(255,248,240,0.3);
    }
    .editor-content s {
      text-decoration: line-through;
    }

    /* ---- FLOATING TOOLBAR ---- */
    .floating-toolbar {
      position: absolute;
      display: none;
      background: #2C1810;
      border-radius: 8px;
      padding: 4px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      z-index: 200;
      transform: translateX(-50%);
      animation: toolbar-in 0.15s ease;
    }
    @keyframes toolbar-in {
      from { opacity: 0; transform: translateX(-50%) translateY(4px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .floating-toolbar::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 6px;
      clip-path: polygon(0 0, 100% 0, 50% 100%);
      background: #2C1810;
    }
    .toolbar-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #e8e0d8;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      transition: all 0.1s;
    }
    .toolbar-btn:hover { background: rgba(255,255,255,0.15); color: white; }
    .toolbar-btn.active { background: rgba(255,255,255,0.2); color: white; }
    .toolbar-divider {
      display: inline-block;
      width: 1px;
      height: 20px;
      background: rgba(255,255,255,0.15);
      margin: 0 2px;
      vertical-align: middle;
    }

    /* ---- PLUS MENU ---- */
    .plus-button {
      position: absolute;
      left: -44px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1.5px solid var(--border);
      background: rgba(255,248,240,0.08);
      color: var(--text-muted);
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.15s;
      z-index: 50;
    }
    .plus-button:hover {
      border-color: rgba(255,248,240,0.4);
      color: var(--cream);
      transform: rotate(90deg);
    }
    .plus-menu {
      position: absolute;
      left: -4px;
      background: #3D1A22;
      border: 1px solid rgba(255,248,240,0.12);
      border-radius: 10px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
      padding: 8px;
      display: none;
      z-index: 201;
      min-width: 180px;
      animation: menu-in 0.12s ease;
    }
    @keyframes menu-in {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .plus-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      color: var(--cream);
      border: none;
      background: none;
      width: 100%;
      font-family: 'DM Sans', sans-serif;
      transition: background 0.1s;
    }
    .plus-menu-item:hover { background: rgba(255,248,240,0.1); }
    .plus-menu-icon { font-size: 16px; width: 22px; text-align: center; }

    /* ---- SIDE PANEL ---- */
    .settings-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 300;
      display: none;
      animation: fade-in 0.15s ease;
    }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

    .settings-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 380px;
      max-width: 90vw;
      height: 100vh;
      background: #3D1A22;
      z-index: 301;
      display: none;
      box-shadow: -4px 0 24px rgba(0,0,0,0.3);
      overflow-y: auto;
      animation: slide-in 0.2s ease;
    }
    @keyframes slide-in {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .settings-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      background: #3D1A22;
    }
    .settings-header h3 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 18px;
      color: var(--cream);
    }
    .settings-close {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 18px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .settings-close:hover { background: rgba(255,248,240,0.1); }
    .settings-body { padding: 24px; }
    .settings-group { margin-bottom: 24px; }
    .settings-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--text-dark);
    }
    .settings-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid rgba(255,248,240,0.15);
      border-radius: 8px;
      font-size: 14px;
      font-family: 'DM Sans', sans-serif;
      background: rgba(255,248,240,0.06);
      color: var(--cream);
    }
    .settings-input:focus {
      outline: none;
      border-color: rgba(255,248,240,0.35);
      box-shadow: 0 0 0 3px rgba(255,248,240,0.05);
    }
    .settings-hint {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .toggle-label { font-size: 14px; }
    .toggle {
      position: relative;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background: rgba(255,248,240,0.15);
      border-radius: 24px;
      transition: 0.2s;
    }
    .toggle-slider::before {
      content: '';
      position: absolute;
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: var(--cream);
      border-radius: 50%;
      transition: 0.2s;
    }
    .toggle input:checked + .toggle-slider { background: #2d6a2d; }
    .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

    .disabled-field {
      opacity: 0.5;
      pointer-events: none;
    }

    /* ---- WORD COUNT ---- */
    .word-count {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }

    @media (max-width: 800px) {
      .editor-wrapper { padding: 32px 20px 200px; }
      .plus-button { left: -36px; width: 28px; height: 28px; font-size: 16px; }
      .title-input { font-size: 28px; }
    }
  </style>
</head>
<body>
  <!-- TOP BAR -->
  <div class="editor-topbar">
    <div class="topbar-left">
      <a href="/admin/posts">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Posts
      </a>
    </div>
    <div class="topbar-center">
      <span class="save-dot" id="saveDot"></span>
      <span id="saveStatus">Saved</span>
    </div>
    <div class="topbar-right">
      <button class="btn btn-ghost" id="settingsBtn" type="button">Settings</button>
      ${postStatus === 'published' ? `
        <button class="btn btn-ghost" id="saveBtn" type="button">Save</button>
        <button class="btn btn-danger" id="unpublishBtn" type="button">Unpublish</button>
      ` : postStatus === 'scheduled' ? `
        <button class="btn btn-ghost" id="saveBtn" type="button">Save</button>
        <button class="btn btn-primary" id="publishNowBtn" type="button">Publish Now</button>
      ` : `
        <button class="btn btn-ghost" id="saveBtn" type="button">Save Draft</button>
        <button class="btn btn-primary" id="publishBtn" type="button">Publish</button>
      `}
    </div>
  </div>

  <!-- SETTINGS PANEL -->
  <div class="settings-overlay" id="settingsOverlay"></div>
  <div class="settings-panel" id="settingsPanel">
    <div class="settings-header">
      <h3>Post Settings</h3>
      <button class="settings-close" id="settingsClose" type="button">&times;</button>
    </div>
    <div class="settings-body">
      <div class="settings-group">
        <label class="settings-label">Cover Image URL</label>
        <input type="text" class="settings-input" id="coverImageInput" placeholder="https://example.com/image.jpg" value="${escapeAttr(postCoverImage)}">
        <div class="settings-hint">Paste a direct link to an image</div>
      </div>

      <div class="settings-group">
        <label class="settings-label">Excerpt / Subtitle</label>
        <textarea class="settings-input" id="excerptSettingsInput" rows="3" placeholder="Brief summary shown in feed...">${escapeHtml(postExcerpt)}</textarea>
      </div>

      <div class="settings-group">
        <label class="settings-label">Slug</label>
        <input type="text" class="settings-input" id="slugInput" placeholder="your-post-slug" value="${escapeAttr(postSlug)}">
        <div class="settings-hint">Auto-generated from title. Edit to customize.</div>
      </div>

      <div class="settings-group">
        <label class="settings-label">Schedule</label>
        <input type="datetime-local" class="settings-input" id="scheduledAtInput" value="${postScheduledAt ? escapeAttr(postScheduledAt.replace(' ', 'T').substring(0, 16)) : ''}">
        <div class="settings-hint">Set a date/time to auto-publish</div>
        ${postStatus !== 'published' ? `<button class="btn btn-blue" id="scheduleBtn" type="button" style="margin-top: 8px; width: 100%; justify-content: center;">Schedule Post</button>` : ''}
      </div>

      <div class="settings-group">
        <div class="toggle-row">
          <span class="toggle-label">Email subscribers when published</span>
          <label class="toggle">
            <input type="checkbox" id="emailSubsToggle" ${postEmailSubs ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="settings-group disabled-field">
        <label class="settings-label">Tags</label>
        <input type="text" class="settings-input" placeholder="Coming soon..." disabled>
      </div>

      ${!isNew ? `
      <div class="settings-group" style="padding-top: 16px; border-top: 1px solid var(--border);">
        <button class="btn btn-danger" id="deleteBtn" type="button" style="width: 100%; justify-content: center;">Delete Post</button>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- EDITOR -->
  <div class="editor-wrapper">
    <div class="cover-image-preview" id="coverPreview">
      <img id="coverPreviewImg" src="" alt="Cover">
    </div>

    <textarea class="title-input" id="titleInput" placeholder="Give it a title..." rows="1">${escapeHtml(postTitle)}</textarea>
    <textarea class="subtitle-input" id="subtitleInput" placeholder="Add a subtitle..." rows="1">${escapeHtml(postExcerpt)}</textarea>

    <div class="editor-divider"></div>

    <!-- Plus button -->
    <div class="plus-button" id="plusButton">+</div>
    <div class="plus-menu" id="plusMenu">
      <button class="plus-menu-item" data-action="image" type="button">
        <span class="plus-menu-icon">&#128247;</span> Image
      </button>
      <button class="plus-menu-item" data-action="divider" type="button">
        <span class="plus-menu-icon">&mdash;</span> Divider
      </button>
      <button class="plus-menu-item" data-action="pullquote" type="button">
        <span class="plus-menu-icon">&#10077;</span> Pull Quote
      </button>
    </div>

    <!-- Floating toolbar -->
    <div class="floating-toolbar" id="floatingToolbar">
      <button class="toolbar-btn" data-cmd="bold" title="Bold (Cmd+B)" type="button"><strong>B</strong></button>
      <button class="toolbar-btn" data-cmd="italic" title="Italic (Cmd+I)" type="button"><em>I</em></button>
      <button class="toolbar-btn" data-cmd="strikethrough" title="Strikethrough" type="button"><s>S</s></button>
      <span class="toolbar-divider"></span>
      <button class="toolbar-btn" data-cmd="h2" title="Heading 2" type="button">H2</button>
      <button class="toolbar-btn" data-cmd="h3" title="Heading 3" type="button">H3</button>
      <span class="toolbar-divider"></span>
      <button class="toolbar-btn" data-cmd="blockquote" title="Quote" type="button">&#10077;</button>
      <button class="toolbar-btn" data-cmd="insertUnorderedList" title="Bullet List" type="button">&#8226;</button>
      <button class="toolbar-btn" data-cmd="insertOrderedList" title="Numbered List" type="button">1.</button>
      <span class="toolbar-divider"></span>
      <button class="toolbar-btn" data-cmd="link" title="Link (Cmd+K)" type="button">&#128279;</button>
      <button class="toolbar-btn" data-cmd="code" title="Inline Code" type="button">&lt;/&gt;</button>
      <button class="toolbar-btn" data-cmd="codeblock" title="Code Block" type="button">{ }</button>
    </div>

    <!-- Content area -->
    <div class="editor-content" id="editorContent" contenteditable="true">${postContent}</div>

    <div class="word-count" id="wordCount">0 words</div>
  </div>

  <script>
  (function() {
    // ---- STATE ----
    let postId = ${postId};
    const isNew = ${isNew};
    let currentStatus = '${postStatus}';
    let hasUnsavedChanges = false;
    let autoSaveTimer = null;
    let lastSavedContent = '';

    // ---- DOM REFS ----
    const titleInput = document.getElementById('titleInput');
    const subtitleInput = document.getElementById('subtitleInput');
    const editorContent = document.getElementById('editorContent');
    const floatingToolbar = document.getElementById('floatingToolbar');
    const plusButton = document.getElementById('plusButton');
    const plusMenu = document.getElementById('plusMenu');
    const saveDot = document.getElementById('saveDot');
    const saveStatus = document.getElementById('saveStatus');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const settingsOverlay = document.getElementById('settingsOverlay');
    const settingsClose = document.getElementById('settingsClose');
    const slugInput = document.getElementById('slugInput');
    const coverImageInput = document.getElementById('coverImageInput');
    const coverPreview = document.getElementById('coverPreview');
    const coverPreviewImg = document.getElementById('coverPreviewImg');
    const excerptSettingsInput = document.getElementById('excerptSettingsInput');
    const scheduledAtInput = document.getElementById('scheduledAtInput');
    const emailSubsToggle = document.getElementById('emailSubsToggle');
    const wordCountEl = document.getElementById('wordCount');

    // ---- AUTO-RESIZE TEXTAREAS ----
    function autoResize(el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
    titleInput.addEventListener('input', function() { autoResize(this); markDirty(); updateSlug(); });
    subtitleInput.addEventListener('input', function() { autoResize(this); markDirty(); syncExcerpt(); });
    // Init
    autoResize(titleInput);
    autoResize(subtitleInput);

    // Sync subtitle <-> excerpt settings
    function syncExcerpt() {
      excerptSettingsInput.value = subtitleInput.value;
    }
    excerptSettingsInput.addEventListener('input', function() {
      subtitleInput.value = this.value;
      autoResize(subtitleInput);
      markDirty();
    });

    // ---- SLUG GEN ----
    let slugManuallyEdited = ${postSlug ? 'true' : 'false'};
    slugInput.addEventListener('input', function() { slugManuallyEdited = true; markDirty(); });
    function updateSlug() {
      if (slugManuallyEdited && slugInput.value) return;
      const title = titleInput.value;
      slugInput.value = title
        .toLowerCase()
        .replace(/[^a-z0-9\\s-]/g, '')
        .replace(/\\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80);
    }

    // ---- COVER IMAGE PREVIEW ----
    function updateCoverPreview() {
      const url = coverImageInput.value.trim();
      if (url) {
        coverPreviewImg.src = url;
        coverPreview.style.display = 'block';
      } else {
        coverPreview.style.display = 'none';
      }
    }
    coverImageInput.addEventListener('input', function() { updateCoverPreview(); markDirty(); });
    updateCoverPreview();

    // ---- WORD COUNT ----
    function updateWordCount() {
      const text = editorContent.innerText || '';
      const words = text.trim().split(/\\s+/).filter(w => w.length > 0).length;
      wordCountEl.textContent = words + ' word' + (words !== 1 ? 's' : '');
    }
    updateWordCount();

    // ---- MARK DIRTY ----
    function markDirty() {
      hasUnsavedChanges = true;
      saveDot.className = 'save-dot unsaved';
      saveStatus.textContent = 'Unsaved changes';
      resetAutoSave();
    }

    editorContent.addEventListener('input', function() { markDirty(); updateWordCount(); });

    // ---- SAVE STATUS ----
    function showSaving() {
      saveDot.className = 'save-dot saving';
      saveStatus.textContent = 'Saving...';
    }
    function showSaved() {
      hasUnsavedChanges = false;
      saveDot.className = 'save-dot';
      saveStatus.textContent = 'Saved';
    }
    function showError(msg) {
      saveDot.className = 'save-dot unsaved';
      saveStatus.textContent = msg || 'Save failed';
    }

    // ---- AUTO-SAVE ----
    function resetAutoSave() {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(doAutoSave, 30000);
    }

    async function doAutoSave() {
      if (!hasUnsavedChanges) return;
      if (!titleInput.value.trim()) return; // Need at least a title
      await savePost(false);
    }

    // ---- SAVE POST ----
    async function savePost(showRedirect) {
      showSaving();

      const data = {
        title: titleInput.value.trim(),
        content: editorContent.innerHTML,
        excerpt: subtitleInput.value.trim() || excerptSettingsInput.value.trim() || null,
        slug: slugInput.value.trim(),
        cover_image_url: coverImageInput.value.trim() || null,
        email_subscribers: emailSubsToggle.checked ? 1 : 0,
        status: currentStatus,
        scheduled_at: scheduledAtInput.value ? scheduledAtInput.value.replace('T', ' ') + ':00' : null,
      };

      if (!data.title) {
        showError('Title required');
        return false;
      }

      try {
        let url, method;
        if (postId) {
          url = '/admin/posts/' + postId + '/autosave';
          method = 'POST';
        } else {
          url = '/admin/posts';
          method = 'POST';
        }

        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          showSaved();
          if (result.id && !postId) {
            postId = result.id;
            history.replaceState(null, '', '/admin/posts/' + postId + '/edit');
          }
          return true;
        } else {
          showError(result.error || 'Save failed');
          return false;
        }
      } catch (err) {
        showError('Network error');
        return false;
      }
    }

    // ---- ACTION BUTTONS ----
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', function() { savePost(false); });

    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) publishBtn.addEventListener('click', async function() {
      if (!titleInput.value.trim()) { showError('Title required'); return; }
      await savePost(false);
      if (!postId) return;
      showSaving();
      const res = await fetch('/admin/posts/' + postId + '/publish', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        currentStatus = 'published';
        window.location.href = '/admin/posts/' + postId + '/edit';
      } else {
        showError(result.error || 'Publish failed');
      }
    });

    const publishNowBtn = document.getElementById('publishNowBtn');
    if (publishNowBtn) publishNowBtn.addEventListener('click', async function() {
      showSaving();
      await savePost(false);
      const res = await fetch('/admin/posts/' + postId + '/publish', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        currentStatus = 'published';
        window.location.href = '/admin/posts/' + postId + '/edit';
      } else {
        showError(result.error || 'Publish failed');
      }
    });

    const unpublishBtn = document.getElementById('unpublishBtn');
    if (unpublishBtn) unpublishBtn.addEventListener('click', async function() {
      showSaving();
      const res = await fetch('/admin/posts/' + postId + '/unpublish', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        currentStatus = 'draft';
        window.location.href = '/admin/posts/' + postId + '/edit';
      } else {
        showError(result.error || 'Failed');
      }
    });

    const scheduleBtn = document.getElementById('scheduleBtn');
    if (scheduleBtn) scheduleBtn.addEventListener('click', async function() {
      const dt = scheduledAtInput.value;
      if (!dt) { alert('Please set a date and time first.'); return; }
      await savePost(false);
      if (!postId) return;
      showSaving();
      const res = await fetch('/admin/posts/' + postId + '/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_at: dt.replace('T', ' ') + ':00' }),
      });
      const result = await res.json();
      if (result.success) {
        currentStatus = 'scheduled';
        window.location.href = '/admin/posts/' + postId + '/edit';
      } else {
        showError(result.error || 'Schedule failed');
      }
    });

    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) deleteBtn.addEventListener('click', async function() {
      if (!confirm('Delete this post permanently?')) return;
      const res = await fetch('/admin/posts/' + postId + '/delete', { method: 'POST' });
      window.location.href = '/admin/posts';
    });

    // ---- SETTINGS PANEL ----
    function openSettings() {
      settingsPanel.style.display = 'block';
      settingsOverlay.style.display = 'block';
    }
    function closeSettings() {
      settingsPanel.style.display = 'none';
      settingsOverlay.style.display = 'none';
    }
    settingsBtn.addEventListener('click', openSettings);
    settingsClose.addEventListener('click', closeSettings);
    settingsOverlay.addEventListener('click', closeSettings);

    // Open settings panel by default
    openSettings();

    // ---- FLOATING TOOLBAR ----
    function showToolbar() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        floatingToolbar.style.display = 'none';
        return;
      }

      // Check if selection is within editor
      let node = sel.anchorNode;
      let inEditor = false;
      while (node) {
        if (node === editorContent) { inEditor = true; break; }
        node = node.parentNode;
      }
      if (!inEditor) { floatingToolbar.style.display = 'none'; return; }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      floatingToolbar.style.display = 'block';
      floatingToolbar.style.left = (rect.left + rect.width / 2) + 'px';
      floatingToolbar.style.top = (rect.top + window.scrollY - 48) + 'px';

      // Update active states
      floatingToolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
        const cmd = btn.dataset.cmd;
        if (cmd === 'bold') btn.classList.toggle('active', document.queryCommandState('bold'));
        if (cmd === 'italic') btn.classList.toggle('active', document.queryCommandState('italic'));
        if (cmd === 'strikethrough') btn.classList.toggle('active', document.queryCommandState('strikethrough'));
      });
    }

    document.addEventListener('selectionchange', showToolbar);

    floatingToolbar.addEventListener('mousedown', function(e) {
      e.preventDefault(); // Prevent losing selection
    });

    floatingToolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const cmd = this.dataset.cmd;
        editorContent.focus();

        switch (cmd) {
          case 'bold':
            document.execCommand('bold');
            break;
          case 'italic':
            document.execCommand('italic');
            break;
          case 'strikethrough':
            document.execCommand('strikethrough');
            break;
          case 'h2':
            toggleHeading('H2');
            break;
          case 'h3':
            toggleHeading('H3');
            break;
          case 'blockquote':
            toggleBlockquote();
            break;
          case 'insertUnorderedList':
            document.execCommand('insertUnorderedList');
            break;
          case 'insertOrderedList':
            document.execCommand('insertOrderedList');
            break;
          case 'link':
            insertLink();
            break;
          case 'code':
            toggleInlineCode();
            break;
          case 'codeblock':
            insertCodeBlock();
            break;
        }
        markDirty();
        setTimeout(showToolbar, 10);
      });
    });

    function toggleHeading(tag) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const block = getParentBlock(sel.anchorNode);
      if (block && block.tagName === tag) {
        // Remove heading
        document.execCommand('formatBlock', false, 'P');
      } else {
        document.execCommand('formatBlock', false, tag);
      }
    }

    function toggleBlockquote() {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const block = getParentBlock(sel.anchorNode);
      if (block && block.tagName === 'BLOCKQUOTE') {
        document.execCommand('formatBlock', false, 'P');
      } else {
        document.execCommand('formatBlock', false, 'BLOCKQUOTE');
      }
    }

    function insertLink() {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const existingLink = getParentTag(sel.anchorNode, 'A');
      const url = prompt('Enter URL:', existingLink ? existingLink.href : 'https://');
      if (url === null) return;
      if (url === '') {
        document.execCommand('unlink');
      } else {
        document.execCommand('createLink', false, url);
      }
    }

    function toggleInlineCode() {
      const sel = window.getSelection();
      if (!sel.rangeCount || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      const parentCode = getParentTag(sel.anchorNode, 'CODE');
      if (parentCode) {
        // Unwrap
        const text = document.createTextNode(parentCode.textContent);
        parentCode.parentNode.replaceChild(text, parentCode);
        const newRange = document.createRange();
        newRange.selectNodeContents(text);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } else {
        const code = document.createElement('code');
        code.appendChild(range.extractContents());
        range.insertNode(code);
        const newRange = document.createRange();
        newRange.selectNodeContents(code);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }

    function insertCodeBlock() {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      const sel = window.getSelection();
      if (sel.rangeCount && !sel.isCollapsed) {
        code.textContent = sel.toString();
      } else {
        code.textContent = '';
      }
      pre.appendChild(code);
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(pre);
      // Put cursor inside
      const newRange = document.createRange();
      newRange.selectNodeContents(code);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    function getParentBlock(node) {
      const blocks = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'DIV', 'LI'];
      while (node && node !== editorContent) {
        if (node.nodeType === 1 && blocks.includes(node.tagName)) return node;
        node = node.parentNode;
      }
      return null;
    }

    function getParentTag(node, tag) {
      while (node && node !== editorContent) {
        if (node.nodeType === 1 && node.tagName === tag) return node;
        node = node.parentNode;
      }
      return null;
    }

    // ---- PLUS BUTTON ----
    let plusMenuOpen = false;
    let currentEmptyLine = null;

    editorContent.addEventListener('keyup', positionPlusButton);
    editorContent.addEventListener('click', positionPlusButton);
    editorContent.addEventListener('focus', positionPlusButton);

    function positionPlusButton() {
      const sel = window.getSelection();
      if (!sel.rangeCount) { plusButton.style.display = 'none'; return; }

      const node = sel.anchorNode;
      const block = getParentBlock(node) || node;

      // Check if on empty line
      const text = (block.textContent || '').trim();
      const isEmptyBlock = text === '' && block !== editorContent;

      if (isEmptyBlock && sel.isCollapsed) {
        currentEmptyLine = block;
        const rect = block.getBoundingClientRect();
        const wrapperRect = document.querySelector('.editor-wrapper').getBoundingClientRect();
        plusButton.style.display = 'flex';
        plusButton.style.top = (rect.top + window.scrollY + (rect.height / 2) - 16) + 'px';
      } else {
        plusButton.style.display = 'none';
        if (!plusMenuOpen) plusMenu.style.display = 'none';
      }
    }

    plusButton.addEventListener('click', function(e) {
      e.stopPropagation();
      if (plusMenuOpen) {
        plusMenu.style.display = 'none';
        plusMenuOpen = false;
      } else {
        const rect = plusButton.getBoundingClientRect();
        plusMenu.style.display = 'block';
        plusMenu.style.top = (rect.bottom + window.scrollY + 8) + 'px';
        plusMenu.style.left = (rect.left) + 'px';
        plusMenuOpen = true;
      }
    });

    document.addEventListener('click', function(e) {
      if (!plusMenu.contains(e.target) && e.target !== plusButton) {
        plusMenu.style.display = 'none';
        plusMenuOpen = false;
      }
    });

    plusMenu.querySelectorAll('.plus-menu-item').forEach(item => {
      item.addEventListener('click', function() {
        const action = this.dataset.action;
        editorContent.focus();

        if (currentEmptyLine) {
          const range = document.createRange();
          range.selectNodeContents(currentEmptyLine);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }

        switch (action) {
          case 'image': {
            const url = prompt('Image URL:');
            if (url) {
              const img = document.createElement('img');
              img.src = url;
              img.alt = 'Image';
              img.style.maxWidth = '100%';
              img.style.borderRadius = '8px';
              if (currentEmptyLine && currentEmptyLine !== editorContent) {
                currentEmptyLine.innerHTML = '';
                currentEmptyLine.appendChild(img);
              } else {
                document.execCommand('insertHTML', false, img.outerHTML);
              }
            }
            break;
          }
          case 'divider': {
            if (currentEmptyLine && currentEmptyLine !== editorContent) {
              const hr = document.createElement('hr');
              currentEmptyLine.parentNode.replaceChild(hr, currentEmptyLine);
              // Add new paragraph after
              const p = document.createElement('p');
              p.innerHTML = '<br>';
              hr.parentNode.insertBefore(p, hr.nextSibling);
              const range = document.createRange();
              range.setStart(p, 0);
              range.collapse(true);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            } else {
              document.execCommand('insertHTML', false, '<hr><p><br></p>');
            }
            break;
          }
          case 'pullquote': {
            if (currentEmptyLine && currentEmptyLine !== editorContent) {
              const bq = document.createElement('blockquote');
              bq.className = 'pull-quote';
              bq.innerHTML = '<br>';
              currentEmptyLine.parentNode.replaceChild(bq, currentEmptyLine);
              const range = document.createRange();
              range.setStart(bq, 0);
              range.collapse(true);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
            }
            break;
          }
        }
        plusMenu.style.display = 'none';
        plusMenuOpen = false;
        markDirty();
      });
    });

    // ---- KEYBOARD SHORTCUTS ----
    document.addEventListener('keydown', function(e) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 's') {
        e.preventDefault();
        savePost(false);
      }

      if (mod && e.key === 'b') {
        if (document.activeElement === editorContent || editorContent.contains(document.activeElement)) {
          e.preventDefault();
          document.execCommand('bold');
          markDirty();
        }
      }

      if (mod && e.key === 'i') {
        if (document.activeElement === editorContent || editorContent.contains(document.activeElement)) {
          e.preventDefault();
          document.execCommand('italic');
          markDirty();
        }
      }

      if (mod && e.key === 'k') {
        if (document.activeElement === editorContent || editorContent.contains(document.activeElement)) {
          e.preventDefault();
          insertLink();
          markDirty();
        }
      }

      if (mod && e.key === 'Enter') {
        e.preventDefault();
        if (publishBtn) publishBtn.click();
        else if (publishNowBtn) publishNowBtn.click();
      }
    });

    // ---- ENTER KEY IN CONTENT ----
    editorContent.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        const sel = window.getSelection();
        const block = getParentBlock(sel.anchorNode);

        // If inside a heading, break out to paragraph
        if (block && (block.tagName === 'H2' || block.tagName === 'H3')) {
          e.preventDefault();
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          block.parentNode.insertBefore(p, block.nextSibling);
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }

        // If inside a blockquote and line is empty, break out
        if (block && block.tagName === 'BLOCKQUOTE' && (block.textContent || '').trim() === '') {
          e.preventDefault();
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          block.parentNode.replaceChild(p, block);
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }

        // If inside a pre/code block, insert newline instead of new block
        if (block && block.tagName === 'PRE') {
          e.preventDefault();
          document.execCommand('insertText', false, '\\n');
        }
      }
    });

    // ---- PASTE: clean up ----
    editorContent.addEventListener('paste', function(e) {
      // Allow paste but strip MS Word junk while keeping basic formatting
      const html = e.clipboardData.getData('text/html');
      if (html && (html.includes('mso-') || html.includes('urn:schemas-microsoft-com'))) {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      }
    });

    // ---- TITLE ENTER KEY ----
    titleInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        subtitleInput.focus();
      }
    });
    subtitleInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        editorContent.focus();
      }
    });

    // ---- INIT ----
    if (!isNew) {
      showSaved();
    } else {
      saveDot.className = 'save-dot';
      saveStatus.textContent = 'New post';
    }

    // Focus title for new posts
    if (isNew) {
      titleInput.focus();
    }

    // Start autosave loop
    resetAutoSave();

  })();
  </script>
</body>
</html>`;
}
