// Main entry — assembles the School Management System PRD and writes the .docx
const {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  PageNumber, NumberFormat, AlignmentType, HeadingLevel,
  PageBreak, TableOfContents, LevelFormat,
} = require("docx");
const fs = require("fs");
const path = require("path");

const { P, c, buildCover } = require("./generate_prd.js");
const body1 = require("./prd_body1.js");
const body2 = require("./prd_body2.js");
const body3 = require("./prd_body3.js");
const body4 = require("./prd_body4.js");

// ─────────────────────────────────────────────────────────────
// HEADER + FOOTER (body sections)
// ─────────────────────────────────────────────────────────────
function bodyHeader() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "School Management System — Product Requirements Document v1.0",
        size: 18, color: c(P.secondary),
        font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
      })],
    })],
  });
}

function bodyFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        children: [PageNumber.CURRENT],
        size: 18, color: c(P.secondary),
        font: { ascii: "Calibri" },
      })],
    })],
  });
}

function frontFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        children: [PageNumber.CURRENT],
        size: 18, color: c(P.secondary),
        font: { ascii: "Calibri" },
      })],
    })],
  });
}

// ─────────────────────────────────────────────────────────────
// TOC SECTION
// ─────────────────────────────────────────────────────────────
function tocSection() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
      children: [new TextRun({
        text: "Table of Contents",
        bold: true, size: 36, color: c(P.primary),
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      })],
    }),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Right-click the table of contents and choose \"Update Field\" to refresh page numbers.",
          italics: true, size: 18, color: c(P.secondary),
          font: { ascii: "Calibri" },
        }),
        new PageBreak(),
      ],
    }),
  ];
}

// ─────────────────────────────────────────────────────────────
// BUILD DOCUMENT
// ─────────────────────────────────────────────────────────────
function buildDocument() {
  // Body children: assemble all sections in order
  const bodyChildren = [
    ...body1.sectionExecutiveSummary(),
    ...body1.sectionVision(),
    ...body1.sectionUsers(),
    ...body1.sectionTechStack(),
    ...body2.sectionModulesOverview(),
    ...body2.moduleDashboard(),
    ...body2.moduleStudents(),
    ...body2.moduleTeachers(),
    ...body2.moduleStaff(),
    ...body2.moduleClasses(),
    ...body2.moduleTimetable(),
    ...body3.moduleAttendance(),
    ...body3.moduleSalary(),
    ...body3.moduleFees(),
    ...body3.moduleDefaulters(),
    ...body3.moduleResults(),
    ...body3.moduleCertificates(),
    ...body4.moduleReports(),
    ...body4.moduleAnalytics(),
    ...body4.moduleUsers(),
    ...body4.moduleSettings(),
    ...body4.sectionExtras(),
    ...body4.sectionNonFunctional(),
    ...body4.sectionDataModel(),
    ...body4.sectionRoadmap(),
    ...body4.sectionRisks(),
    ...body4.sectionAcceptance(),
  ];

  const doc = new Document({
    creator: "School Management System PRD Generator",
    title: "School Management System — Product Requirements Document v1.0",
    description: "Polished PRD for an offline desktop school management application built with React + Tauri v2 + Rust + SQLite.",
    styles: {
      default: {
        document: {
          run: {
            font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" },
            size: 22, color: c(P.body),
          },
          paragraph: { spacing: { line: 312 } },
        },
        heading1: {
          run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
          paragraph: { spacing: { before: 360, after: 160, line: 312 } },
        },
        heading2: {
          run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
          paragraph: { spacing: { before: 280, after: 120, line: 312 } },
        },
        heading3: {
          run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: c(P.body) },
          paragraph: { spacing: { before: 220, after: 100, line: 312 } },
        },
      },
    },
    sections: [
      // ── Section 1: Cover (no page number, no header/footer) ──
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
          },
        },
        children: buildCover(),
      },
      // ── Section 2: Front matter (TOC) — Roman numerals ──
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        footers: { default: frontFooter() },
        children: tocSection(),
      },
      // ── Section 3: Body — Arabic numerals, reset to 1 ──
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: { default: bodyHeader() },
        footers: { default: bodyFooter() },
        children: bodyChildren,
      },
    ],
  });

  return doc;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function main() {
  const doc = buildDocument();
  const buffer = await Packer.toBuffer(doc);
  const outDir = "/home/z/my-project/download";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "School_Management_System_PRD_v1.0.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`PRD written to: ${outPath}`);
  console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error("Generation failed:", err);
  process.exit(1);
});
