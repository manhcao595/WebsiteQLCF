// backend/routes/revenueRoutes.js
const express = require("express");
const router = express.Router();
const revenueModel = require("../models/revenueModel");

// GET /api/revenue?fromDate=yyyy-mm-dd&toDate=yyyy-mm-dd
router.get("/", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp từ ngày và đến ngày" });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ message: "Ngày không hợp lệ" });
    }

    const sales = await revenueModel.getSalesByDate(from, to);

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + parseFloat(sale.TotalAmount),
      0
    );

    res.json({ totalRevenue, sales });
  } catch (err) {
    console.error("Lỗi thống kê doanh thu:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// Lấy tất cả hóa đơn trong khoảng ngày kèm chi tiết món
async function getSalesByDate(fromDate, toDate) {
  const pool = await sql.connect(config);
  const result = await pool
    .request()
    .input("fromDate", sql.Date, fromDate)
    .input("toDate", sql.Date, toDate).query(`
      SELECT SaleID, TableID, SaleDate, TotalAmount
      FROM Sale
      WHERE SaleDate BETWEEN @fromDate AND @toDate
      ORDER BY SaleDate
    `);
  return result.recordset;
}

module.exports = router;
