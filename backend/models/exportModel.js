const { sql, config } = require("../db/db");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const EXPORT_DIR = path.join(__dirname, "../exports");
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR);

// ===============================
// Lấy dữ liệu tùy bảng
// ===============================
async function getTableData(tableName) {
  let pool = await sql.connect(config);
  const result = await pool.request().query(`SELECT * FROM ${tableName}`);
  return result.recordset;
}

// ===============================
// Xuất Excel cho bảng bất kỳ
// ===============================
async function exportExcel(tableName) {
  const data = await getTableData(tableName);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(tableName);

  if (data.length > 0) {
    sheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key,
      width: 20,
    }));
    sheet.addRows(data);
  }

  const filePath = path.join(EXPORT_DIR, `${tableName}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

// ===============================
// Xuất PDF cho bảng bất kỳ
// ===============================
async function exportPDF(tableName) {
  const data = await getTableData(tableName);
  const filePath = path.join(EXPORT_DIR, `${tableName}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text(`${tableName.toUpperCase()} DATA`, { align: "center" });
  doc.moveDown();

  data.forEach((row) => {
    const line = Object.entries(row)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");
    doc.fontSize(12).text(line);
  });

  doc.end();
  return filePath;
}

module.exports = {
  exportExcel,
  exportPDF,
};
