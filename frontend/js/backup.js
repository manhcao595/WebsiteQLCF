// frontend/backup.js
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// ===============================
// Load danh sách backup
// ===============================
async function loadBackups() {
  const backupInput = document.getElementById("backup-text");
  backupInput.value = "";

  try {
    const res = await fetch("http://localhost:3000/api/backup/list");
    if (!res.ok) throw new Error("Lỗi khi tải danh sách backup");

    const backups = await res.json();
    window.backupFiles = backups;

    if (backups.length === 0) {
      backupInput.placeholder = "Chưa có file backup nào";
    } else {
      backupInput.placeholder = backups[0];
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi khi tải danh sách backup!");
  }
}

// ===============================
// Browse file backup
// ===============================
function browseFile() {
  if (!window.backupFiles || window.backupFiles.length === 0) {
    alert("Chưa có file backup nào");
    return;
  }

  const fileName = prompt(
    "Chọn file backup:\n" + window.backupFiles.join("\n"),
    window.backupFiles[0]
  );

  if (fileName && window.backupFiles.includes(fileName)) {
    document.getElementById("backup-text").value = fileName;
  }
}

// ===============================
// Sao lưu dữ liệu
// ===============================
async function backupData() {
  try {
    const res = await fetch("http://localhost:3000/api/backup/create");
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Lỗi khi tạo backup");
    }

    const backupFile = await res.json();
    alert("Backup thành công: " + backupFile);
    loadBackups();
  } catch (err) {
    console.error(err);
    alert("Lỗi khi sao lưu dữ liệu!");
  }
}

// ===============================
// Phục hồi dữ liệu
// ===============================
async function restoreData() {
  const fileName = document.getElementById("backup-text").value;
  if (!fileName) {
    alert("Vui lòng chọn file backup để phục hồi!");
    return;
  }

  if (
    !confirm(
      "Bạn có chắc chắn muốn phục hồi dữ liệu từ file: " + fileName + "?"
    )
  ) {
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/backup/restore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Lỗi khi phục hồi dữ liệu");
    }

    alert("Phục hồi dữ liệu thành công!");
  } catch (err) {
    console.error(err);
    alert("Lỗi khi phục hồi dữ liệu!");
  }
}
const fileInput = document.getElementById("backup-file-input");
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    document.getElementById("backup-text").value = fileInput.files[0].name;
  }
});

// ===============================
// Load danh sách backup khi mở trang
// ===============================
window.addEventListener("DOMContentLoaded", loadBackups);
