// backend/models/foodModel.js
const { sql, config } = require("../db/db");

// Lấy danh sách món, có thể tìm kiếm
async function getFoodItems(categoryID = "") {
  let pool = await sql.connect(config);
  let query = "SELECT * FROM MenuItem";
  if (categoryID) {
    query += " WHERE CategoryID = @categoryID";
  }

  const request = pool.request();
  if (categoryID) request.input("categoryID", sql.Int, categoryID);

  const result = await request.query(query);
  return result.recordset;
}

// Thêm món
async function addFoodItem(name, categoryID, price, status) {
  const pool = await sql.connect(config);

  // Kiểm tra trùng tên
  const check = await pool
    .request()
    .input("Name", sql.NVarChar, name)
    .query("SELECT COUNT(*) AS count FROM MenuItem WHERE Name = @Name");

  if (check.recordset[0].count > 0) {
    throw new Error("Tên món đã tồn tại");
  }

  await pool
    .request()
    .input("Name", sql.NVarChar, name)
    .input("CategoryID", sql.Int, categoryID)
    .input("Price", sql.Decimal(10, 2), price)
    .input("Status", sql.Bit, status)
    .query(
      `INSERT INTO MenuItem (Name, CategoryID, Price, Status) 
       VALUES (@Name, @CategoryID, @Price, @Status)`
    );
}

// Sửa món
async function updateFoodItem(id, name, categoryID, price, status) {
  const pool = await sql.connect(config);

  const result = await pool
    .request()
    .input("ItemID", sql.Int, id)
    .input("Name", sql.NVarChar, name)
    .input("CategoryID", sql.Int, categoryID)
    .input("Price", sql.Decimal(10, 2), price)
    .input("Status", sql.Bit, status)
    .query(
      "UPDATE MenuItem SET Name=@Name, CategoryID=@CategoryID, Price=@Price, Status=@Status WHERE ItemID=@ItemID"
    );

  if (result.rowsAffected[0] === 0) {
    throw new Error("Món không tồn tại");
  }
}

// Xóa món
async function deleteFoodItem(id) {
  const pool = await sql.connect(config);

  const result = await pool
    .request()
    .input("ItemID", sql.Int, id)
    .query("DELETE FROM MenuItem WHERE ItemID=@ItemID");

  if (result.rowsAffected[0] === 0) {
    throw new Error("Món không tồn tại");
  }
}

module.exports = {
  getFoodItems,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
};
