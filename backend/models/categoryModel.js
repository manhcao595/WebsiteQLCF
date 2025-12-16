const { sql, config } = require("../db/db");

// Lấy danh sách category
async function getCategories() {
  let pool = await sql.connect(config);
  let result = await pool.request().query("SELECT * FROM Category");
  return result.recordset;
}

// Thêm mới
async function addCategory(name) {
  let pool = await sql.connect(config);
  await pool
    .request()
    .input("Name", sql.NVarChar, name)
    .query("INSERT INTO Category (Name) VALUES (@Name)");
}

// Cập nhật
async function updateCategory(id, name) {
  let pool = await sql.connect(config);
  const result = await pool
    .request()
    .input("CategoryID", sql.Int, id)
    .input("Name", sql.NVarChar, name)
    .query("UPDATE Category SET Name = @Name WHERE CategoryID = @CategoryID");

  if (result.rowsAffected[0] === 0) {
    throw new Error("Category không tồn tại"); // báo lỗi nếu id không có trong DB
  }
}

// Xóa
async function deleteCategory(id) {
  let pool = await sql.connect(config);
  const result = await pool
    .request()
    .input("CategoryID", sql.Int, id)
    .query("DELETE FROM Category WHERE CategoryID = @CategoryID");

  if (result.rowsAffected[0] === 0) {
    throw new Error("Category không tồn tại"); // báo lỗi nếu id không có trong DB
  }
}

module.exports = {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};
