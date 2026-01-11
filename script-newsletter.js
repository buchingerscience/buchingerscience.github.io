/* script-newsletter.js
   Final version – corrected to load JSON files from:
   /newsletter_data/
   (folder located directly at the root of the repository)
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

/**
 * Expected JSON filenames inside /newsletter_data/
 * You can keep any ONE of these conventions:
 *   2025.12.json
 *   2025-12.json
 *   2025_12.json
 */
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

function renderNewsletter(data) {
  const issueLabel = `${data.month ?? ""} ${data.year ?? ""}`.trim();

  const studiesHtml = (data.studies || []).map(s => {
    const link = (s.link || "").trim();

    return `
      <article class="study-card">
        <div class="study-card__meta">Study ${escapeHtml(s.number)}</div>
        <h3 class="study-card__title">${escapeHtml(s.title)}</h3>

        <p class="study-card__summary">${escapeHtml(s.summary)}</p>

        ${s.commentary ? `
          <div class="study-card__commentary">
            <div class="label">Commentary</div>
            <p>${escapeHtml(s.commentary)}</p>
          </div>
        ` : ""}

        <div class="study-card__actions">
          ${link
            ? `<a class="study-link" href="${link}" target="_blank" rel="noopener noreferrer">
                 Read study ↗
               </a>`
            : `<span class="study-link study-link--disabled">Link not available</span>`
          }
        </div>
      </article>
    `;
  }).join("");

  newsletterContent.innerHTML = `
    <section class="issue">
      <header class="issue__header">
        <div class="issue__kicker">Newsletter issue</div>
        <h2 class="issue__title">
          ${escapeHtml(data.title)} — ${escapeHtml(issueLabel)}
        </h2>
      </header>

      <section class="issue__editorial">
        <div class="label">Editorial</div>
        <p>${escapeHtml(data.editorial)}</p>
      </section>

      <section class="issue__studies">
        <h3>Studies</h3>
        <div class="study-grid">
          ${studiesHtml}
        </div>
      </section>

      <section class="issue__closing">
        <div class="label">Closing note</div>
        <p>${escapeHtml(data.closing_note)}</p>
      </section>
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

  const year = yearSelect.value;
  const month = monthSelect.value;
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
    "No JSON file could be loaded for this issue.",
    urls
  );
}

// Events
loadBtn.addEventListener("click", loadNewsletter);
yearSelect.addEventListener("change", loadNewsletter);
monthSelect.addEventListener("change", loadNewsletter);

window.addEventListener("DOMContentLoaded", loadNewsletter);
