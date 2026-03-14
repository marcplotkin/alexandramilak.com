import { escapeHtml, escapeAttr } from '../lib/utils';
import type { Post } from '../index';



export function editorPage(post: Post | null, isNew: boolean): string {
  const postId = post?.id || 0;
  const postTitle = post?.title || '';
  const postContent = post?.content || '';
  const postExcerpt = post?.excerpt || '';
  const postSlug = post?.slug || '';
  const postStatus = post?.status || 'draft';
  const postCoverImage = post?.cover_image_url || '';
  const postCoverCaption = post?.cover_image_caption || '';
  const postScheduledAt = post?.scheduled_at || '';
  const postEmailSubs = isNew ? true : (post?.email_subscribers ? true : false);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
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
      background-color: #220D12;
      background-image: none;
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
      margin: 0 -24px 32px;
      overflow: hidden;
      display: none;
    }
    .cover-image-preview img {
      width: 100%;
      height: auto;
      display: block;
    }
    .cover-caption-preview {
      font-size: 13px;
      font-style: italic;
      color: rgba(255,248,240,0.45);
      margin: 2px 0 0;
      padding: 0 4px;
      display: none;
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
    .title-input::placeholder { color: rgba(255,248,240,0.5); }

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
    .editor-content video {
      max-width: 100%;
      border-radius: 8px;
      margin: 24px 0;
    }
    .media-figure {
      margin: 24px 0;
      text-align: center;
      position: relative;
    }
    .media-figure img,
    .media-figure video {
      max-width: 100%;
      border-radius: 8px;
      margin: 0;
      cursor: pointer;
    }
    .media-figure.selected {
      outline: 2px solid rgba(255,248,240,0.4);
      outline-offset: 4px;
      border-radius: 10px;
    }
    .media-toolbar {
      display: none;
      position: absolute;
      top: 8px;
      right: 8px;
      gap: 6px;
      z-index: 10;
    }
    .media-figure.selected .media-toolbar {
      display: flex;
    }
    .media-toolbar button {
      background: rgba(0,0,0,0.75);
      color: #FFF8F0;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      transition: background 0.2s;
    }
    .media-toolbar button:hover {
      background: rgba(0,0,0,0.9);
    }
    .media-toolbar button.remove-btn:hover {
      background: #722F37;
    }
    .media-caption {
      font-size: 13px;
      font-style: italic;
      color: rgba(255,248,240,0.45);
      margin-top: 6px;
      text-align: left;
      outline: none;
      min-height: 20px;
    }
    .media-caption:empty::before {
      content: attr(placeholder);
      color: rgba(255,248,240,0.25);
    }
    .embed-wrapper {
      margin: 24px 0;
      border-radius: 12px;
      overflow: hidden;
    }
    .embed-wrapper iframe {
      display: block;
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
      text-decoration-color: rgba(255,248,240,0.5);
    }
    .editor-content s {
      text-decoration: line-through;
    }

    /* ---- LINK CARD ---- */
    .link-card {
      display: flex;
      border: 1px solid rgba(255,248,240,0.12);
      border-radius: 10px;
      overflow: hidden;
      margin: 20px 0;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s;
      cursor: pointer;
      max-height: 140px;
    }
    .link-card:hover {
      border-color: rgba(255,248,240,0.3);
    }
    .link-card-body {
      flex: 1;
      padding: 14px 16px;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .link-card-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--cream);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .link-card-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.4;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .link-card-url {
      font-size: 11px;
      color: rgba(255,248,240,0.35);
      margin-top: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .link-card-image {
      width: 140px;
      flex-shrink: 0;
      background-size: cover;
      background-position: center;
    }

    /* ---- EMAIL PREVIEW MODAL ---- */
    .email-modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 500;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .email-modal-overlay.visible { display: flex; }
    .email-modal {
      background: #fff;
      border-radius: 12px;
      max-width: 640px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    .email-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e8e0d8;
      position: sticky;
      top: 0;
      background: #fff;
      border-radius: 12px 12px 0 0;
      z-index: 2;
    }
    .email-modal-header h3 {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      color: #2C1810;
      font-weight: 600;
    }
    .email-modal-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #7A6B63;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .email-modal-close:hover { background: #f0ebe6; }
    .email-modal-body { padding: 0; }

    /* ---- FLOATING TOOLBAR ---- */
    .floating-toolbar {
      position: fixed;
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
      border-color: rgba(255,248,240,0.6);
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

    /* ---- LAYOUT: EDITOR + SIDEBAR ---- */
    .editor-layout {
      display: flex;
      min-height: calc(100vh - 49px);
    }

    .editor-main {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
    }

    /* ---- SIDEBAR ---- */
    .settings-panel {
      width: 300px;
      flex-shrink: 0;
      background: rgba(45, 10, 16, 0.6);
      border-left: 1px solid var(--border);
      overflow-y: auto;
      height: calc(100vh - 49px);
      position: sticky;
      top: 49px;
    }
    .settings-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      background: rgba(45, 10, 16, 0.95);
      backdrop-filter: blur(8px);
      z-index: 10;
    }
    .settings-header h3 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 17px;
      color: var(--cream);
    }
    .settings-body { padding: 20px; }

    /* Publish button in sidebar */
    .sidebar-publish {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sidebar-publish .btn {
      width: 100%;
      justify-content: center;
      padding: 10px 18px;
    }
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

    /* ---- DRAG & DROP ---- */
    .editor-content.drag-over {
      outline: 2px dashed rgba(255,248,240,0.4);
      outline-offset: -4px;
      background: rgba(255,248,240,0.03);
    }
    .upload-placeholder {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(255,248,240,0.06);
      border: 1px solid rgba(255,248,240,0.15);
      border-radius: 8px;
      margin: 16px 0;
      color: var(--text-muted);
      font-size: 14px;
    }
    .upload-placeholder .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,248,240,0.2);
      border-top-color: var(--cream);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .cover-drop-zone {
      border: 2px dashed rgba(255,248,240,0.2);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 8px;
      color: var(--text-muted);
      font-size: 13px;
    }
    .cover-drop-zone:hover,
    .cover-drop-zone.drag-over {
      border-color: rgba(255,248,240,0.6);
      background: rgba(255,248,240,0.05);
      color: var(--cream);
    }
    .cover-drop-zone .upload-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    @media (max-width: 900px) {
      .editor-layout { flex-direction: column; }
      .settings-panel {
        width: 100%;
        height: auto;
        position: static;
        border-left: none;
        border-top: 1px solid var(--border);
      }
      .editor-wrapper { padding: 32px 20px 60px; }
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
      <button class="btn btn-ghost" id="saveBtn" type="button">${postStatus === 'published' ? 'Save' : 'Save Draft'}</button>
    </div>
  </div>

  <div class="editor-layout">
    <!-- LEFT: Writing area -->
    <div class="editor-main">
      <div class="editor-wrapper">
        <div class="cover-image-preview" id="coverPreview">
          <img id="coverPreviewImg" src="" alt="Cover">
          <p class="cover-caption-preview" id="coverCaptionPreview"></p>
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
          <button class="plus-menu-item" data-action="video" type="button">
            <span class="plus-menu-icon">&#127909;</span> Video
          </button>
          <button class="plus-menu-item" data-action="embed" type="button">
            <span class="plus-menu-icon">&#128279;</span> Embed
          </button>
          <button class="plus-menu-item" data-action="divider" type="button">
            <span class="plus-menu-icon">&mdash;</span> Divider
          </button>
          <button class="plus-menu-item" data-action="pullquote" type="button">
            <span class="plus-menu-icon">&#10077;</span> Pull Quote
          </button>
          <button class="plus-menu-item" data-action="linkcard" type="button">
            <span class="plus-menu-icon">&#127760;</span> Link Card
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
    </div>

    <!-- RIGHT: Settings sidebar -->
    <div class="settings-panel">
      <div class="sidebar-publish">
        ${postStatus === 'published' ? `
          <button class="btn btn-success" id="publishNowBtn" type="button">Update &amp; Publish</button>
          <button class="btn btn-ghost" id="unpublishBtn" type="button">Unpublish</button>
        ` : `
          <button class="btn btn-primary" id="publishBtn" type="button">Publish Now</button>
        `}
        <button class="btn btn-ghost" id="previewBtn" type="button" style="margin-top: 8px;">Preview</button>
      </div>
      <div class="settings-header">
        <h3>Post Settings</h3>
      </div>
      <div class="settings-body">
        <div class="settings-group">
          <label class="settings-label">Cover Image</label>
          <input type="text" class="settings-input" id="coverImageInput" placeholder="https://example.com/image.jpg" value="${escapeAttr(postCoverImage)}">
          <div class="cover-drop-zone" id="coverDropZone">
            <div class="upload-icon">&#128247;</div>
            Drop an image here or <span style="text-decoration: underline; cursor: pointer;" id="coverFileBtn">browse</span>
          </div>
          <input type="file" id="coverFileInput" accept="image/*" style="display: none;">
          <div class="settings-hint">Drag & drop, browse, or paste a URL</div>
          <input type="text" class="settings-input" id="coverCaptionInput" placeholder="Photo credit or description..." value="${escapeAttr(postCoverCaption)}" style="margin-top: 8px; font-size: 13px; font-style: italic;">
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
          <button class="btn btn-ghost" id="emailPreviewBtn" type="button" style="width: 100%; justify-content: center; margin-top: 10px; font-size: 12px;">Preview Email Notification</button>
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
    // Settings panel is always visible as sidebar (no toggle needed)
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
    const coverCaptionPreview = document.getElementById('coverCaptionPreview');
    const coverCaptionInput = document.getElementById('coverCaptionInput');
    function updateCoverPreview() {
      const url = coverImageInput.value.trim();
      if (url) {
        coverPreviewImg.src = url;
        coverPreview.style.display = 'block';
      } else {
        coverPreview.style.display = 'none';
      }
      updateCaptionPreview();
    }
    function updateCaptionPreview() {
      const caption = coverCaptionInput.value.trim();
      if (caption && coverPreview.style.display !== 'none') {
        coverCaptionPreview.textContent = caption;
        coverCaptionPreview.style.display = 'block';
      } else {
        coverCaptionPreview.style.display = 'none';
      }
    }
    coverImageInput.addEventListener('input', function() { updateCoverPreview(); markDirty(); });
    coverCaptionInput.addEventListener('input', function() { updateCaptionPreview(); markDirty(); });
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
    function showToast(msg, isError) {
      const toast = document.createElement('div');
      toast.textContent = msg;
      toast.style.cssText = 'position:fixed;top:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;font-size:14px;z-index:9999;color:#fff;background:' + (isError ? '#dc2626' : '#16a34a') + ';box-shadow:0 4px 20px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.3s;';
      document.body.appendChild(toast);
      requestAnimationFrame(function() { toast.style.opacity = '1'; });
      setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 300); }, 3000);
    }

    // ---- PREVIEW ----
    document.getElementById('previewBtn').addEventListener('click', function() {
      var title = document.getElementById('titleInput').value || 'Untitled';
      var subtitle = document.getElementById('subtitleInput').value || '';
      var coverUrl = coverImageInput.value.trim();
      var coverCaption = document.getElementById('coverCaptionInput').value.trim();
      var content = editorContent.innerHTML;
      var dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Strip editor toolbar artifacts from content
      var cleanContent = content.replace(/<div class="media-toolbar">.*?<\\/div>/g, '');

      var html = '<!DOCTYPE html><html lang="en"><head>'
        + '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
        + '<title>Preview</title>'
        + '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">'
        + '<style>'
        + '* { margin: 0; padding: 0; box-sizing: border-box; }'
        + 'body { font-family: "DM Sans", sans-serif; background: linear-gradient(180deg, #2D0A10 0%, #1A0609 100%); color: #FFF8F0; min-height: 100vh; padding: 40px 20px; }'
        + '.container { max-width: 680px; margin: 0 auto; }'
        + '.preview-banner { background: rgba(255,248,240,0.1); padding: 10px 16px; border-radius: 8px; margin-bottom: 32px; text-align: center; font-size: 13px; color: rgba(255,248,240,0.6); cursor: pointer; }'
        + '.preview-banner:hover { background: rgba(255,248,240,0.15); }'
        + '.cover img { width: 100%; height: auto; border-radius: 12px; }'
        + '.cover-cap { font-size: 13px; font-style: italic; color: rgba(255,248,240,0.6); margin: 10px 0 36px; }'
        + '.no-cap { margin-bottom: 36px; }'
        + 'h1 { font-family: "Cormorant Garamond", Georgia, serif; font-size: 44px; font-weight: 500; line-height: 1.2; margin-bottom: 12px; }'
        + '.subtitle { font-size: 18px; color: rgba(255,248,240,0.55); margin-bottom: 8px; }'
        + '.date { font-size: 12px; color: rgba(255,248,240,0.35); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 44px; }'
        + '.content { font-size: 17px; line-height: 1.8; color: rgba(255,248,240,0.88); }'
        + '.content p { margin-bottom: 20px; }'
        + '.content img { max-width: 100%; border-radius: 10px; margin: 28px 0; }'
        + '.content video { max-width: 100%; border-radius: 10px; margin: 28px 0; }'
        + '.content a { color: rgba(255,248,240,0.7); }'
        + '.media-figure { margin: 28px 0; }'
        + '.media-figure img, .media-figure video { max-width: 100%; border-radius: 10px; margin: 0; }'
        + '.media-caption { font-size: 13px; font-style: italic; color: rgba(255,248,240,0.6); margin-top: 6px; }'
        + '.media-toolbar { display: none; }'
        + '</style></head><body><div class="container">'
        + '<div class="preview-banner" onclick="window.history.back()">Preview — click here to go back to editor</div>';
      if (coverUrl) {
        html += '<div class="cover' + (coverCaption ? '' : ' no-cap') + '"><img src="' + coverUrl + '" alt="Cover"></div>';
        if (coverCaption) html += '<p class="cover-cap">' + coverCaption.replace(/</g, '&lt;') + '</p>';
      }
      html += '<h1>' + title.replace(/</g, '&lt;') + '</h1>';
      if (subtitle) html += '<p class="subtitle">' + subtitle.replace(/</g, '&lt;') + '</p>';
      html += '<p class="date">' + dateStr + '</p>';
      html += '<div class="content">' + cleanContent + '</div>';
      html += '</div></body></html>';

      // Use same tab to avoid popup blockers
      document.open();
      document.write(html);
      document.close();
    });

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
        cover_image_caption: document.getElementById('coverCaptionInput').value.trim() || null,
        email_subscribers: emailSubsToggle.checked ? 1 : 0,
        status: currentStatus,
        scheduled_at: scheduledAtInput.value ? new Date(scheduledAtInput.value).toISOString().replace('T', ' ').substring(0, 19) : null,
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
      const saved = await savePost(false);
      if (!saved || !postId) return;
      showSaving();
      const res = await fetch('/admin/posts/' + postId + '/publish', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        currentStatus = 'published';
        showSaved();
        showToast('Post published!');
        showViewPostLink();
      } else {
        showError(result.error || 'Publish failed');
        showToast(result.error || 'Publish failed', true);
      }
    });

    const publishNowBtn = document.getElementById('publishNowBtn');
    if (publishNowBtn) publishNowBtn.addEventListener('click', async function() {
      showSaving();
      const saved = await savePost(false);
      if (!saved) return;
      const res = await fetch('/admin/posts/' + postId + '/publish', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        currentStatus = 'published';
        showSaved();
        showToast('Post updated & published!');
        showViewPostLink();
      } else {
        showError(result.error || 'Publish failed');
        showToast(result.error || 'Publish failed', true);
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
        body: JSON.stringify({ scheduled_at: new Date(dt).toISOString().replace('T', ' ').substring(0, 19) }),
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

    // Settings panel is always visible in sidebar — no toggle logic needed.

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
      floatingToolbar.style.top = (rect.top - 48) + 'px';

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

    // Cmd+click (Mac) or Ctrl+click (Win) to open links in new tab
    editorContent.addEventListener('click', function(e) {
      if (e.metaKey || e.ctrlKey) {
        var link = e.target.closest('a');
        if (link && link.href) {
          e.preventDefault();
          window.open(link.href, '_blank');
        }
      }
    });

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
            var fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = function() {
              if (fileInput.files.length > 0) {
                insertMediaFromFile(fileInput.files[0]);
              }
            };
            fileInput.click();
            break;
          }
          case 'video': {
            var videoInput = document.createElement('input');
            videoInput.type = 'file';
            videoInput.accept = 'video/*';
            videoInput.onchange = function() {
              if (videoInput.files.length > 0) {
                insertMediaFromFile(videoInput.files[0]);
              }
            };
            videoInput.click();
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
          case 'embed': {
            var embedUrl = prompt('Paste a URL (Spotify, YouTube, Vimeo, SoundCloud, etc.)');
            if (embedUrl) {
              var embedHtml = getEmbedHtml(embedUrl.trim());
              if (embedHtml) {
                if (currentEmptyLine && currentEmptyLine !== editorContent) {
                  var wrapper = document.createElement('div');
                  wrapper.className = 'embed-wrapper';
                  wrapper.innerHTML = embedHtml;
                  currentEmptyLine.parentNode.replaceChild(wrapper, currentEmptyLine);
                  var np = document.createElement('p');
                  np.innerHTML = '<br>';
                  wrapper.parentNode.insertBefore(np, wrapper.nextSibling);
                  var r = document.createRange();
                  r.setStart(np, 0);
                  r.collapse(true);
                  var s = window.getSelection();
                  s.removeAllRanges();
                  s.addRange(r);
                } else {
                  document.execCommand('insertHTML', false, '<div class="embed-wrapper">' + embedHtml + '</div><p><br></p>');
                }
              } else {
                // Unknown URL — insert as a styled link
                var linkHtml = '<a href="' + embedUrl + '" target="_blank" rel="noopener">' + embedUrl + '</a>';
                document.execCommand('insertHTML', false, linkHtml);
              }
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

    // ---- EMBED HELPERS ----
    function getEmbedHtml(url) {
      // Spotify
      var spotifyMatch = url.match(/open\\.spotify\\.com\\/(track|album|playlist|episode|show)\\/([a-zA-Z0-9]+)/);
      if (spotifyMatch) {
        return '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/' + spotifyMatch[1] + '/' + spotifyMatch[2] + '?utm_source=generator&theme=0" width="100%" height="' + (spotifyMatch[1] === 'track' ? '152' : '352') + '" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
      }
      // YouTube
      var ytMatch = url.match(/(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([a-zA-Z0-9_-]+)/);
      if (ytMatch) {
        return '<iframe width="100%" height="400" src="https://www.youtube.com/embed/' + ytMatch[1] + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" style="border-radius:12px"></iframe>';
      }
      // Vimeo
      var vimeoMatch = url.match(/vimeo\\.com\\/([0-9]+)/);
      if (vimeoMatch) {
        return '<iframe src="https://player.vimeo.com/video/' + vimeoMatch[1] + '" width="100%" height="400" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy" style="border-radius:12px"></iframe>';
      }
      // SoundCloud
      if (url.includes('soundcloud.com/')) {
        return '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) + '&color=%23C0392B&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false" loading="lazy"></iframe>';
      }
      // Instagram
      if (url.includes('instagram.com/p/') || url.includes('instagram.com/reel/')) {
        var cleanUrl = url.split('?')[0];
        if (!cleanUrl.endsWith('/')) cleanUrl += '/';
        return '<blockquote class="instagram-media" data-instgrm-permalink="' + cleanUrl + '" style="max-width:540px; width:100%;"><a href="' + cleanUrl + '" target="_blank">View on Instagram</a></blockquote><script async src="https://www.instagram.com/embed.js"><\\/script>';
      }
      // TikTok
      if (url.includes('tiktok.com/')) {
        return '<blockquote class="tiktok-embed" cite="' + url + '" style="max-width:605px; min-width:325px;"><a href="' + url + '" target="_blank">View on TikTok</a></blockquote><script async src="https://www.tiktok.com/embed.js"><\\/script>';
      }
      return null;
    }

    // ---- MEDIA UPLOAD ----
    async function uploadFile(file) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      return result.url;
    }

    function isImageFile(file) {
      return file.type.startsWith('image/');
    }

    function isVideoFile(file) {
      return file.type.startsWith('video/');
    }

    function isMediaFile(file) {
      return isImageFile(file) || isVideoFile(file);
    }

    // ---- MEDIA FIGURE SELECT/EDIT/REMOVE ----
    function bindMediaFigure(figure) {
      // Click media (img/video) to select
      var mediaEl = figure.querySelector('img, video');
      if (mediaEl) {
        mediaEl.addEventListener('click', function(e) {
          e.stopPropagation();
          // Deselect any other
          editorContent.querySelectorAll('.media-figure.selected').forEach(function(f) { f.classList.remove('selected'); });
          figure.classList.add('selected');
        });
      }
      // Remove button
      var removeBtn = figure.querySelector('.remove-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          figure.parentNode.removeChild(figure);
          markDirty();
        });
      }
      // Replace button
      var replaceBtn = figure.querySelector('.replace-btn');
      if (replaceBtn) {
        replaceBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          var input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*,video/*';
          input.onchange = async function() {
            if (input.files.length > 0) {
              var f = input.files[0];
              try {
                var newUrl = await uploadFile(f);
                var oldMedia = figure.querySelector('img, video');
                if (isImageFile(f)) {
                  var newImg = document.createElement('img');
                  newImg.src = newUrl;
                  newImg.alt = f.name;
                  if (oldMedia) oldMedia.parentNode.replaceChild(newImg, oldMedia);
                  newImg.addEventListener('click', function(ev) { ev.stopPropagation(); editorContent.querySelectorAll('.media-figure.selected').forEach(function(x) { x.classList.remove('selected'); }); figure.classList.add('selected'); });
                } else if (isVideoFile(f)) {
                  var newVid = document.createElement('video');
                  newVid.src = newUrl;
                  newVid.controls = true;
                  if (oldMedia) oldMedia.parentNode.replaceChild(newVid, oldMedia);
                  newVid.addEventListener('click', function(ev) { ev.stopPropagation(); editorContent.querySelectorAll('.media-figure.selected').forEach(function(x) { x.classList.remove('selected'); }); figure.classList.add('selected'); });
                }
                markDirty();
              } catch (err) {
                alert('Upload failed: ' + err.message);
              }
            }
          };
          input.click();
        });
      }
    }

    // Click outside media to deselect
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.media-figure')) {
        editorContent.querySelectorAll('.media-figure.selected').forEach(function(f) { f.classList.remove('selected'); });
      }
    });

    // Wrap ALL bare images/videos in figures on load (for posts saved before figure support)
    function wrapBareMedia() {
      editorContent.querySelectorAll('img, video').forEach(function(el) {
        if (!el.closest('.media-figure')) {
          var figure = document.createElement('figure');
          figure.className = 'media-figure';
          figure.contentEditable = 'false';
          var toolbar = document.createElement('div');
          toolbar.className = 'media-toolbar';
          toolbar.innerHTML = '<button type="button" class="replace-btn">Replace</button><button type="button" class="remove-btn">Remove</button>';
          figure.appendChild(toolbar);
          el.parentNode.insertBefore(figure, el);
          figure.appendChild(el);
          var caption = document.createElement('figcaption');
          caption.className = 'media-caption';
          caption.contentEditable = 'true';
          caption.setAttribute('placeholder', 'Add a caption...');
          figure.appendChild(caption);
          bindMediaFigure(figure);
        }
      });
    }
    wrapBareMedia();

    // Bind existing media figures (when editing existing post)
    editorContent.querySelectorAll('.media-figure').forEach(function(fig) { bindMediaFigure(fig); });

    async function insertMediaFromFile(file) {
      // Create placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'upload-placeholder';
      placeholder.innerHTML = '<div class="spinner"></div> Uploading ' + file.name + '...';

      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.collapse(false);
        range.insertNode(placeholder);
      } else {
        editorContent.appendChild(placeholder);
      }

      try {
        const url = await uploadFile(file);

        const figure = document.createElement('figure');
        figure.className = 'media-figure';
        figure.contentEditable = 'false';

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'media-toolbar';
        toolbar.innerHTML = '<button type="button" class="replace-btn">Replace</button><button type="button" class="remove-btn">Remove</button>';
        figure.appendChild(toolbar);

        if (isImageFile(file)) {
          const img = document.createElement('img');
          img.src = url;
          img.alt = file.name;
          figure.appendChild(img);
        } else if (isVideoFile(file)) {
          const video = document.createElement('video');
          video.src = url;
          video.controls = true;
          figure.appendChild(video);
        }

        const caption = document.createElement('figcaption');
        caption.className = 'media-caption';
        caption.contentEditable = 'true';
        caption.setAttribute('placeholder', 'Add a caption...');
        figure.appendChild(caption);

        placeholder.parentNode.replaceChild(figure, placeholder);
        bindMediaFigure(figure);

        // Add a paragraph after the figure so user can continue typing
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        figure.parentNode.insertBefore(p, figure.nextSibling);

        markDirty();
      } catch (err) {
        placeholder.innerHTML = 'Upload failed: ' + err.message;
        placeholder.style.color = '#e6a09a';
        setTimeout(function() {
          if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
        }, 3000);
      }
    }

    // ---- DRAG & DROP ON EDITOR ----
    editorContent.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
      editorContent.classList.add('drag-over');
    });

    editorContent.addEventListener('dragleave', function(e) {
      e.preventDefault();
      editorContent.classList.remove('drag-over');
    });

    editorContent.addEventListener('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
      editorContent.classList.remove('drag-over');

      const files = e.dataTransfer.files;
      for (var i = 0; i < files.length; i++) {
        if (isMediaFile(files[i])) {
          insertMediaFromFile(files[i]);
        }
      }
    });

    // ---- COVER IMAGE DRAG & DROP ----
    var coverDropZone = document.getElementById('coverDropZone');
    var coverFileInput = document.getElementById('coverFileInput');
    var coverFileBtn = document.getElementById('coverFileBtn');

    coverDropZone.addEventListener('dragover', function(e) {
      e.preventDefault();
      coverDropZone.classList.add('drag-over');
    });

    coverDropZone.addEventListener('dragleave', function(e) {
      e.preventDefault();
      coverDropZone.classList.remove('drag-over');
    });

    coverDropZone.addEventListener('drop', async function(e) {
      e.preventDefault();
      coverDropZone.classList.remove('drag-over');

      var files = e.dataTransfer.files;
      if (files.length > 0 && isImageFile(files[0])) {
        coverDropZone.innerHTML = '<div class="spinner" style="margin: 0 auto;"></div>';
        try {
          var url = await uploadFile(files[0]);
          coverImageInput.value = url;
          updateCoverPreview();
          markDirty();
          coverDropZone.innerHTML = '<div class="upload-icon">&#128247;</div>Drop an image here or <span style="text-decoration: underline; cursor: pointer;" id="coverFileBtn">browse</span>';
          // Re-bind browse click
          document.getElementById('coverFileBtn').addEventListener('click', function() { coverFileInput.click(); });
        } catch (err) {
          coverDropZone.innerHTML = 'Upload failed: ' + err.message;
          coverDropZone.style.color = '#e6a09a';
        }
      }
    });

    coverFileBtn.addEventListener('click', function() { coverFileInput.click(); });

    coverFileInput.addEventListener('change', async function() {
      if (this.files.length > 0 && isImageFile(this.files[0])) {
        coverDropZone.innerHTML = '<div class="spinner" style="margin: 0 auto;"></div>';
        try {
          var url = await uploadFile(this.files[0]);
          coverImageInput.value = url;
          updateCoverPreview();
          markDirty();
          coverDropZone.innerHTML = '<div class="upload-icon">&#128247;</div>Drop an image here or <span style="text-decoration: underline; cursor: pointer;" id="coverFileBtn">browse</span>';
          document.getElementById('coverFileBtn').addEventListener('click', function() { coverFileInput.click(); });
        } catch (err) {
          coverDropZone.innerHTML = 'Upload failed: ' + err.message;
          coverDropZone.style.color = '#e6a09a';
        }
      }
    });

    // ---- PASTE: clean up ----
    editorContent.addEventListener('paste', function(e) {
      // Handle pasted images (e.g. screenshots)
      var items = e.clipboardData.items;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          var file = items[i].getAsFile();
          if (file) insertMediaFromFile(file);
          return;
        }
      }

      // Allow paste but strip MS Word junk while keeping basic formatting
      var html = e.clipboardData.getData('text/html');
      if (html && (html.includes('mso-') || html.includes('urn:schemas-microsoft-com'))) {
        e.preventDefault();
        var text = e.clipboardData.getData('text/plain');
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

    // ---- VIEW POST LINK ----
    function showViewPostLink() {
      var statusArea = document.querySelector('.topbar-center');
      if (statusArea && !statusArea.querySelector('.view-post-link')) {
        var viewLink = document.createElement('a');
        viewLink.href = '/feed/' + slugInput.value;
        viewLink.textContent = 'View Post \u2192';
        viewLink.target = '_blank';
        viewLink.className = 'view-post-link';
        viewLink.style.cssText = 'margin-left: 12px; color: #6aba6a; font-size: 13px; text-decoration: underline;';
        statusArea.appendChild(viewLink);
      }
    }

    // Show view link if already published
    if (currentStatus === 'published' && slugInput.value) {
      showViewPostLink();
    }

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

  // ---- EMAIL PREVIEW ----
  document.getElementById('emailPreviewBtn').addEventListener('click', function() {
    var title = titleInput.value || 'Untitled Post';
    var excerpt = subtitleInput.value || '';
    var slug = slugInput.value || 'post';
    var postUrl = window.location.origin + '/feed/' + slug;
    var shareUrl = window.location.origin;

    var emailHtml = '<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">'
      + '<p style="color: #7A6B63; font-size: 14px; margin-bottom: 8px;">Sunday Sauce</p>'
      + '<h1 style="font-family: Georgia, serif; color: #722F37; font-size: 28px; margin-bottom: 16px;">' + title.replace(/</g, '&lt;') + '</h1>'
      + (excerpt ? '<p style="color: #2C1810; line-height: 1.6; margin-bottom: 24px;">' + excerpt.replace(/</g, '&lt;') + '</p>' : '')
      + '<div style="text-align: center; margin: 32px 0;">'
      + '<a href="' + postUrl + '" style="display: inline-block; background: #722F37; color: #FFF8F0; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Read Post</a>'
      + '</div>'
      + '<div style="text-align: center; margin: 16px 0;">'
      + '<p style="color: #7A6B63; font-size: 13px;">Know someone who would enjoy this? <a href="' + shareUrl + '" style="color: #722F37;">Invite them to Sunday Sauce</a></p>'
      + '</div>'
      + '<div style="border-top: 1px solid #e8e0d8; padding-top: 20px; margin-top: 32px; text-align: center; font-size: 12px; color: #7A6B63;">'
      + '<p style="margin: 0 0 8px;">You are receiving this because you are a member of Sunday Sauce by Alexandra Milak.</p>'
      + '<p style="margin: 0;"><a href="#" style="color: #7A6B63; text-decoration: underline;">Unsubscribe from emails</a> &middot; <a href="#" style="color: #7A6B63; text-decoration: underline;">Leave Sunday Sauce</a></p>'
      + '</div></div>';

    var overlay = document.getElementById('emailPreviewModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'emailPreviewModal';
      overlay.className = 'email-modal-overlay';
      overlay.innerHTML = '<div class="email-modal">'
        + '<div class="email-modal-header"><h3>Email Notification Preview</h3><button class="email-modal-close" id="emailModalClose">&times;</button></div>'
        + '<div class="email-modal-body"><div id="emailPreviewContent" style="padding: 0;"></div></div>'
        + '</div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.classList.remove('visible'); });
      document.getElementById('emailModalClose').addEventListener('click', function() { overlay.classList.remove('visible'); });
    }
    document.getElementById('emailPreviewContent').innerHTML = emailHtml;
    overlay.classList.add('visible');
  });

  // ---- LINK CARD (from plus menu or paste) ----
  function insertLinkCard(url) {
    var placeholder = document.createElement('div');
    placeholder.className = 'link-card';
    placeholder.setAttribute('contenteditable', 'false');
    placeholder.innerHTML = '<div class="link-card-body"><div class="link-card-title" style="color: rgba(255,248,240,0.4);">Loading preview...</div><div class="link-card-url">' + url.replace(/</g, '&lt;') + '</div></div>';

    var sel = window.getSelection();
    if (sel.rangeCount) {
      var range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(placeholder);
      range.collapse(false);
    } else {
      editorContent.appendChild(placeholder);
    }

    // Add paragraph after for continued editing
    var p = document.createElement('p');
    p.innerHTML = '<br>';
    placeholder.parentNode.insertBefore(p, placeholder.nextSibling);

    fetch('/admin/unfurl?url=' + encodeURIComponent(url))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          var cardHtml = '<div class="link-card-body">'
            + '<div class="link-card-title">' + (data.title || '').replace(/</g, '&lt;') + '</div>'
            + (data.description ? '<div class="link-card-desc">' + data.description.replace(/</g, '&lt;') + '</div>' : '')
            + '<div class="link-card-url">' + (data.site || url).replace(/</g, '&lt;') + '</div>'
            + '</div>'
            + (data.image ? '<div class="link-card-image" style="background-image: url(' + data.image + ')"></div>' : '');
          placeholder.innerHTML = cardHtml;
          placeholder.setAttribute('data-url', url);
          placeholder.onclick = function() { window.open(url, '_blank'); };
        } else {
          // Fallback: simple linked URL
          placeholder.outerHTML = '<p><a href="' + url + '" target="_blank">' + url.replace(/</g, '&lt;') + '</a></p>';
        }
        markDirty();
      })
      .catch(function() {
        placeholder.outerHTML = '<p><a href="' + url + '" target="_blank">' + url.replace(/</g, '&lt;') + '</a></p>';
        markDirty();
      });
  }

  // Handle "Link Card" from plus menu
  document.querySelector('[data-action="linkcard"]').addEventListener('click', function() {
    plusMenu.style.display = 'none';
    var url = prompt('Enter a URL:');
    if (url && url.trim()) {
      insertLinkCard(url.trim());
    }
  });

  // Auto-detect pasted URLs on blank lines
  editorContent.addEventListener('paste', function(e) {
    // Check if pasting plain text that looks like a URL
    var text = e.clipboardData.getData('text/plain').trim();
    if (/^https?:\\/\\/[^\\s]+$/.test(text)) {
      // Check if we're on an empty line/paragraph
      var sel = window.getSelection();
      if (sel.anchorNode) {
        var block = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
        var blockText = (block.textContent || '').trim();
        if (!blockText || block === editorContent) {
          e.preventDefault();
          insertLinkCard(text);
          return;
        }
      }
    }
  }, true); // Use capture phase to run before the other paste handler

  })();
  </script>
</body>
</html>`;
}
