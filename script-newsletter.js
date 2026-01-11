/* script-newsletter.js
   A more “Research Library”-like rendering:
   - Each study is a card with clear spacing (“frame”)
   - Summary + commentary are shown directly (no details/triangles)
   - Link is rendered as a small rounded button (btn-mini style)
   - Uses existing /newsletter_data/ JSON files

   Supported filenames:
     /newsletter_data/YYYY.MM.json
     /newsletter_data/YYYY-MM.json
     /newsletter_data/YYYY_MM.json
*/

const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const newsletterContent = document.getElementById("newsletterContent");
const loadBtn = document.getElementById("loadNewsletterBtn");

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildCandidateUrls(year, month) {
  return [
    `/newsletter_data/${year}.${month}.json`,
    `/newsletter_data/${year}-${month}.json`,
    `/newsletter_data/${year}_${month}.json`
  ];
}

function ensureNewsletterStyles() {
  if (document.getElementById("newsletter-ui-styles")) return;

  const style = document.createElement("style");
  style.id = "newsletter-ui-styles";
  style.textContent = `
    /* Container */
    .nl-wrap { max-width: 1100px; margin: 0 auto; padding: 24px 18px 56px; }
    .nl-head { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; flex-wrap:wrap; }
    .nl-head h2 { margin: 0; font-size: 20px; }
    .nl-meta { font-size: 12px; opacity: .75; }

    /* Panel frame */
    .nl-panel {
      margin-top: 14px;
      border-radius: 18px;
      padding: 16px;
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.05);
    }

    /* Editorial + closing frames */
    .nl-frame {
      border: 1px solid rgba(255,255,255,0.10);
      background: rgba(255,255,255,0.04);
      border-radius: 18px;
      padding: 16px;
      margin-top: 12px;
    }

    .nl-kicker { font-size: 12px; opacity: .75; margin: 0 0 8px 0; letter-spacing: .04em; text-transform: uppercase; }
    .nl-frame p { margin: 0; line-height: 1.6; font-size: 13.5px; opacity: .90; }

    /* Grid */
    .nl-grid {
      margin-top: 14px;
      display:grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (max-width: 980px) { .nl-grid { grid-template-columns: 1fr; } }

    /* Study card (frame) */
    .nl-card {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.04);
      border-radius: 18px;
      padding: 16px;
      transition: transform .12s ease, background .12s ease, border-color .12s ease;
    }
    .nl-card:hover { transform: translateY(-2px); background: rgba(255,255,255,0.06); border-color: rgba(91,194,231,0.35); }

    /* Top row */
    .nl-top { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
    .badge-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }

    .badge {
      font-size: 11px;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.03);
      opacity: .90;
      white-space: nowrap;
    }

    /* Button link (library-style) */
    .btn-mini {
      display:inline-flex;
      align-items:center;
      gap:8px;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 999px;
      padding: 7px 11px;
      background: rgba(255,255,255,0.03);
      color: inherit;
      font-size: 11px;
      opacity: .92;
      cursor: pointer;
      text-decoration: none;
      line-height: 1;
      user-select:none;
      white-space: nowrap;
    }
    .btn-mini:hover { border-color: rgba(91,194,231,0.45); opacity: 1; text-decoration:none; }

    .btn-mini.pub {
      border-color: rgba(119,242,183,0.35);
      background: rgba(119,242,183,0.08);
    }

    .btn-mini.disabled {
      opacity: .55;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Title + text */
    .nl-title { margin: 12px 0 0; font-size: 14.5px; line-height: 1.25; }
    .nl-text { margin-top: 10px; font-size: 13px; line-height: 1.65; opacity: .88; }
    .nl-text p { margin: 0; }

    .nl-block { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.10); }
    .nl-label { font-size: 12px; opacity: .75; margin: 0 0 6px 0; }

    .loading { opacity: .85; }
    .muted { opacity: .75; }

    .error {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.04);
      border-radius: 18px;
      padding: 16px;
      margin-top: 14px;
    }
    .error h3 { margin: 0 0 6px 0; font-size: 15px; }
    .error p { margin: 0; opacity: .85; line-height: 1.6; }
    details { margin-top: 10px; }
    details summary { cursor: pointer; opacity: .85; }
    code { font-size: 12px; }
  `;
  document.head.appendChild(style);
}

