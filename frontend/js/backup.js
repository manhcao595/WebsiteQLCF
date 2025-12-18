// ===============================
// ĐĂNG XUẤT
// ===============================
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  alert("Bạn chưa đăng nhập!");
  location.href = "login.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  location.href = "login.html";
}
// ===============================
// LOAD BACKUP (CHỈ HIỂN THỊ HƯỚNG DẪN)
// ===============================
function loadBackups() {
  const backupInput = document.getElementById("backup-text");
  backupInput.value = "";
  backupInput.placeholder = "Chọn file backup (.json) để phục hồi";
}

// ===============================
// BROWSE FILE BACKUP (TỪ MÁY)
// ===============================
function browseFile() {
  document.getElementById("backup-file-input").click();
}

// Khi chọn file
const fileInput = document.getElementById("backup-file-input");
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    document.getElementById("backup-text").value = fileInput.files[0].name;
  }
});

// ===============================
// SAO LƯU DỮ LIỆU (DOWNLOAD JSON)
// ===============================
function backupData() {
  try {
    const data = JSON.stringify(localStorage, null, 2);

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    alert("Sao lưu dữ liệu thành công!");
  } catch (err) {
    console.error(err);
    alert("Lỗi khi sao lưu dữ liệu!");
  }
}

// ===============================
// PHỤC HỒI DỮ LIỆU (IMPORT JSON)
// ===============================
function restoreData() {
  const file = fileInput.files[0];

  if (!file) {
    alert("Vui lòng chọn file backup để phục hồi!");
    return;
  }

  if (
    !confirm(
      "Phục hồi dữ liệu sẽ ghi đè toàn bộ dữ liệu hiện tại.\nBạn có chắc chắn?"
    )
  ) {
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      localStorage.clear();
      Object.keys(data).forEach((key) => {
        localStorage.setItem(key, data[key]);
      });

      alert("Phục hồi dữ liệu thành công!");
      location.reload();
    } catch (err) {
      console.error(err);
      alert("File backup không hợp lệ!");
    }
  };

  reader.readAsText(file);
}

// ===============================
// KHỞI TẠO
// ===============================
window.addEventListener("DOMContentLoaded", loadBackups);
