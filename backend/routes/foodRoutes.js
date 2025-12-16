const express = require("express");
const router = express.Router();
const foodModel = require("../models/foodModel");

// GET món ăn, hỗ trợ tìm kiếm
router.get("/", async (req, res) => {
  const categoryID = req.query.categoryID || "";
  try {
    const data = await foodModel.getFoodItems(categoryID);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST thêm món
router.post("/", async (req, res) => {
  try {
    const { name, categoryID, price, status } = req.body;
    await foodModel.addFoodItem(name, categoryID, price, status);
    res.json({ message: "Thêm món thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// PUT sửa món
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryID, price, status } = req.body;
    await foodModel.updateFoodItem(
      parseInt(id),
      name,
      categoryID,
      price,
      status
    );
    res.json({ message: "Cập nhật món thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE món
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await foodModel.deleteFoodItem(parseInt(id));
    res.json({ message: "Xóa món thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
