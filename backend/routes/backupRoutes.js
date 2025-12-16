// backend/routes/backupRoutes.js
const express = require("express");
const router = express.Router();
const backupModel = require("../models/backupModel");

// Tạo backup
router.get("/create", async (req, res) => {
  try {
    const backupFile = await backupModel.backupData();
    res.json(backupFile);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Lỗi khi sao lưu dữ liệu: " + err.message });
  }
});

// Lấy danh sách backup
router.get("/list", (req, res) => {
  try {
    const backups = backupModel.listBackups();
    res.json(backups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi tải danh sách backup" });
  }
});

// Phục hồi dữ liệu
router.post("/restore", async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName)
      return res.status(400).json({ message: "Vui lòng chọn file backup" });

    await backupModel.restoreData(fileName);
    res.json({ message: "Phục hồi thành công" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Lỗi khi phục hồi dữ liệu: " + err.message });
  }
});

module.exports = router;
