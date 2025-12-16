// backend/models/tableModel.js
const { sql, config } = require("../db/db");

// Lấy danh sách bàn
async function getTables() {
  const pool = await sql.connect(config);
  const result = await pool
    .request()
    .query("SELECT * FROM TableInfo ORDER BY TableID");
  return result.recordset;
}

// Thêm bàn
async function addTable(name, status) {
  const pool = await sql.connect(config);
  await pool
    .request()
    .input("name", sql.NVarChar, name)
    .input("status", sql.NVarChar, status)
    .query("INSERT INTO TableInfo (TableName, Status) VALUES (@name, @status)");
}

// Cập nhật bàn
async function updateTable(id, name, status) {
  const pool = await sql.connect(config);
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("name", sql.NVarChar, name)
    .input("status", sql.NVarChar, status)
    .query(
      "UPDATE TableInfo SET TableName=@name, Status=@status WHERE TableID=@id"
    );

  if (result.rowsAffected[0] === 0) {
    throw new Error("Bàn không tồn tại");
  }
}

// Xóa bàn
async function deleteTable(id) {
  const pool = await sql.connect(config);
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM TableInfo WHERE TableID=@id");

  if (result.rowsAffected[0] === 0) {
    throw new Error("Bàn không tồn tại");
  }
}

module.exports = {
  getTables,
  addTable,
  updateTable,
  deleteTable,
};
