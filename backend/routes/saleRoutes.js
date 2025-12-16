// backend/routes/saleRoutes.js
const express = require("express");
const router = express.Router();
const saleModel = require("../models/saleModel");

// Thanh toán
router.post("/pay", async (req, res) => {
  try {
    const { tableID, items, totalAmount } = req.body;

    // Validate
    if (!tableID || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    // Kiểm tra bàn tồn tại
    const tableExists = await saleModel.checkTableExists(tableID);
    if (!tableExists)
      return res.status(400).json({ message: "Bàn không tồn tại" });

    // Kiểm tra tất cả món tồn tại
    const itemsExist = await saleModel.checkItemsExist(items);
    if (!itemsExist)
      return res.status(400).json({ message: "Có món không tồn tại" });

    // Thêm hóa đơn
    const saleID = await saleModel.createSale(tableID, totalAmount);

    // Thêm chi tiết hóa đơn
    await saleModel.createSaleDetails(saleID, items);

    res.json({ message: "Thanh toán thành công!", saleID });
  } catch (err) {
    console.error("Lỗi thanh toán:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy chi tiết hóa đơn theo SaleID
router.get("/:saleID", async (req, res) => {
  try {
    const saleID = parseInt(req.params.saleID);
    if (!saleID)
      return res.status(400).json({ message: "SaleID không hợp lệ" });

    const details = await saleModel.getSaleDetails(saleID);

    if (!details || details.length === 0)
      return res
        .status(404)
        .json({ message: "Không tìm thấy chi tiết hóa đơn" });

    res.json(details);
  } catch (err) {
    console.error("Lỗi load chi tiết hóa đơn:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
