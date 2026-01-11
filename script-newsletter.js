/* script-newsletter.js
   Newsletter loader + library-style rendering for studies.
   JSON files are expected in: /newsletter_data/
   Supported filename patterns:
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
    <div class="error">
      <h3>${escapeHtml(title)}</h3>
      <p class="muted">${escapeHtml(message)}</p>
      ${tried}
    </div>
  `;
}

/**
 * Renders the newsletter with "Research Library" style cards:
 * - Each study is a separate card (block)
 * - Badge with study number
 * - "Read study" button using s.link
 * - Collapsible sections for Summary and Commentary
 */
function renderNewsletter(data) {
  const issueLabel = `${data.month ?? ""} ${data.year ?? ""}`.trim();
  const studies = Array.isArray(data.studies) ? data.studies : [];

  const studiesHtml = studies.map((s) => {
    const link = typeof s.link === "string" ? s.link.trim() : "";
    const hasLink = link.length > 0;

    const statusBtn = hasLink
      ? `<a class="status-btn pub" href="${link}" target="_blank" rel="noopener noreferrer">Read study ↗</a>`
      : `<span class="status-btn disabled" aria-disabled="true">Link not available</span>`;

    const summaryBlock = s.summary
      ? `
        <details class="findings" open>
          <summary>Summary</summary>
          <div class="findings-body">
            <p>${escapeHtml(s.summary)}</p>
          </div>
        </details>
      `
      : "";

    const commentaryBlock = s.commentary
      ? `
        <details class="findings">
          <summary>Commentary</summary>
          <div class="findings-body">
            <p>${escapeHtml(s.commentary)}</p>
          </div>
        </details>
      `
      : "";

    return `
      <article class="nl-card">
        <div class="study-top">
          <div class="badge-row">
            <span class="badge">Study ${escapeHtml(String(s.number ?? ""))}</span>
          </div>
          ${statusBtn}
        </div>

        <h3 class="study-title">${escapeHtml(s.title ?? "")}</h3>

        ${summaryBlock}
        ${commentaryBlock}
      </article>
    `;
  }).join("");

  newsletterContent.innerHTML = `
    <section class="issue">
      <header class="issue__header">
        <div class="issue__kicker">Newsletter issue</div>
        <h2 class="issue__title">
          ${escapeHtml(data.title ?? "Newsletter")}${issueLabel ? ` — ${escapeHtml(issueLabel)}` : ""}
        </h2>
      </header>

      ${data.editorial ? `
        <section class="issue__editorial">
          <div class="label">Editorial</div>
          <p>${escapeHtml(data.editorial)}</p>
        </section>
      ` : ""}

      <section class="issue__studies">
        <h3 class="issue__section-title">Studies</h3>
        <div class="nl-grid">
          ${studiesHtml || `<p class="muted">No studies found in this issue.</p>`}
        </div>
      </section>

      ${data.closing_note ? `
        <section class="issue__closing">
          <div class="label">Closing note</div>
          <p>${escapeHtml(data.closing_note)}</p>
        </section>
      ` : ""}
    </section>
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

window.addEventListener("DOMContentLoaded", loadNewsletter);
