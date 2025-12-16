// backend/models/saleModel.js
const { sql, config } = require("../db/db");

// Tạo hóa đơn mới
async function createSale(tableID, totalAmount) {
  const pool = await sql.connect(config);
  const result = await pool
    .request()
    .input("tableID", sql.Int, tableID)
    .input("totalAmount", sql.Decimal(10, 2), totalAmount)
    .query(
      `INSERT INTO Sale (TableID, TotalAmount)
       OUTPUT INSERTED.SaleID
       VALUES (@tableID, @totalAmount)`
    );

  return result.recordset[0].SaleID;
}

// Thêm chi tiết hóa đơn
async function createSaleDetails(saleID, items) {
  const pool = await sql.connect(config);
  for (const item of items) {
    await pool
      .request()
      .input("saleID", sql.Int, saleID)
      .input("itemID", sql.Int, item.ItemID)
      .input("quantity", sql.Int, item.Quantity)
      .input("price", sql.Decimal(10, 2), item.Price)
      .query(
        `INSERT INTO SaleDetail (SaleID, ItemID, Quantity, Price)
         VALUES (@saleID, @itemID, @quantity, @price)`
      );
  }
}

// Kiểm tra bàn có tồn tại
async function checkTableExists(tableID) {
  const pool = await sql.connect(config);
  const result = await pool
    .request()
    .input("tableID", sql.Int, tableID)
    .query("SELECT TableID FROM TableInfo WHERE TableID=@tableID");

  return result.recordset.length > 0;
}

// Kiểm tra món có tồn tại
async function checkItemsExist(items) {
  const pool = await sql.connect(config);
  for (const item of items) {
    const result = await pool
      .request()
      .input("itemID", sql.Int, item.ItemID)
      .query("SELECT ItemID FROM MenuItem WHERE ItemID=@itemID");

    if (result.recordset.length === 0) {
      return false;
    }
  }
  return true;
}

// ===============================
// Lấy chi tiết hóa đơn + tên món + ngày lập
// ===============================
async function getSaleDetails(saleID) {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().input("saleID", sql.Int, saleID).query(`
        SELECT 
            sd.SaleDetailID,
            sd.SaleID,
            sd.ItemID,
            mi.Name AS ItemName,
            sd.Quantity,
            sd.Price,
            (sd.Quantity * sd.Price) AS Amount,
            s.SaleDate
        FROM SaleDetail sd
        JOIN MenuItem mi ON sd.ItemID = mi.ItemID
        JOIN Sale s ON sd.SaleID = s.SaleID
        WHERE sd.SaleID = @saleID
      `);

    return result.recordset;
  } catch (err) {
    console.error("Lỗi truy vấn SaleDetail:", err);
    throw err;
  }
}

module.exports = {
  createSale,
  createSaleDetails,
  checkTableExists,
  checkItemsExist,
  getSaleDetails,
};
