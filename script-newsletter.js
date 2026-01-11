/* script-newsletter.js
   Robust loader:
   - Handles local file:// limitation with a clear message
   - Tries multiple common JSON filename conventions automatically
   - Renders study "Read study" links from `link`
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
  // Adjust or extend if you have a different naming convention.
  // The loader will try them in order.
  return [
    `newsletters/${year}.${month}.json`,   // e.g. 2025.12.json
    `newsletters/${year}-${month}.json`,   // e.g. 2025-12.json
    `newsletters/${year}_${month}.json`,   // e.g. 2025_12.json
    `newsletters/${year}/${month}.json`,   // e.g. 2025/12.json

    `newsletters/${year}.${month}.json`,
    `newsletters/${year}-${month}.json`,
    `newsletters/${year}_${month}.json`,
    `newsletters/${year}/${month}.json`
  ];
}

function renderError(title, message, triedUrls = []) {
  const tried = triedUrls.length
    ? `<details class="error-details">
         <summary>Show paths tried</summary>
         <ul class="error-list">
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

function renderNewsletter(data) {
  const issueLabel = `${data.month ?? ""} ${data.year ?? ""}`.trim();

  const studies = Array.isArray(data.studies) ? data.studies : [];
  const studiesHtml = studies.map((s) => {
    const link = typeof s.link === "string" ? s.link.trim() : "";
    const hasLink = link.length > 0;

    return `
      <article class="study-card">
        <div class="study-card__header">
          <div class="study-card__meta">Study ${escapeHtml(String(s.number ?? ""))}</div>
          <h3 class="study-card__title">${escapeHtml(s.title ?? "")}</h3>
        </div>

        ${s.summary ? `<p class="study-card__summary">${escapeHtml(s.summary)}</p>` : ""}

        ${s.commentary ? `
          <div class="study-card__commentary">
            <div class="label">Commentary</div>
            <p>${escapeHtml(s.commentary)}</p>
          </div>
        ` : ""}

        <div class="study-card__actions">
          ${hasLink ? `
            <a class="study-link" href="${link}" target="_blank" rel="noopener noreferrer">
              Read study <span aria-hidden="true">↗</span>
            </a>
          ` : `
            <span class="study-link study-link--disabled" title="Link not available">
              Link not available
            </span>
          `}
        </div>
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
        <div class="study-grid">
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

async function fetchFirstWorkingJson(urls) {
  const tried = [];

  for (const url of urls) {
    tried.push(url);

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const data = await res.json();
      return { data, tried, okUrl: url };
    } catch (_) {
      // Keep trying
    }
  }

  return { data: null, tried, okUrl: null };
}

async function loadNewsletter() {
  const year = yearSelect?.value || "";
  const month = monthSelect?.value || "";

  newsletterContent.innerHTML = `<p class="loading">Loading newsletter…</p>`;

  // Most frequent real-world failure: running from file://
  if (window.location.protocol === "file:") {
    renderError(
      "Cannot load newsletters from a local file URL",
      "Your browser blocks fetch() when this page is opened as file://. Please run the site from a local server (or your normal hosting) and reload this page.",
      []
    );
    return;
  }

  const candidates = buildCandidateUrls(year, month);
  const { data, tried, okUrl } = await fetchFirstWorkingJson(candidates);

  if (!data) {
    renderError(
      "Unable to load this issue",
      "No newsletter JSON file could be found at the expected paths. Check that the JSON exists and that its filename matches one of the tried patterns.",
      tried
    );
    return;
  }

  // Optional: small hint in the console to confirm what worked
  // eslint-disable-next-line no-console
  console.info("Loaded newsletter from:", okUrl);

  renderNewsletter(data);
}

// Events
if (loadBtn) loadBtn.addEventListener("click", loadNewsletter);

// Also load automatically when selectors change (more pleasant UX)
if (yearSelect) yearSelect.addEventListener("change", loadNewsletter);
if (monthSelect) monthSelect.addEventListener("change", loadNewsletter);

window.addEventListener("DOMContentLoaded", loadNewsletter);
