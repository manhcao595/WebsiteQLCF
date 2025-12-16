// backend/models/backupModel.js
const fs = require("fs");
const path = require("path");
const { sql, config } = require("../db/db");

// Thư mục lưu backup
const backupDir = path.join(__dirname, "../backup");
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

module.exports = {
  // Tạo backup
  backupData: async () => {
    try {
      const pool = await sql.connect(config);
      const dateStr = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = path.join(backupDir, `backup-${dateStr}.bak`);

      const query = `
        BACKUP DATABASE [${config.database}]
        TO DISK = N'${backupFile}'
        WITH FORMAT, INIT, NAME = N'Full Backup of ${config.database}'
      `;

      await pool.request().query(query);
      await pool.close();

      return path.basename(backupFile);
    } catch (err) {
      console.error("Lỗi backup:", err);
      throw new Error(err.message);
    }
  },

  // Phục hồi backup
  restoreData: async (fileName) => {
    try {
      const filePath = path.join(backupDir, fileName);
      if (!fs.existsSync(filePath))
        throw new Error("File backup không tồn tại");

      const pool = await sql.connect(config);

      const query = `
        USE master;
        ALTER DATABASE [${config.database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        RESTORE DATABASE [${config.database}] FROM DISK = N'${filePath}' WITH REPLACE;
        ALTER DATABASE [${config.database}] SET MULTI_USER;
      `;

      await pool.request().query(query);
      await pool.close();

      return true;
    } catch (err) {
      console.error("Lỗi restore:", err);
      throw new Error(err.message);
    }
  },

  // Lấy danh sách backup
  listBackups: () => {
    return fs.readdirSync(backupDir).filter((f) => f.endsWith(".bak"));
  },
};
