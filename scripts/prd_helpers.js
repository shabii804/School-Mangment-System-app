// Body content builders for the School Management System PRD
const {
  Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, AlignmentType, HeadingLevel, WidthType,
  BorderStyle, ShadingType, TableLayoutType,
} = require("docx");
const { P, c, allNoBorders } = require("./generate_prd.js");

// ─────────────────────────────────────────────────────────────
// PARAGRAPH BUILDERS
// ─────────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({
      text, bold: true, size: 32, color: c(P.primary),
      font: { ascii: "Calibri", eastAsia: "SimHei" },
    })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120, line: 312 },
    children: [new TextRun({
      text, bold: true, size: 28, color: c(P.primary),
      font: { ascii: "Calibri", eastAsia: "SimHei" },
    })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100, line: 312 },
    children: [new TextRun({
      text, bold: true, size: 24, color: c(P.body),
      font: { ascii: "Calibri", eastAsia: "SimHei" },
    })],
  });
}

function p(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 360 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({
      text, size: 22, color: c(P.body),
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    })],
  });
}

// Bullet item (left-aligned, no first-line indent)
function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 60 },
    children: [new TextRun({
      text, size: 22, color: c(P.body),
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    })],
  });
}

// Numbered list paragraph — caller provides reference name
function numItem(text, reference, level = 0) {
  return new Paragraph({
    numbering: { reference, level },
    spacing: { line: 312, after: 60 },
    children: [new TextRun({
      text, size: 22, color: c(P.body),
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    })],
  });
}

// Inline bold + body mix
function mixedP(parts) {
  // parts: [{ text, bold? }, ...]
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 360 },
    spacing: { line: 312, after: 80 },
    children: parts.map(part => new TextRun({
      text: part.text, bold: !!part.bold, size: 22, color: c(P.body),
      font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
    })),
  });
}

// ─────────────────────────────────────────────────────────────
// TABLE BUILDER
// ─────────────────────────────────────────────────────────────
function makeTable(headers, rows, colWidths) {
  // colWidths: array of percentage numbers (must sum to 100)
  const widths = colWidths || headers.map(() => Math.floor(100 / headers.length));

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((text, i) => new TableCell({
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: c(P.headerBg) },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({
          text, bold: true, size: 21, color: c(P.headerText),
          font: { ascii: "Calibri", eastAsia: "SimHei" },
        })],
      })],
    })),
  });

  const dataRows = rows.map((row, rowIdx) => new TableRow({
    cantSplit: true,
    children: row.map((cellText, i) => new TableCell({
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      shading: rowIdx % 2 === 1
        ? { type: ShadingType.CLEAR, fill: c(P.surface) }
        : undefined,
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({
          text: String(cellText), size: 20, color: c(P.body),
          font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
        })],
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: c(P.primary) },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: c(P.primary) },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: c(P.innerLine) },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [headerRow, ...dataRows],
  });
}

// Table caption (above table)
function tableCaption(text) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 160, after: 80 },
    children: [new TextRun({
      text, bold: true, size: 21, color: c(P.primary),
      font: { ascii: "Calibri", eastAsia: "SimHei" },
    })],
  });
}

module.exports = {
  h1, h2, h3, p, bullet, numItem, mixedP,
  makeTable, tableCaption,
};