function renderError(title, message, triedUrls = []) {
  const tried = triedUrls.length
    ? `<details>
         <summary>Paths tried</summary>
         <ul>
           ${triedUrls.map(u => `<li><code>${escapeHtml(u)}</code></li>`).join("")}
         </ul>
       </details>`
    : "";

  newsletterContent.innerHTML = `
    <div class="nl-wrap">
      <div class="error">
        <h3>${escapeHtml(title)}</h3>
        <p class="muted">${escapeHtml(message)}</p>
        ${tried}
      </div>
    </div>
  `;
}

function renderNewsletter(data) {
  ensureNewsletterStyles();

  const issueLabel = `${data.month ?? ""} ${data.year ?? ""}`.trim();
  const studies = Array.isArray(data.studies) ? data.studies : [];

  const studiesHtml = studies.map((s) => {
    const link = typeof s.link === "string" ? s.link.trim() : "";
    const hasLink = link.length > 0;

    const linkBtn = hasLink
      ? `<a class="btn-mini pub" href="${link}" target="_blank" rel="noopener noreferrer">Read study</a>`
      : `<span class="btn-mini disabled" aria-disabled="true">Link not available</span>`;

    const summary = s.summary
      ? `
        <div class="nl-block">
          <div class="nl-label">Summary</div>
          <div class="nl-text"><p>${escapeHtml(s.summary)}</p></div>
        </div>
      `
      : "";

    const commentary = s.commentary
      ? `
        <div class="nl-block">
          <div class="nl-label">Commentary</div>
          <div class="nl-text"><p>${escapeHtml(s.commentary)}</p></div>
        </div>
      `
      : "";

    return `
      <article class="nl-card">
        <div class="nl-top">
          <div class="badge-row">
            <span class="badge">Study ${escapeHtml(String(s.number ?? ""))}</span>
          </div>
          ${linkBtn}
        </div>

        <h3 class="nl-title">${escapeHtml(s.title ?? "")}</h3>

        ${summary}
        ${commentary}
      </article>
    `;
  }).join("");

  newsletterContent.innerHTML = `
    <div class="nl-wrap">
      <div class="nl-head">
        <h2>${escapeHtml(data.title ?? "Newsletter")}</h2>
        <div class="nl-meta">${escapeHtml(issueLabel)} · ${studies.length} studies</div>
      </div>

      <div class="nl-panel">
        ${data.editorial ? `
          <div class="nl-frame">
            <div class="nl-kicker">Editorial</div>
            <p>${escapeHtml(data.editorial)}</p>
          </div>
        ` : ""}

        <div class="nl-grid">
          ${studiesHtml || `<p class="muted">No studies found in this issue.</p>`}
        </div>

        ${data.closing_note ? `
          <div class="nl-frame">
            <div class="nl-kicker">Closing note</div>
            <p>${escapeHtml(data.closing_note)}</p>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

async function loadNewsletter() {
  newsletterContent.innerHTML = `<p class="loading">Loading newsletter…</p>`;

  if (window.location.protocol === "file:") {
    renderError(
      "Cannot load newsletter",
      "This page must be served from a web server. Loading JSON files is blocked when using file://."
    );
    return;
  }

  const year = yearSelect?.value || "";
  const month = monthSelect?.value || "";
  const urls = buildCandidateUrls(year, month);

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const data = await res.json();
      renderNewsletter(data);
      console.info("Newsletter loaded from:", url);
      return;
    } catch {
      // try next
    }
  }

  renderError(
    "Newsletter not found",
    "No JSON file could be loaded for this issue. Check the filename and location in /newsletter_data/.",
    urls
  );
}

// Events
if (loadBtn) loadBtn.addEventListener("click", loadNewsletter);
if (yearSelect) yearSelect.addEventListener("change", loadNewsletter);
if (monthSelect) monthSelect.addEventListener("change", loadNewsletter);

window.addEventListener("DOMContentLoaded", () => {
  ensureNewsletterStyles();
  loadNewsletter();
});
