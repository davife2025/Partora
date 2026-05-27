"use client";

import { useState }      from "react";
import { FileDown, Loader } from "lucide-react";
import { Button }        from "@/components/ui/Button";
import type { VoicePartResult } from "@partora/types";

interface SolfaPDFExportProps {
  songTitle:   string;
  artist?:     string;
  musicalKey:  string;
  mode:        string;
  soprano:     VoicePartResult;
  alto:        VoicePartResult;
  tenor:       VoicePartResult;
  bass:        VoicePartResult;
  className?:  string;
}

const PART_COLORS: Record<string, string> = {
  soprano: "#7F77DD",
  alto:    "#2DA882",
  tenor:   "#D4820A",
  bass:    "#185FA5",
};

export function SolfaPDFExport({
  songTitle, artist, musicalKey, mode,
  soprano, alto, tenor, bass,
  className,
}: SolfaPDFExportProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      // Build an HTML document and trigger browser print → PDF
      const parts = [soprano, alto, tenor, bass];
      const html = buildPDFHtml({ songTitle, artist, musicalKey, mode, parts });

      const win = window.open("", "_blank");
      if (!win) { setLoading(false); return; }

      win.document.write(html);
      win.document.close();
      win.focus();
      win.onload = () => {
        win.print();
        setLoading(false);
      };
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      loading={loading}
      className={className}
    >
      {!loading && <FileDown className="h-3.5 w-3.5" />}
      Export PDF
    </Button>
  );
}

function buildPDFHtml(params: {
  songTitle: string;
  artist?:   string;
  musicalKey: string;
  mode:      string;
  parts:     VoicePartResult[];
}) {
  const { songTitle, artist, musicalKey, mode, parts } = params;

  const partSections = parts.map((p) => {
    const color = PART_COLORS[p.part] ?? "#7F77DD";
    const syllables = p.solfa_text.split(" ").filter(Boolean);
    const pills = syllables
      .map((s) => `<span class="pill">${s}</span>`)
      .join(" ");

    const noteRows = p.solfa_notes.length > 0
      ? `<table class="note-table">
          <thead><tr><th>Syllable</th><th>Note</th><th>Octave</th><th>Duration</th><th>Lyric</th></tr></thead>
          <tbody>
            ${p.solfa_notes.map((n) => `
              <tr>
                <td><strong>${n.syllable}</strong></td>
                <td>${(n as unknown as Record<string, string>).note_name ?? "—"}</td>
                <td>${n.octave}</td>
                <td>${n.duration}</td>
                <td>${n.lyric_syllable ?? "—"}</td>
              </tr>`).join("")}
          </tbody>
        </table>`
      : "";

    return `
      <div class="part-section">
        <div class="part-header" style="border-left: 4px solid ${color}; padding-left: 12px;">
          <h2 style="color: ${color}; margin: 0; text-transform: capitalize;">${p.part}</h2>
          <span class="range-badge">${p.range.low} – ${p.range.high}</span>
        </div>
        <div class="solfa-pills">${pills}</div>
        ${noteRows}
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Partora — ${songTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111; padding: 32px; font-size: 12px; }
    .header { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 700; }
    .header .meta { color: #555; margin-top: 4px; }
    .key-badge { display: inline-block; background: #7F77DD; color: white; padding: 2px 10px; border-radius: 99px; font-size: 11px; margin-top: 6px; }
    .branding { float: right; font-size: 11px; color: #888; }
    .part-section { margin-bottom: 28px; page-break-inside: avoid; }
    .part-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px; }
    .part-header h2 { font-size: 16px; font-weight: 700; }
    .range-badge { font-size: 10px; color: #555; background: #f0f0f0; padding: 2px 8px; border-radius: 99px; }
    .solfa-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .pill { display: inline-block; background: #f4f4f8; border: 1px solid #ddd; border-radius: 99px; padding: 3px 10px; font-size: 12px; font-weight: 600; }
    .note-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .note-table th { background: #f4f4f8; text-align: left; padding: 4px 8px; border: 1px solid #e0e0e0; font-weight: 600; }
    .note-table td { padding: 4px 8px; border: 1px solid #e0e0e0; }
    .note-table tr:nth-child(even) td { background: #fafafa; }
    .footer { margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px; color: #888; font-size: 10px; text-align: center; }
    @media print {
      body { padding: 16px; }
      .part-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="branding">Generated by Partora</div>
    <h1>${songTitle}</h1>
    ${artist ? `<div class="meta">${artist}</div>` : ""}
    <span class="key-badge">${musicalKey} ${mode}</span>
  </div>

  ${partSections}

  <div class="footer">
    Generated by Partora · ${new Date().toLocaleDateString()} · partora.app
  </div>
</body>
</html>`;
}
