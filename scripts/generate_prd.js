// School Management System — Product Requirements Document (PRD) v1.0
// Generates a polished .docx using docx-js with R1 cover + WM-1 palette + TOC

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, TableLayoutType, TableOfContents, LevelFormat,
} = require("docx");
const fs = require("fs");

// ─────────────────────────────────────────────────────────────
// PALETTE — WM-1 Warm Teal (education / training / marketing)
// ─────────────────────────────────────────────────────────────
const P = {
  bg: "F4F1E9",          // cover background (warm cream)
  primary: "15857A",     // headings, accent
  body: "1A1A1A",        // body text — pure dark for readability
  secondary: "606060",   // captions
  accent: "FF6A3B",      // secondary accent (warm orange) — used sparingly
  // cover-specific
  titleColor: "15857A",
  subtitleColor: "606060",
  metaColor: "707070",
  footerColor: "A0A0A0",
  // table
  headerBg: "15857A",
  headerText: "FFFFFF",
  accentLine: "15857A",
  innerLine: "D5D0C8",
  surface: "F0EDE5",
};
const c = (hex) => hex.replace("#", "");

// ─────────────────────────────────────────────────────────────
// BORDERS
// ─────────────────────────────────────────────────────────────
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = {
  top: NB, bottom: NB, left: NB, right: NB,
  insideHorizontal: NB, insideVertical: NB,
};

// ─────────────────────────────────────────────────────────────
// HELPER — calcTitleLayout
// ─────────────────────────────────────────────────────────────
function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([
    ...'，。、；：！？.,;:!?',
    ...'的与和及之在于为',
    ...'-_—–·/ \t',
  ]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) {
        breakAt = i; break;
      }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 20;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    const cpl = charsPerLine(minPt);
    lines = splitTitleLines(title, cpl);
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function calcCoverSpacing(params) {
  const {
    titleLineCount = 1, titlePt = 36, hasSubtitle = false,
    hasEnglishLabel = false, metaLineCount = 0,
    fixedHeight = 800, pageHeight = 16838,
    marginTop = 0, marginBottom = 0,
  } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight +
                        metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  return { topSpacing, bottomSpacing };
}

// ─────────────────────────────────────────────────────────────
// COVER — Recipe R1 (Pure Paragraph, Left-Aligned)
// ─────────────────────────────────────────────────────────────
function buildCover() {
  const config = {
    title: "School Management System",
    subtitle: "Product Requirements Document — Version 1.0",
    englishLabel: "PRD",
    metaLines: [
      "Document Type: Product Requirements Document (PRD)",
      "Version: 1.0",
      "Date: July 2026",
      "Status: Draft for Review",
      "Audience: Product, Engineering, QA, Stakeholders",
    ],
    footerLeft: "Confidential — Internal Use Only",
    footerRight: "School Management System v1.0",
  };

  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 44, 28);
  const titleSize = titlePt * 2;

  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: true, hasEnglishLabel: true,
    metaLineCount: config.metaLines.length,
    fixedHeight: 400,
  });

  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: c(P.primary), space: 12 };
  const children = [];

  // 1. Top whitespace
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));

  // 2. English label with accent bottom border
  children.push(new Paragraph({
    indent: { left: padL, right: padR }, spacing: { after: 500 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: c(P.primary), space: 8 } },
    children: [new TextRun({
      text: config.englishLabel.split("").join("  "),
      size: 18, color: c(P.primary),
      font: { ascii: "Calibri", eastAsia: "SimHei" },
      characterSpacing: 40,
    })],
  }));

  // 3. Main title
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: {
        after: i < titleLines.length - 1 ? 100 : 300,
        line: Math.ceil(titlePt * 23),
        lineRule: "atLeast",
      },
      children: [new TextRun({
        text: titleLines[i], size: titleSize, bold: true,
        color: c(P.titleColor),
        font: { eastAsia: "SimHei", ascii: "Arial" },
      })],
    }));
  }

  // 4. Subtitle
  children.push(new Paragraph({
    indent: { left: padL }, spacing: { after: 800 },
    children: [new TextRun({
      text: config.subtitle, size: 24, color: c(P.subtitleColor),
      font: { eastAsia: "Microsoft YaHei", ascii: "Arial" },
    })],
  }));

  // 5. Meta info lines with left accent border
  for (const line of config.metaLines) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({
        text: line, size: 22, color: c(P.metaColor),
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" },
      })],
    }));
  }

  // 6. Bottom whitespace
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));

  // 7. Footer with top accent separator
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: c(P.primary), space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft, size: 16, color: c(P.footerColor), font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight, size: 16, color: c(P.footerColor), font: { ascii: "Arial" } }),
    ],
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: c(P.bg) },
        borders: noBorders,
        children,
      })],
    })],
  })];
}

module.exports = {
  P, c, NB, noBorders, allNoBorders,
  buildCover,
};
