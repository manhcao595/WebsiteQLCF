const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json()); // <-- phải đặt trước router

const categoryRoutes = require("./routes/categoryRoutes");
app.use("/api/categories", categoryRoutes);

const foodRoutes = require("./routes/foodRoutes");
app.use("/api/food", foodRoutes);

const tableRoutes = require("./routes/tableRoutes");
app.use("/api/tables", tableRoutes);

const saleRoutes = require("./routes/saleRoutes");
app.use("/api/sale", saleRoutes);

const revenueRoutes = require("./routes/revenueRoutes");
app.use("/api/revenue", revenueRoutes);

const backupRoutes = require("./routes/backupRoutes");
app.use("/api/backup", backupRoutes);

const exportRoutes = require("./routes/exportRoutes");
app.use("/api/export", exportRoutes);

// catch-all route cho các URL không tồn tại
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
