const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const container = document.getElementById("newsletterContent");

async function loadNewsletter() {
  const year = yearSelect.value;
  const month = monthSelect.value;

  // UPDATED: newsletter_data folder
  const file = `newsletter_data/${year}-${month}.json`;

  container.innerHTML = "<p class='loading'>Loading newsletter…</p>";

  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error("File not found");

    const data = await response.json();
    renderNewsletter(data);

  } catch (error) {
    container.innerHTML = "<p>No newsletter available for this month.</p>";
  }
}

function renderNewsletter(data) {
  let html = `
    <h2>${data.title}</h2>
    <p class="newsletter-meta">${data.month} ${data.year}</p>
    <p class="editorial">${data.editorial}</p>
  `;

  data.studies.forEach(study => {
    html += `
      <div class="study">
        <h3>${study.number}. ${study.title}</h3>
        <p>${study.summary}</p>
        ${study.commentary ? `<p class="commentary">${study.commentary}</p>` : ""}
        ${study.reference ? `<p class="reference">${study.reference}</p>` : ""}
      </div>
    `;
  });

  container.innerHTML = html;
}

yearSelect.addEventListener("change", loadNewsletter);
monthSelect.addEventListener("change", loadNewsletter);

// auto-load on page open
loadNewsletter();
