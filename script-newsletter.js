// script-newsletter.js

const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const newsletterContent = document.getElementById("newsletterContent");
const loadBtn = document.getElementById("loadNewsletterBtn");

// Update this to your real path pattern:
function getNewsletterUrl(year, month) {
  return `data/newsletters/${year}.${month}.json`;
}

function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderNewsletter(data) {
  const issueLabel = `${data.month} ${data.year}`;

  const studiesHtml = (data.studies || []).map((s) => {
    const hasLink = typeof s.link === "string" && s.link.trim().length > 0;

    return `
      <article class="study-card">
        <div class="study-card__header">
          <div class="study-card__meta">Study ${escapeHtml(String(s.number))}</div>
          <h3 class="study-card__title">${escapeHtml(s.title)}</h3>
        </div>

        <p class="study-card__summary">${escapeHtml(s.summary)}</p>

        ${s.commentary ? `
          <div class="study-card__commentary">
            <div class="label">Commentary</div>
            <p>${escapeHtml(s.commentary)}</p>
          </div>
        ` : ""}

        <div class="study-card__actions">
          ${hasLink ? `
            <a class="study-link" href="${s.link}" target="_blank" rel="noopener noreferrer">
              Read study
              <span aria-hidden="true">↗</span>
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
        <h2 class="issue__title">${escapeHtml(data.title || "Newsletter")} — ${escapeHtml(issueLabel)}</h2>
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

async function loadNewsletter() {
  const year = yearSelect.value;
  const month = monthSelect.value;

  newsletterContent.innerHTML = `<p class="loading">Loading newsletter…</p>`;

  try {
    const url = getNewsletterUrl(year, month);
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Could not load ${url}`);

    const data = await res.json();
    renderNewsletter(data);
  } catch (err) {
    newsletterContent.innerHTML = `
      <div class="error">
        <h3>Unable to load this issue</h3>
        <p class="muted">${escapeHtml(err.message || "Unknown error")}</p>
      </div>
    `;
  }
}

if (loadBtn) loadBtn.addEventListener("click", loadNewsletter);
window.addEventListener("DOMContentLoaded", loadNewsletter);
