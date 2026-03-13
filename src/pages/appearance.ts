import { layout } from './layout';
import { DEFAULTS, lightenColor, FONT_PAIRINGS } from '../lib/settings';
import type { SiteSettings } from '../lib/settings';
import { escapeHtml, escapeAttr } from '../lib/utils';

function adminNav(): string {
  return `
    <nav class="nav">
      <a href="/admin" class="nav-brand">Sunday Sauce <span style="font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 2px; background: rgba(255,248,240,0.1); color: var(--cream); padding: 3px 10px; border-radius: 20px; margin-left: 10px; vertical-align: middle;">ADMIN</span></a>
      <div class="nav-links">
        <a href="/feed">Feed</a>
        <a href="/auth/logout">Log Out</a>
      </div>
    </nav>
  `;
}

export function appearancePage(settings: SiteSettings): string {
  const gradientTop = lightenColor(settings.bg_color, 1.6);
  const accentGradientTop = lightenColor(settings.accent_color, 1.3);

  // Load all font pairings for preview cards
  const fontLinks = Object.values(FONT_PAIRINGS)
    .filter(p => p.googleFontsUrl !== FONT_PAIRINGS.classic.googleFontsUrl)
    .map(p => `<link href="${p.googleFontsUrl}" rel="stylesheet">`)
    .join('\n');

  const content = `
    ${fontLinks}
    ${adminNav()}
    <h1 style="font-size: 28px; margin-bottom: 8px;">Appearance</h1>
    <p style="color: rgba(255,248,240,0.5); font-size: 14px; margin-bottom: 36px;">Customize how Sunday Sauce looks and feels.</p>

    <!-- ═══ SITE IDENTITY ═══ -->
    <div class="card" style="margin-bottom: 28px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <span style="font-size: 20px;">&#9997;</span>
        <h3 style="font-size: 18px; margin: 0;">Site Tagline</h3>
      </div>
      <p style="color: rgba(255,248,240,0.5); font-size: 13px; margin-bottom: 20px;">
        The tagline appears on your homepage and feed — it's the first thing visitors see.
      </p>

      <div class="form-group" style="margin-bottom: 16px;">
        <textarea id="taglineInput" rows="2"
          style="width: 100%; padding: 12px 16px; border: 1px solid rgba(255,248,240,0.15); border-radius: 10px; font-size: 15px; font-family: 'DM Sans', sans-serif; background: rgba(255,248,240,0.06); color: #FFF8F0; outline: none; resize: vertical; min-height: 60px; line-height: 1.6; transition: border-color 0.2s;"
          placeholder="Enter your tagline..."
        >${escapeHtml(settings.tagline)}</textarea>
      </div>

      <div style="display: flex; gap: 12px; align-items: center;">
        <button onclick="saveTagline()" class="btn btn-primary" style="padding: 10px 28px;" id="taglineSaveBtn">
          Save Tagline
        </button>
        <button onclick="resetTagline()" style="padding: 8px 16px; border-radius: 50px; border: 1px solid rgba(255,248,240,0.12); background: transparent; color: rgba(255,248,240,0.5); font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;">
          Reset to Default
        </button>
        <span id="taglineStatus" style="font-size: 13px; color: #6aba6a; opacity: 0; transition: opacity 0.3s;"></span>
      </div>
    </div>

    <!-- ═══ PHOTOS ═══ -->
    <div class="card" style="margin-bottom: 28px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <span style="font-size: 20px;">&#128247;</span>
        <h3 style="font-size: 18px; margin: 0;">Photos</h3>
      </div>
      <p style="color: rgba(255,248,240,0.5); font-size: 13px; margin-bottom: 28px;">
        Update your banner and profile photo. Changes appear across the entire site instantly.
      </p>

      <!-- Banner -->
      <div style="margin-bottom: 32px;">
        <label style="display: block; font-size: 13px; font-weight: 600; color: rgba(255,248,240,0.7); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Banner Image</label>
        <div id="bannerPreview" style="position: relative; width: 100%; height: 160px; border-radius: 14px; overflow: hidden; margin-bottom: 12px; border: 1px solid rgba(255,248,240,0.1); cursor: pointer; transition: border-color 0.2s;" onclick="document.getElementById('bannerFileInput').click()">
          <img id="bannerImg" src="${escapeAttr(settings.banner_url)}" alt="Banner" style="width: 100%; height: 100%; object-fit: cover;">
          <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
            <span style="color: white; font-size: 14px; font-weight: 500; background: rgba(0,0,0,0.5); padding: 8px 20px; border-radius: 50px;">Click to change</span>
          </div>
        </div>
        <input type="file" id="bannerFileInput" accept="image/jpeg,image/png,image/webp" style="display: none;" onchange="uploadSiteImage('banner')">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span id="bannerStatus" style="font-size: 12px; color: rgba(255,248,240,0.4);"></span>
        </div>
      </div>

      <!-- Profile Photo -->
      <div>
        <label style="display: block; font-size: 13px; font-weight: 600; color: rgba(255,248,240,0.7); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Profile Photo</label>
        <div style="display: flex; align-items: center; gap: 20px;">
          <div id="profilePreview" style="position: relative; width: 96px; height: 96px; border-radius: 50%; overflow: hidden; border: 3px solid rgba(255,248,240,0.3); cursor: pointer; flex-shrink: 0; transition: border-color 0.2s;" onclick="document.getElementById('profileFileInput').click()">
            <img id="profileImg" src="${escapeAttr(settings.profile_photo_url)}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
              <span style="color: white; font-size: 11px; font-weight: 500;">Change</span>
            </div>
          </div>
          <div>
            <button onclick="document.getElementById('profileFileInput').click()" style="padding: 8px 20px; border-radius: 50px; border: 1px solid rgba(255,248,240,0.15); background: rgba(255,248,240,0.06); color: rgba(255,248,240,0.8); font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;">
              Upload New Photo
            </button>
            <p style="font-size: 12px; color: rgba(255,248,240,0.35); margin-top: 8px;">Square photos work best</p>
            <span id="profileStatus" style="font-size: 12px; color: rgba(255,248,240,0.4);"></span>
          </div>
        </div>
        <input type="file" id="profileFileInput" accept="image/jpeg,image/png,image/webp" style="display: none;" onchange="uploadSiteImage('profile')">
      </div>
    </div>

    <!-- ═══ COLORS ═══ -->
    <div class="card" style="margin-bottom: 28px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <span style="font-size: 20px;">&#127912;</span>
        <h3 style="font-size: 18px; margin: 0;">Colors</h3>
      </div>
      <p style="color: rgba(255,248,240,0.5); font-size: 13px; margin-bottom: 28px;">
        Set the background and accent colors for the entire site.
      </p>

      <!-- Background Color -->
      <div style="margin-bottom: 32px; padding-bottom: 28px; border-bottom: 1px solid rgba(255,248,240,0.08);">
        <label style="display: block; font-size: 13px; font-weight: 600; color: rgba(255,248,240,0.7); margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px;">Background</label>

        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
          <div>
            <input type="color" id="bgColorPicker" value="${settings.bg_color}"
              style="width: 56px; height: 42px; border: 2px solid rgba(255,248,240,0.2); border-radius: 10px; cursor: pointer; background: transparent; padding: 2px;">
          </div>
          <div>
            <input type="text" id="bgColorHex" value="${settings.bg_color}"
              style="width: 100px; padding: 8px 12px; border: 1px solid rgba(255,248,240,0.15); border-radius: 8px; font-size: 14px; font-family: 'DM Sans', monospace; background: rgba(255,248,240,0.06); color: #FFF8F0; outline: none;">
          </div>
          <div id="bgPreviewSwatch" style="width: 100px; height: 42px; border-radius: 10px; border: 1px solid rgba(255,248,240,0.12); background: linear-gradient(180deg, ${gradientTop} 0%, ${settings.bg_color} 100%);"></div>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
          <button onclick="setBgPreset('#220D12')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #220D12; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Default</button>
          <button onclick="setBgPreset('#1A0609')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #1A0609; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Darker</button>
          <button onclick="setBgPreset('#2D1520')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #2D1520; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Warmer</button>
          <button onclick="setBgPreset('#1A1225')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #1A1225; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Plum</button>
          <button onclick="setBgPreset('#0D1A1A')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #0D1A1A; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Teal</button>
          <button onclick="setBgPreset('#1A1A0D')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #1A1A0D; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Olive</button>
        </div>
      </div>

      <!-- Text Color -->
      <div style="margin-bottom: 32px; padding-bottom: 28px; border-bottom: 1px solid rgba(255,248,240,0.08);">
        <label style="display: block; font-size: 13px; font-weight: 600; color: rgba(255,248,240,0.7); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Text Color</label>
        <p style="color: rgba(255,248,240,0.4); font-size: 12px; margin-bottom: 14px;">The color used for all body text and headings across the site.</p>

        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
          <div>
            <input type="color" id="textColorPicker" value="${settings.text_color}"
              style="width: 56px; height: 42px; border: 2px solid rgba(255,248,240,0.2); border-radius: 10px; cursor: pointer; background: transparent; padding: 2px;">
          </div>
          <div>
            <input type="text" id="textColorHex" value="${settings.text_color}"
              style="width: 100px; padding: 8px 12px; border: 1px solid rgba(255,248,240,0.15); border-radius: 8px; font-size: 14px; font-family: 'DM Sans', monospace; background: rgba(255,248,240,0.06); color: #FFF8F0; outline: none;">
          </div>
          <div id="textPreviewSwatch" style="padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,248,240,0.12); background: rgba(0,0,0,0.3); font-size: 14px; color: ${settings.text_color};">
            Sample text
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="setTextPreset('#FFF8F0')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #1A0609; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Cream</button>
          <button onclick="setTextPreset('#FFFFFF')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #1A0609; color: #FFFFFF; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">White</button>
          <button onclick="setTextPreset('#F5E6D3')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #1A0609; color: #F5E6D3; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Warm</button>
          <button onclick="setTextPreset('#E8D5B7')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #1A0609; color: #E8D5B7; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Sand</button>
          <button onclick="setTextPreset('#D4E4D4')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #1A0609; color: #D4E4D4; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Sage</button>
        </div>
      </div>

      <!-- Accent Color -->
      <div style="margin-bottom: 24px;">
        <label style="display: block; font-size: 13px; font-weight: 600; color: rgba(255,248,240,0.7); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Accent Color</label>
        <p style="color: rgba(255,248,240,0.4); font-size: 12px; margin-bottom: 14px;">Used for buttons and interactive elements across the site.</p>

        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;">
          <div>
            <input type="color" id="accentColorPicker" value="${settings.accent_color}"
              style="width: 56px; height: 42px; border: 2px solid rgba(255,248,240,0.2); border-radius: 10px; cursor: pointer; background: transparent; padding: 2px;">
          </div>
          <div>
            <input type="text" id="accentColorHex" value="${settings.accent_color}"
              style="width: 100px; padding: 8px 12px; border: 1px solid rgba(255,248,240,0.15); border-radius: 8px; font-size: 14px; font-family: 'DM Sans', monospace; background: rgba(255,248,240,0.06); color: #FFF8F0; outline: none;">
          </div>
          <div id="accentPreviewSwatch" style="width: 100px; height: 42px; border-radius: 10px; background: ${settings.accent_color}; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">BUTTON</span>
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button onclick="setAccentPreset('#C0392B')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #C0392B; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Tomato</button>
          <button onclick="setAccentPreset('#722F37')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #722F37; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Wine</button>
          <button onclick="setAccentPreset('#B7410E')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #B7410E; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Rust</button>
          <button onclick="setAccentPreset('#D4A853')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #D4A853; color: #1A0609; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Gold</button>
          <button onclick="setAccentPreset('#2D6A4F')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #2D6A4F; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Forest</button>
          <button onclick="setAccentPreset('#5B4A9E')" class="color-preset" style="padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.12); background: #5B4A9E; color: #FFF8F0; font-size: 11px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Violet</button>
        </div>
      </div>

      <div style="display: flex; gap: 12px; align-items: center; margin-top: 24px;">
        <button id="colorSaveBtn" onclick="saveColors()" class="btn btn-primary" style="padding: 10px 28px;">
          Save Colors
        </button>
        <button onclick="resetColors()" style="padding: 8px 16px; border-radius: 50px; border: 1px solid rgba(255,248,240,0.12); background: transparent; color: rgba(255,248,240,0.5); font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;">
          Reset to Defaults
        </button>
        <span id="colorStatus" style="font-size: 13px; color: #6aba6a; opacity: 0; transition: opacity 0.3s;"></span>
      </div>
    </div>

    <!-- ═══ TYPOGRAPHY ═══ -->
    <div class="card" style="margin-bottom: 28px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <span style="font-size: 20px;">&#9000;</span>
        <h3 style="font-size: 18px; margin: 0;">Typography</h3>
      </div>
      <p style="color: rgba(255,248,240,0.5); font-size: 13px; margin-bottom: 28px;">
        Choose a font pairing for your site. Headlines use the serif font, body text uses the sans-serif.
      </p>

      <div style="display: grid; gap: 12px;" id="fontPairingGrid">
        ${Object.entries(FONT_PAIRINGS).map(([key, pairing]) => `
          <label style="display: block; cursor: pointer;">
            <div id="fontCard-${key}" onclick="selectFont('${key}')" style="padding: 20px 24px; border-radius: 12px; border: 2px solid ${settings.font_pairing === key ? 'rgba(255,248,240,0.4)' : 'rgba(255,248,240,0.08)'}; background: ${settings.font_pairing === key ? 'rgba(255,248,240,0.08)' : 'rgba(255,248,240,0.02)'}; transition: all 0.2s; position: relative;">
              ${settings.font_pairing === key ? '<span style="position: absolute; top: 12px; right: 16px; font-size: 14px; color: rgba(255,248,240,0.6);">&#10003;</span>' : ''}
              <div style="font-size: 11px; font-weight: 600; color: rgba(255,248,240,0.5); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">${pairing.label}</div>
              <div style="font-family: ${pairing.heading}; font-size: 26px; font-weight: 500; color: #FFF8F0; margin-bottom: 6px; line-height: 1.2;">Sunday Sauce</div>
              <div style="font-family: ${pairing.body}; font-size: 14px; color: rgba(255,248,240,0.65); line-height: 1.6;">Thoughts and curations of things I care about and think are nice.</div>
            </div>
          </label>
        `).join('')}
      </div>

      <div style="display: flex; gap: 12px; align-items: center; margin-top: 20px;">
        <button id="fontSaveBtn" onclick="saveFont()" class="btn btn-primary" style="padding: 10px 28px;">
          Save Font
        </button>
        <span id="fontStatus" style="font-size: 13px; color: #6aba6a; opacity: 0; transition: opacity 0.3s;"></span>
      </div>
    </div>

    <p style="margin-top: 16px;"><a href="/admin" style="font-size: 14px; color: rgba(255,248,240,0.5);">&larr; Back to dashboard</a></p>

    <script>
    (function() {
      // ── Helpers ──
      function lighten(hex, factor) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, Math.round(r * factor));
        g = Math.min(255, Math.round(g * factor));
        b = Math.min(255, Math.round(b * factor));
        return '#' + [r, g, b].map(function(c) { return c.toString(16).padStart(2, '0'); }).join('');
      }

      function saveSetting(data, btnId, statusId, successMsg) {
        var btn = document.getElementById(btnId);
        var status = document.getElementById(statusId);
        var origText = btn.innerHTML;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        fetch('/admin/appearance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          btn.innerHTML = origText;
          btn.disabled = false;
          if (d.success) {
            status.textContent = successMsg || 'Saved!';
            status.style.opacity = '1';
            setTimeout(function() { status.style.opacity = '0'; }, 3000);
          } else {
            alert('Error: ' + (d.error || 'Unknown error'));
          }
        })
        .catch(function(err) {
          btn.innerHTML = origText;
          btn.disabled = false;
          alert('Network error: ' + err.message);
        });
      }

      function showStatus(id, msg) {
        var el = document.getElementById(id);
        el.textContent = msg;
        el.style.color = '#6aba6a';
      }

      // ── Tagline ──
      var defaultTagline = ${JSON.stringify(DEFAULTS.tagline)};

      window.saveTagline = function() {
        var val = document.getElementById('taglineInput').value.trim();
        if (!val) { alert('Tagline cannot be empty'); return; }
        saveSetting({ tagline: val }, 'taglineSaveBtn', 'taglineStatus', 'Tagline saved! Visitors will see it immediately.');
      };

      window.resetTagline = function() {
        document.getElementById('taglineInput').value = defaultTagline;
      };

      // ── Background Color ──
      var bgPicker = document.getElementById('bgColorPicker');
      var bgHex = document.getElementById('bgColorHex');
      var bgSwatch = document.getElementById('bgPreviewSwatch');

      function updateBgPreview(color) {
        var top = lighten(color, 1.6);
        bgSwatch.style.background = 'linear-gradient(180deg, ' + top + ' 0%, ' + color + ' 100%)';
        document.body.style.backgroundColor = color;
        document.body.style.backgroundImage = 'linear-gradient(180deg, ' + top + ' 0%, ' + color + ' 100%)';
      }

      bgPicker.addEventListener('input', function() {
        bgHex.value = bgPicker.value;
        updateBgPreview(bgPicker.value);
      });
      bgHex.addEventListener('input', function() {
        if (/^#[0-9a-fA-F]{6}$/.test(bgHex.value.trim())) {
          bgPicker.value = bgHex.value.trim();
          updateBgPreview(bgHex.value.trim());
        }
      });

      window.setBgPreset = function(color) {
        bgPicker.value = color;
        bgHex.value = color;
        updateBgPreview(color);
      };

      // ── Accent Color ──
      var accentPicker = document.getElementById('accentColorPicker');
      var accentHex = document.getElementById('accentColorHex');
      var accentSwatch = document.getElementById('accentPreviewSwatch');

      function updateAccentPreview(color) {
        accentSwatch.style.background = color;
      }

      accentPicker.addEventListener('input', function() {
        accentHex.value = accentPicker.value;
        updateAccentPreview(accentPicker.value);
      });
      accentHex.addEventListener('input', function() {
        if (/^#[0-9a-fA-F]{6}$/.test(accentHex.value.trim())) {
          accentPicker.value = accentHex.value.trim();
          updateAccentPreview(accentHex.value.trim());
        }
      });

      window.setAccentPreset = function(color) {
        accentPicker.value = color;
        accentHex.value = color;
        updateAccentPreview(color);
      };

      // ── Text Color ──
      var textPicker = document.getElementById('textColorPicker');
      var textHex = document.getElementById('textColorHex');
      var textSwatch = document.getElementById('textPreviewSwatch');

      function updateTextPreview(color) {
        textSwatch.style.color = color;
      }

      textPicker.addEventListener('input', function() {
        textHex.value = textPicker.value;
        updateTextPreview(textPicker.value);
      });
      textHex.addEventListener('input', function() {
        if (/^#[0-9a-fA-F]{6}$/.test(textHex.value.trim())) {
          textPicker.value = textHex.value.trim();
          updateTextPreview(textHex.value.trim());
        }
      });

      window.setTextPreset = function(color) {
        textPicker.value = color;
        textHex.value = color;
        updateTextPreview(color);
      };

      // ── Save / Reset Colors ──
      window.saveColors = function() {
        var bg = bgHex.value.trim();
        var accent = accentHex.value.trim();
        var text = textHex.value.trim();
        if (!/^#[0-9a-fA-F]{6}$/.test(bg)) { alert('Invalid background color'); return; }
        if (!/^#[0-9a-fA-F]{6}$/.test(accent)) { alert('Invalid accent color'); return; }
        if (!/^#[0-9a-fA-F]{6}$/.test(text)) { alert('Invalid text color'); return; }
        saveSetting({ bg_color: bg, accent_color: accent, text_color: text }, 'colorSaveBtn', 'colorStatus', 'Colors saved! All visitors will see this immediately.');
      };

      window.resetColors = function() {
        window.setBgPreset('${DEFAULTS.bg_color}');
        window.setAccentPreset('${DEFAULTS.accent_color}');
        window.setTextPreset('${DEFAULTS.text_color}');
      };

      // ── Font Pairing ──
      var selectedFont = '${settings.font_pairing}';

      window.selectFont = function(key) {
        // Deselect all
        document.querySelectorAll('[id^="fontCard-"]').forEach(function(el) {
          el.style.border = '2px solid rgba(255,248,240,0.08)';
          el.style.background = 'rgba(255,248,240,0.02)';
          var check = el.querySelector('span[style*="position: absolute"]');
          if (check) check.remove();
        });
        // Select chosen
        var card = document.getElementById('fontCard-' + key);
        card.style.border = '2px solid rgba(255,248,240,0.4)';
        card.style.background = 'rgba(255,248,240,0.08)';
        var checkmark = document.createElement('span');
        checkmark.style.cssText = 'position: absolute; top: 12px; right: 16px; font-size: 14px; color: rgba(255,248,240,0.6);';
        checkmark.innerHTML = '&#10003;';
        card.appendChild(checkmark);
        selectedFont = key;
      };

      window.saveFont = function() {
        saveSetting({ font_pairing: selectedFont }, 'fontSaveBtn', 'fontStatus', 'Font saved! Refresh to see the change across the site.');
      };

      // ── Photo Upload ──
      window.uploadSiteImage = function(type) {
        var fileInput = document.getElementById(type === 'banner' ? 'bannerFileInput' : 'profileFileInput');
        var statusId = type === 'banner' ? 'bannerStatus' : 'profileStatus';
        var file = fileInput.files[0];
        if (!file) return;

        // Validate
        if (file.size > 10 * 1024 * 1024) {
          alert('Image is too large. Please use an image under 10MB.');
          return;
        }

        var statusEl = document.getElementById(statusId);
        statusEl.textContent = 'Uploading...';
        statusEl.style.color = 'rgba(255,248,240,0.6)';

        var formData = new FormData();
        formData.append('file', file);

        fetch('/admin/upload', { method: 'POST', body: formData })
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (!data.success) {
              statusEl.textContent = 'Upload failed: ' + (data.error || 'Unknown error');
              statusEl.style.color = '#e6a09a';
              return;
            }

            // Update preview
            var imgEl = document.getElementById(type === 'banner' ? 'bannerImg' : 'profileImg');
            imgEl.src = data.url;

            // Save URL to settings
            var settingKey = type === 'banner' ? 'banner_url' : 'profile_photo_url';
            var saveData = {};
            saveData[settingKey] = data.url;

            return fetch('/admin/appearance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(saveData)
            }).then(function(r) { return r.json(); });
          })
          .then(function(result) {
            if (result && result.success) {
              statusEl.textContent = 'Updated! Change is live across the site.';
              statusEl.style.color = '#6aba6a';
              setTimeout(function() { statusEl.textContent = ''; }, 4000);
            }
          })
          .catch(function(err) {
            statusEl.textContent = 'Error: ' + err.message;
            statusEl.style.color = '#e6a09a';
          });
      };
    })();
    </script>
  `;
  return layout('Appearance', content);
}
