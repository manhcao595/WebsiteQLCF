const express = require("express");
const router = express.Router();
const categoryModel = require("../models/categoryModel");

// get all categories
router.get("/", async (req, res) => {
  try {
    const data = await categoryModel.getCategories();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// add new category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    await categoryModel.addCategory(name);
    res.json({ message: "Category added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add category" });
  }
});

// update
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });

  try {
    await categoryModel.updateCategory(parseInt(id), name);
    res.json({ message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// delete
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.deleteCategory(parseInt(id));

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error); // <-- in ra lỗi chi tiết
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
