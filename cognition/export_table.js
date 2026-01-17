/* export_table.js
 * Builds a simple annotated table + CSV/TSV export strings.
 * Place this file in /course/ next to cognition.html.
 */
export function buildResultsTable({ battery, tests }) {
  const results = battery?.results || {};

  // Define what to show per test (keeps table readable)
  const metricsSpec = {
    pvt:  { primary: ["medianRT_ms", "lapses_n"], label: "Alertness / vigilance" },
    gng:  { primary: ["commissionErrors_n", "omissionErrors_n", "dprime"], label: "Inhibitory control" },
    dsst: { primary: ["correct", "errors", "itemsPerMin", "medianRtMs"], label: "Processing speed" },
    tmtb: { primary: ["durationMs", "errors", "accuracy"], label: "Cognitive flexibility" },
    wm:   { primary: ["span"], label: "Working memory span" },
    dots: { primary: ["accuracy", "medianRtMs", "trialsAttempted"], label: "Perceptual accuracy" }
  };

  const rows = tests.map(t => {
    const r = results[t.id] || null;
    const spec = metricsSpec[t.id] || { primary: [], label: "" };

    const metrics = r?.metrics || {};
    const extra = r?.extra || {};

    // Build "key metrics" string
    const parts = [];
    for (const k of spec.primary) {
      if (metrics[k] !== undefined && metrics[k] !== null) parts.push(`${k}: ${metrics[k]}`);
      else if (extra[k] !== undefined && extra[k] !== null) parts.push(`${k}: ${extra[k]}`);
    }

    return {
      order: String(tests.indexOf(t) + 1),
      test: t.title,
      evaluates: spec.label || t.note,
      key_metrics: parts.length ? parts.join(" | ") : "—",
      saved_at: r?.savedAt || "—",
      note: t.note
    };
  });

  // Build HTML table
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th>Test</th>
        <th>Evaluates</th>
        <th>Key metrics</th>
        <th>Saved</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector("tbody");

  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="right">${escapeHtml(row.order)}</td>
      <td><strong>${escapeHtml(row.test)}</strong></td>
      <td>${escapeHtml(row.evaluates)}</td>
      <td class="mono">${escapeHtml(row.key_metrics)}</td>
      <td>${escapeHtml(row.saved_at)}</td>
    `;
    tbody.appendChild(tr);
  }

  // Build CSV/TSV (simple, reliable)
  const headers = ["order", "test", "evaluates", "key_metrics", "saved_at"];
  const csv = toDelimited(rows, headers, ",");
  const tsv = toDelimited(rows, headers, "\t");

  const noteHtml =
    `This table is a <strong>prototype summary</strong>. It is designed for within-person tracking during fasting.
     The most meaningful interpretation is the change across repeated sessions under similar conditions.`;

  return { tableEl: table, csv, tsv, noteHtml };
}

function toDelimited(rows, headers, delim) {
  const escape = (v) => {
    const s = (v === null || v === undefined) ? "" : String(v);
    if (delim === "," && (s.includes('"') || s.includes(",") || s.includes("\n"))) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    if (delim === "\t" && (s.includes("\t") || s.includes("\n"))) {
      // TSV: still quote if needed
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  };

  const lines = [];
  lines.push(headers.join(delim));
  for (const r of rows) {
    lines.push(headers.map(h => escape(r[h])).join(delim));
  }
  return lines.join("\n");
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
