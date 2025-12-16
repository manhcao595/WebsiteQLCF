const express = require("express");
const router = express.Router();
const { exportExcel, exportPDF } = require("../models/exportModel");

// Excel
router.get("/:table/excel", async (req, res) => {
  const { table } = req.params;
  try {
    const filePath = await exportExcel(table);
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Lỗi xuất Excel bảng ${table}` });
  }
});

// PDF
router.get("/:table/pdf", async (req, res) => {
  const { table } = req.params;
  try {
    const filePath = await exportPDF(table);
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Lỗi xuất PDF bảng ${table}` });
  }
});

module.exports = router;
