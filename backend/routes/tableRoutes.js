// backend/routes/tableRoutes.js
const express = require("express");
const router = express.Router();
const tableModel = require("../models/tableModel");

// Lấy danh sách bàn
router.get("/", async (req, res) => {
  try {
    const tables = await tableModel.getTables();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm bàn
router.post("/", async (req, res) => {
  const { tableName, status } = req.body;
  try {
    await tableModel.addTable(tableName, status);
    res.json({ message: "Thêm bàn thành công!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật bàn
router.put("/:id", async (req, res) => {
  const tableID = req.params.id;
  const { tableName, status } = req.body;
  try {
    await tableModel.updateTable(tableID, tableName, status);
    res.json({ message: "Cập nhật bàn thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Xóa bàn
router.delete("/:id", async (req, res) => {
  try {
    await tableModel.deleteTable(req.params.id);
    res.json({ message: "Xóa bàn thành công!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
