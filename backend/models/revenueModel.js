// backend/models/revenueModel.js
const { sql, config } = require("../db/db");

// Lấy danh sách hóa đơn trong khoảng ngày
async function getSalesByDate(fromDate, toDate) {
  const pool = await sql.connect(config);

  // Chú ý: thêm 23:59:59 cho toDate để lấy cả ngày cuối
  const toDateTime = new Date(toDate);
  toDateTime.setHours(23, 59, 59);

  const result = await pool
    .request()
    .input("fromDate", sql.DateTime, new Date(fromDate))
    .input("toDate", sql.DateTime, toDateTime)
    .query(
      `SELECT SaleID, TableID, SaleDate, TotalAmount
       FROM Sale
       WHERE SaleDate BETWEEN @fromDate AND @toDate
       ORDER BY SaleDate ASC`
    );

  return result.recordset;
}

module.exports = { getSalesByDate };
