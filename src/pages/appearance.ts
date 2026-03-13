import { layout } from './layout';
import { DEFAULT_BG_COLOR, lightenColor } from '../lib/settings';

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

export function appearancePage(currentColor: string): string {
  const gradientTop = lightenColor(currentColor || DEFAULT_BG_COLOR, 1.6);

  const content = `
    ${adminNav()}
    <h1 style="font-size: 28px; margin-bottom: 32px;">Appearance</h1>

    <div class="card" style="margin-bottom: 32px;">
      <h3 style="font-size: 18px; margin-bottom: 20px;">Background Color</h3>
      <p style="color: rgba(255,248,240,0.6); font-size: 14px; margin-bottom: 24px;">
        Choose a background color for the entire site. The gradient is computed automatically.
      </p>

      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
        <div>
          <label style="display: block; font-size: 13px; color: rgba(255,248,240,0.6); margin-bottom: 8px;">Pick a color</label>
          <input type="color" id="bgColorPicker" value="${currentColor || DEFAULT_BG_COLOR}"
            style="width: 64px; height: 48px; border: 2px solid rgba(255,248,240,0.2); border-radius: 10px; cursor: pointer; background: transparent; padding: 2px;">
        </div>
        <div style="flex: 1;">
          <label style="display: block; font-size: 13px; color: rgba(255,248,240,0.6); margin-bottom: 8px;">Or enter hex</label>
          <input type="text" id="bgColorHex" value="${currentColor || DEFAULT_BG_COLOR}"
            style="width: 120px; padding: 10px 14px; border: 1px solid rgba(255,248,240,0.15); border-radius: 8px; font-size: 15px; font-family: 'DM Sans', monospace; background: rgba(255,248,240,0.08); color: #FFF8F0; outline: none;">
        </div>
        <div>
          <label style="display: block; font-size: 13px; color: rgba(255,248,240,0.6); margin-bottom: 8px;">Preview</label>
          <div id="previewSwatch" style="width: 120px; height: 48px; border-radius: 10px; border: 1px solid rgba(255,248,240,0.15); background: linear-gradient(180deg, ${gradientTop} 0%, ${currentColor || DEFAULT_BG_COLOR} 100%);"></div>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
        <button onclick="setPreset('#220D12')" style="padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.15); background: #220D12; color: #FFF8F0; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Current</button>
        <button onclick="setPreset('#1A0609')" style="padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.15); background: #1A0609; color: #FFF8F0; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Darker</button>
        <button onclick="setPreset('#2D1520')" style="padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.15); background: #2D1520; color: #FFF8F0; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Warmer</button>
        <button onclick="setPreset('#1A1225')" style="padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.15); background: #1A1225; color: #FFF8F0; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Plum</button>
        <button onclick="setPreset('#0D1A1A')" style="padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.15); background: #0D1A1A; color: #FFF8F0; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Teal</button>
        <button onclick="setPreset('#1A1A0D')" style="padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,248,240,0.15); background: #1A1A0D; color: #FFF8F0; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif;">Olive</button>
      </div>

      <div style="display: flex; gap: 12px; align-items: center;">
        <button id="saveBtn" onclick="saveBgColor()" class="btn btn-primary" style="padding: 12px 32px;">
          Save &amp; Apply
        </button>
        <button onclick="resetToDefault()" style="padding: 10px 20px; border-radius: 50px; border: 1px solid rgba(255,248,240,0.15); background: transparent; color: rgba(255,248,240,0.7); font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif;">
          Reset to Default
        </button>
        <span id="saveStatus" style="font-size: 13px; color: #6aba6a; opacity: 0; transition: opacity 0.3s;"></span>
      </div>
    </div>

    <p style="margin-top: 16px;"><a href="/admin" style="font-size: 14px; color: rgba(255,248,240,0.65);">&larr; Back to dashboard</a></p>

    <script>
    (function() {
      var picker = document.getElementById('bgColorPicker');
      var hexInput = document.getElementById('bgColorHex');
      var swatch = document.getElementById('previewSwatch');
      var saveStatus = document.getElementById('saveStatus');
      var defaultColor = '${DEFAULT_BG_COLOR}';

      function lighten(hex, factor) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, Math.round(r * factor));
        g = Math.min(255, Math.round(g * factor));
        b = Math.min(255, Math.round(b * factor));
        return '#' + [r, g, b].map(function(c) { return c.toString(16).padStart(2, '0'); }).join('');
      }

      function updatePreview(color) {
        var top = lighten(color, 1.6);
        swatch.style.background = 'linear-gradient(180deg, ' + top + ' 0%, ' + color + ' 100%)';
        // Live preview on page
        document.body.style.backgroundColor = color;
        document.body.style.backgroundImage = 'linear-gradient(180deg, ' + top + ' 0%, ' + color + ' 100%)';
      }

      picker.addEventListener('input', function() {
        hexInput.value = picker.value;
        updatePreview(picker.value);
      });

      hexInput.addEventListener('input', function() {
        var val = hexInput.value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
          picker.value = val;
          updatePreview(val);
        }
      });

      window.setPreset = function(color) {
        picker.value = color;
        hexInput.value = color;
        updatePreview(color);
      };

      window.resetToDefault = function() {
        window.setPreset(defaultColor);
      };

      window.saveBgColor = function() {
        var color = hexInput.value.trim();
        if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
          alert('Please enter a valid hex color (e.g. #220D12)');
          return;
        }

        var btn = document.getElementById('saveBtn');
        btn.textContent = 'Saving...';
        btn.disabled = true;

        fetch('/admin/appearance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bg_color: color })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          btn.innerHTML = 'Save &amp; Apply';
          btn.disabled = false;
          if (data.success) {
            saveStatus.textContent = 'Saved! All visitors will see this color now.';
            saveStatus.style.opacity = '1';
            setTimeout(function() { saveStatus.style.opacity = '0'; }, 3000);
          } else {
            alert('Error: ' + (data.error || 'Unknown error'));
          }
        })
        .catch(function(err) {
          btn.innerHTML = 'Save &amp; Apply';
          btn.disabled = false;
          alert('Network error: ' + err.message);
        });
      };
    })();
    </script>
  `;
  return layout('Appearance', content);
}
