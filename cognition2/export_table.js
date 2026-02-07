/* export_table.js
 * Builds a simple annotated table + CSV/TSV export strings.
 * Place this file in /course/ next to cognition.html.
 */
export function buildResultsTable({ battery, tests }) {
  const results = battery?.results || {};

  // Friendly labels for lay people
  const metricsSpec = {
    pvt:  { primary: ["medianRT_ms", "lapses_n"], label: "Reaction speed", format: { medianRT_ms: "Median reaction", lapses_n: "Slow responses" } },
    gng:  { primary: ["commissionErrors_n", "omissionErrors_n", "accuracy_pct"], label: "Impulse control", format: { commissionErrors_n: "False taps", omissionErrors_n: "Missed taps", accuracy_pct: "Accuracy" } },
    dsst: { primary: ["correct_n", "errors_n", "itemsPerMin", "medianRT_ms"], label: "Processing speed", format: { correct_n: "Correct", errors_n: "Errors", itemsPerMin: "Items/min", medianRT_ms: "Median speed" } },
    tmtb: { primary: ["completionTime_ms", "errors_n", "accuracy"], label: "Mental flexibility", format: { completionTime_ms: "Time", errors_n: "Errors", accuracy: "Accuracy" } },
    wm:   { primary: ["span"], label: "Memory span", format: { span: "Span" } },
    dots: { primary: ["accuracy", "medianRtMs", "trials"], label: "Perception", format: { accuracy: "Accuracy", medianRtMs: "Median speed", trials: "Trials" } }
  };

  const rows = tests.map(t => {
    const r = results[t.id] || null;
    const spec = metricsSpec[t.id] || { primary: [], label: "" };

    const metrics = r?.metrics || {};
    const extra = r?.extra || {};
    const fmt = spec.format || {};

    const parts = [];
    for (const k of spec.primary) {
      const val = metrics[k] ?? extra[k];
      if (val !== undefined && val !== null) {
        const label = fmt[k] || k;
        parts.push(`${label}: ${val}`);
      }
    }

    return {
      order: String(tests.indexOf(t) + 1),
      test: t.title || t.id,
      evaluates: spec.label || t.note,
      key_metrics: parts.length ? parts.join(" · ") : "—",
      saved_at: r?.savedAt ? new Date(r.savedAt).toLocaleString(undefined, { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" }) : "—",
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
        <th>Measures</th>
        <th>Results</th>
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

  // Build CSV/TSV
  const headers = ["order", "test", "evaluates", "key_metrics", "saved_at"];
  const csv = toDelimited(rows, headers, ",");
  const tsv = toDelimited(rows, headers, "\t");

  const noteHtml =
    `This is a <strong>tracking summary</strong>. The most useful comparison is how your scores change across sessions under similar conditions.`;

  return { tableEl: table, csv, tsv, noteHtml };
}

function toDelimited(rows, headers, delim) {
  const escape = (v) => {
    const s = (v === null || v === undefined) ? "" : String(v);
    if (delim === "," && (s.includes('"') || s.includes(",") || s.includes("\n"))) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    if (delim === "\t" && (s.includes("\t") || s.includes("\n"))) {
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
