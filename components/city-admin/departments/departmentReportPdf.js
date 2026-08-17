import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function safeNumber(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function truncate(str, len = 40) {
  const text = String(str || "");
  return text.length > len ? `${text.slice(0, len - 1)}…` : text;
}

function formatDate(timestamp) {
  if (!timestamp) return "N/A";
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const PALETTES = {
  color: {
    primary: [14, 165, 233], // Sky blue
    secondary: [37, 99, 235], // Blue
    dark: [15, 23, 42], // Slate dark
    text: [51, 65, 85], // Slate text
    light: [241, 245, 249], // Slate 100
    border: [226, 232, 240],
    success: [16, 185, 129],
    danger: [225, 29, 72],
    cardBg: [248, 250, 252],
  },
  grayscale: {
    primary: [40, 40, 40],
    secondary: [80, 80, 80],
    dark: [20, 20, 20],
    text: [55, 55, 55],
    light: [240, 240, 240],
    border: [210, 210, 210],
    success: [90, 90, 90],
    danger: [60, 60, 60],
    cardBg: [245, 245, 245],
  },
};

export function generateDepartmentReportPdf({
  reportData,
  scopeTitle = "All Departments",
  departmentKey = null,
  appearance = "color",
  sections = {},
  dateRange = "All Time",
}) {
  const isGrayscale = appearance === "grayscale";
  const colors = isGrayscale ? PALETTES.grayscale : PALETTES.color;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 16;

  // Title Properties
  const reportTitle = `CityCare Department Performance Report - ${scopeTitle}`;
  doc.setProperties({
    title: reportTitle,
    subject: "CityCare City Administration Performance Report",
    author: "CityCare Administration System",
    creator: "CityCare Web App",
  });

  // Header Banner
  doc.setFillColor(...colors.dark);
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CITYCARE", margin, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("CITY ADMINISTRATION PERFORMANCE REPORT", margin, 18);

  const cityState = `${reportData?.scope?.city || "City"}, ${reportData?.scope?.state || ""}`;
  doc.setFont("helvetica", "bold");
  doc.text(cityState.toUpperCase(), pageWidth - margin, 12, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Scope: ${scopeTitle} • Period: ${dateRange}`, pageWidth - margin, 18, { align: "right" });

  currentY = 32;

  // Function to ensure vertical space
  function checkSpace(neededHeight) {
    if (currentY + neededHeight > pageHeight - 16) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  }

  // 1. EXECUTIVE SUMMARY SECTION
  if (sections.summary !== false) {
    checkSpace(38);

    doc.setTextColor(...colors.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("1. Executive Summary & Overview", margin, currentY);
    currentY += 6;

    const summary = reportData?.summary || {};
    const kpis = [
      { label: "Total Issues", val: String(summary.totalIssues ?? 0) },
      { label: "Active Issues", val: String(summary.activeIssues ?? 0) },
      { label: "Resolved / Closed", val: String((summary.resolvedIssues ?? 0) + (summary.closedIssues ?? 0)) },
      { label: "SLA Compliance", val: `${safeNumber(summary.overallSlaComplianceRate).toFixed(1)}%` },
      { label: "Unit Officers", val: String(summary.totalUnitOfficers ?? 0) },
      { label: "Field Officers", val: String(summary.totalFieldOfficers ?? 0) },
    ];

    const cardWidth = (contentWidth - 5 * 3) / 6;
    const cardHeight = 16;

    kpis.forEach((kpi, idx) => {
      const x = margin + idx * (cardWidth + 3);
      doc.setFillColor(...colors.cardBg);
      doc.setDrawColor(...colors.border);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...colors.text);
      doc.text(kpi.label.toUpperCase(), x + 3, currentY + 5);

      doc.setFontSize(11);
      doc.setTextColor(...colors.dark);
      doc.text(kpi.val, x + 3, currentY + 12);
    });

    currentY += cardHeight + 8;
  }

  // 2. DEPARTMENT PERFORMANCE COMPARISON TABLE
  if (sections.departmentPerf !== false && Array.isArray(reportData?.departments)) {
    checkSpace(30);

    doc.setTextColor(...colors.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("2. Department Performance Summary", margin, currentY);
    currentY += 4;

    const deptRows = reportData.departments.map((dept) => [
      dept.label,
      String(dept.metrics.totalIssues),
      String(dept.metrics.activeIssues),
      String(dept.metrics.resolvedIssues + dept.metrics.closedIssues),
      `${dept.metrics.resolutionRate}%`,
      `${dept.metrics.slaComplianceRate}%`,
      `${dept.metrics.avgResolutionHours}h (${dept.metrics.avgResolutionDays}d)`,
      String(dept.metrics.unitOfficerCount),
      String(dept.metrics.fieldOfficerCount),
      `${dept.metrics.averageFieldOfficerEfficiency}%`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          "Department",
          "Total",
          "Active",
          "Resolved",
          "Res %",
          "SLA %",
          "Avg Time",
          "UOs",
          "FOs",
          "Avg Eff",
        ],
      ],
      body: deptRows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: colors.text,
      },
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: colors.light,
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // 3. STATUS & PRIORITY BREAKDOWN
  if (sections.statusBreakdown !== false && Array.isArray(reportData?.departments)) {
    checkSpace(30);

    doc.setTextColor(...colors.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("3. Issue Status & Priority Distribution", margin, currentY);
    currentY += 4;

    const statusRows = reportData.departments.map((dept) => [
      dept.label,
      String(dept.statusBreakdown.pending ?? 0),
      String(dept.statusBreakdown.verified ?? 0),
      String(dept.statusBreakdown.assigned ?? 0),
      String(dept.statusBreakdown.in_progress ?? 0),
      String(dept.statusBreakdown.resolved ?? 0),
      String(dept.statusBreakdown.closed ?? 0),
      String(dept.statusBreakdown.rejected ?? 0),
      String(dept.priorityBreakdown.critical ?? 0),
      String(dept.priorityBreakdown.high ?? 0),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          "Department",
          "Pending",
          "Verified",
          "Assigned",
          "In Prog",
          "Resolved",
          "Closed",
          "Rejected",
          "Critical Prio",
          "High Prio",
        ],
      ],
      body: statusRows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: colors.text,
      },
      headStyles: {
        fillColor: colors.secondary,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: colors.light,
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // 4. SLA ANALYSIS
  if (sections.slaAnalysis !== false && Array.isArray(reportData?.departments)) {
    checkSpace(30);

    doc.setTextColor(...colors.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("4. Service Level Agreement (SLA) Compliance", margin, currentY);
    currentY += 4;

    const slaRows = reportData.departments.map((dept) => [
      dept.label,
      String(dept.metrics.slaCompliantIssues),
      String(dept.metrics.slaBreachedIssues),
      String(dept.metrics.slaNoDeadline),
      `${dept.metrics.slaComplianceRate}%`,
      String(dept.metrics.slaExtensionCount),
      String(dept.metrics.activeEscalations),
      dept.metrics.averageCitizenRating ? `${dept.metrics.averageCitizenRating} / 5` : "N/A",
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          "Department",
          "Compliant",
          "Breached",
          "No Deadline",
          "SLA Rate",
          "Extensions",
          "Escalations",
          "Avg Citizen Rating",
        ],
      ],
      body: slaRows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: colors.text,
      },
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: colors.light,
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  }

  // 5. UNIT OFFICER PERFORMANCE TABLE
  if (sections.unitOfficers !== false && Array.isArray(reportData?.departments)) {
    checkSpace(30);

    doc.setTextColor(...colors.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("5. Unit Officers Operational Performance", margin, currentY);
    currentY += 4;

    const uoRows = [];
    reportData.departments.forEach((dept) => {
      dept.unitOfficers.forEach((uo) => {
        uoRows.push([
          uo.fullName,
          dept.label,
          uo.accountApproved ? "Active" : "Pending Approval",
          String(uo.totalVerifiedIssues),
          String(uo.totalRejectedIssues),
          String(uo.activeIssues),
          String(uo.resolvedIssues),
          `${uo.efficiencyScore}%`,
          uo.rating > 0 ? `${uo.rating} / 5` : "N/A",
        ]);
      });
    });

    if (uoRows.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "Officer Name",
            "Department",
            "Status",
            "Verified",
            "Rejected",
            "Active",
            "Resolved",
            "Efficiency",
            "Rating",
          ],
        ],
        body: uoRows,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: colors.text,
        },
        headStyles: {
          fillColor: colors.secondary,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: colors.light,
        },
        margin: { left: margin, right: margin },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }
  }

  // 6. FIELD OFFICER PERFORMANCE TABLE
  if (sections.fieldOfficers !== false && Array.isArray(reportData?.departments)) {
    checkSpace(30);

    doc.setTextColor(...colors.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("6. Field Officers Workload & On-Time Performance", margin, currentY);
    currentY += 4;

    const foRows = [];
    reportData.departments.forEach((dept) => {
      dept.fieldOfficers.forEach((fo) => {
        foRows.push([
          fo.fullName,
          dept.label,
          `${fo.currentActiveIssues} / ${fo.maxIssueCapacity} (${fo.workloadPercent}%)`,
          String(fo.totalResolvedIssues),
          `${fo.onTimeCompletionRate}%`,
          `${fo.efficiencyScore}%`,
          fo.rating > 0 ? `${fo.rating} / 5` : "N/A",
        ]);
      });
    });

    if (foRows.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "Field Officer Name",
            "Department",
            "Workload / Capacity",
            "Resolved Issues",
            "On-Time Rate",
            "Efficiency",
            "Rating",
          ],
        ],
        body: foRows,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: colors.text,
        },
        headStyles: {
          fillColor: colors.primary,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: colors.light,
        },
        margin: { left: margin, right: margin },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }
  }

  // 7. ISSUE RECORDS TABLE
  if (sections.issueRecords !== false && Array.isArray(reportData?.departments)) {
    checkSpace(30);

    doc.setTextColor(...colors.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("7. Department Issue Records Log", margin, currentY);
    currentY += 4;

    const issueRows = [];
    reportData.departments.forEach((dept) => {
      dept.issues.forEach((issue) => {
        issueRows.push([
          issue.issueCode,
          truncate(issue.title, 36),
          dept.label,
          String(issue.priority).toUpperCase(),
          String(issue.status).toUpperCase(),
          issue.slaBreached ? "BREACHED" : "COMPLIANT",
          issue.assignedUnitOfficer || "Unassigned",
          issue.assignedFieldOfficer || "Unassigned",
          formatDate(issue.createdAt),
        ]);
      });
    });

    if (issueRows.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "Issue Code",
            "Title",
            "Department",
            "Priority",
            "Status",
            "SLA",
            "Unit Officer",
            "Field Officer",
            "Created Date",
          ],
        ],
        body: issueRows,
        theme: "grid",
        styles: {
          fontSize: 7.5,
          cellPadding: 1.8,
          textColor: colors.text,
        },
        headStyles: {
          fillColor: colors.dark,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: colors.light,
        },
        margin: { left: margin, right: margin },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    }
  }

  // Page Footer Numbering
  const totalPages = doc.getNumberOfPages();
  const timestampStr = new Date().toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 140, 140);

    // Footer divider line
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text(
      `CityCare — Administrative Department Performance Report (${appearance.toUpperCase()}) • Generated: ${timestampStr}`,
      margin,
      pageHeight - 5
    );

    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5, {
      align: "right",
    });
  }

  // Build Filename
  const dateStr = new Date().toISOString().split("T")[0];
  const safeScope = scopeTitle.replace(/[^a-zA-Z0-9]+/g, "_");
  const filename = `CityCare_${reportData?.scope?.city || "City"}_${safeScope}_${appearance.toUpperCase()}_${dateStr}.pdf`;

  doc.save(filename);
  return true;
}
