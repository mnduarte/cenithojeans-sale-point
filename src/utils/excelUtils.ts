import ExcelJS from "exceljs";

// ── Color palette (ARGB) ────────────────────────────────────────────────────
export const XL = {
  CYAN: "FF0891B2",       // Header background
  DARK_CYAN: "FF164E63",  // Total row background
  VENDOR_BG: "FFE0F7FA",  // Vendor name background
  VENDOR_TEXT: "FF0E7490",// Vendor name text
  ALT_ROW: "FFF9FAFB",    // Alternating data row background
  BORDER: "FFE5E7EB",     // Thin data border
  CYAN_BORDER: "FF0891B2",// Thick header/total border
  WHITE: "FFFFFFFF",
  BLUE: "FF2563EB",       // Prendas Jeans accent
  GREEN: "FF16A34A",      // Prendas Remeras accent
  RED: "FFC53030",        // Devoluciones accent
  TEXT_DARK: "FF1F2937",
};

const thin = (argb: string): ExcelJS.BorderStyle => "thin" as ExcelJS.BorderStyle;
const border = (argb: string) => ({ style: thin(argb), color: { argb } });

// ── Style helpers ────────────────────────────────────────────────────────────

/** Cyan header row: white bold text, cyan background, centered */
export const xlHeader = (row: ExcelJS.Row, from: number, to: number) => {
  for (let c = from; c <= to; c++) {
    const cell = row.getCell(c);
    cell.font = { bold: true, color: { argb: XL.WHITE }, size: 8 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.CYAN } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
    cell.border = {
      top: border(XL.CYAN_BORDER),
      left: border(XL.CYAN_BORDER),
      bottom: border(XL.CYAN_BORDER),
      right: border(XL.CYAN_BORDER),
    };
  }
};

/** Dark cyan total row: white bold text */
export const xlTotal = (row: ExcelJS.Row, from: number, to: number) => {
  for (let c = from; c <= to; c++) {
    const cell = row.getCell(c);
    cell.font = { bold: true, color: { argb: XL.WHITE }, size: 8 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.DARK_CYAN } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: border(XL.CYAN_BORDER),
      left: border(XL.CYAN_BORDER),
      bottom: border(XL.CYAN_BORDER),
      right: border(XL.CYAN_BORDER),
    };
  }
};

/** Light cyan vendor name row: bold cyan text */
export const xlVendor = (row: ExcelJS.Row, from: number, to: number) => {
  for (let c = from; c <= to; c++) {
    const cell = row.getCell(c);
    cell.font = { bold: true, color: { argb: XL.VENDOR_TEXT }, size: 9 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.VENDOR_BG } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: border(XL.CYAN_BORDER),
      left: border(XL.CYAN_BORDER),
      bottom: border(XL.CYAN_BORDER),
      right: border(XL.CYAN_BORDER),
    };
  }
};

/** Section title: bold cyan, slightly larger */
export const xlSectionTitle = (row: ExcelJS.Row) => {
  const cell = row.getCell(1);
  cell.font = { bold: true, color: { argb: XL.CYAN }, size: 11 };
};

/** Data row with optional alternating background */
export const xlData = (row: ExcelJS.Row, from: number, to: number, isAlt = false) => {
  for (let c = from; c <= to; c++) {
    const cell = row.getCell(c);
    if (isAlt) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: XL.ALT_ROW } };
    }
    cell.border = {
      top: border(XL.BORDER),
      left: border(XL.BORDER),
      bottom: border(XL.BORDER),
      right: border(XL.BORDER),
    };
    cell.font = { size: 8, color: { argb: XL.TEXT_DARK } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  }
};

/** Set column widths (1-based array) */
export const xlColWidths = (ws: ExcelJS.Worksheet, widths: number[]) => {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
};

// ── Workbook helpers ─────────────────────────────────────────────────────────

export const createWorkbook = (sheetName: string) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  return { wb, ws };
};

export const downloadWorkbook = async (
  wb: ExcelJS.Workbook,
  filename: string
): Promise<void> => {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const getExcelFileName = (prefix: string): string => {
  const now = new Date();
  const date = now.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = now
    .toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    .replace(/:/g, "-");
  return `${prefix}-${date}-${time}.xlsx`;
};
